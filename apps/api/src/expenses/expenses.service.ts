import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, In } from "typeorm";
import { Expense, ExpenseStatus, SyncLog, User } from "@cosmo/database";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);
  private readonly BATCH_SIZE = 100;

  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(SyncLog)
    private syncLogRepository: Repository<SyncLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService
  ) {}

  /**
   * Encuentra todos los gastos de un usuario
   */
  async findAllByUserId(userId: string): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { userId },
      order: { date: "DESC" },
    });
  }

  /**
   * Busca un gasto por su ID
   */
  async findOne(id: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id } });
    if (!expense) {
      throw new Error(`Expense with id ${id} not found`);
    }
    return expense;
  }

  /**
   * Guarda un gasto en la base de datos
   */
  async create(expenseData: Partial<Expense>): Promise<Expense> {
    const expense = this.expensesRepository.create(expenseData);
    return this.expensesRepository.save(expense);
  }

  /**
   * Guarda múltiples gastos en la base de datos
   * Se utiliza para la sincronización con sistemas externos
   */
  async saveMany(expenses: Partial<Expense>[]): Promise<Expense[]> {
    this.logger.log(`Guardando ${expenses.length} gastos en la base de datos`);

    const createdExpenses = this.expensesRepository.create(expenses);
    return this.expensesRepository.save(createdExpenses);
  }

  /**
   * Busca un gasto por su sourceId (ID del sistema externo) y userId
   */
  async findBySourceId(
    sourceId: string,
    userId: string
  ): Promise<Expense | null> {
    return this.expensesRepository.findOne({
      where: {
        userId,
        metadata: { sourceId },
      },
    });
  }

  /**
   * Actualiza un gasto existente
   */
  async update(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    await this.expensesRepository.update(id, expenseData);
    const expense = await this.expensesRepository.findOne({ where: { id } });
    if (!expense) {
      throw new Error(`Expense with id ${id} not found`);
    }
    return expense;
  }

  /**
   * Elimina un gasto
   */
  async remove(id: string): Promise<void> {
    await this.expensesRepository.delete(id);
  }

  /**
   * Verifica si un gasto ha cambiado desde la última sincronización
   */
  private hasChanges(existingExpense: Expense, newExpense: any): boolean {
    const fieldsToCompare = [
      "amount",
      "description",
      "date",
      "category",
      "vendor",
    ];

    return fieldsToCompare.some(
      (field) => existingExpense[field as keyof Expense] !== newExpense[field]
    );
  }

  /**
   * Procesa un lote de gastos
   */
  private async processBatch(
    expenses: any[],
    userId: string,
    syncLog: SyncLog
  ): Promise<Expense[]> {
    const results = await Promise.all(
      expenses.map(async (expense) => {
        try {
          const existingExpense = await this.findBySourceId(
            expense.sourceId,
            userId
          );

          if (existingExpense) {
            if (this.hasChanges(existingExpense, expense)) {
              const updated = await this.update(existingExpense.id, {
                ...expense,
                metadata: {
                  ...expense.metadata,
                  lastSyncDate: new Date(),
                },
              });
              syncLog.syncStats.updatedItems++;
              return updated;
            }
            return existingExpense;
          } else {
            const newExpense = await this.create({
              ...expense,
              userId,
              metadata: {
                ...expense.metadata,
                firstSyncDate: new Date(),
                lastSyncDate: new Date(),
              },
            });
            syncLog.syncStats.newItems++;
            return newExpense;
          }
        } catch (error: any) {
          syncLog.syncStats.failedItems++;
          this.logger.error(
            `Error al sincronizar gasto ${expense.sourceId}: ${error.message}`
          );
          return null;
        }
      })
    );

    return results.filter((result): result is Expense => result !== null);
  }

  /**
   * Sincroniza gastos desde un sistema externo
   */
  async syncExpensesFromExternalSystem(
    expenses: any[],
    userId: string,
    sourceSystem: string
  ): Promise<Expense[]> {
    const startTime = Date.now();

    // Obtener el usuario para acceder a su información de compañía
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Usar el ID de compañía apropiado según el origen de datos
    let companyId: string;
    if (sourceSystem === "quickbooks" && user.quickbooksCompanyId) {
      companyId = user.quickbooksCompanyId;
    } else {
      // Si no hay ID específico para la fuente, usamos un valor generado
      companyId = `${userId}-${sourceSystem}`;
    }

    // Crear el registro de sincronización
    const syncLog = this.syncLogRepository.create({
      userId,
      companyId,
      sourceSystem,
      syncDate: new Date(),
      syncStats: {
        totalItems: expenses.length,
        newItems: 0,
        updatedItems: 0,
        failedItems: 0,
        duration: 0,
      },
      status: "in_progress",
    });

    await this.syncLogRepository.save(syncLog);

    try {
      const savedExpenses: Expense[] = [];

      // Procesar en lotes
      for (let i = 0; i < expenses.length; i += this.BATCH_SIZE) {
        const batch = expenses.slice(i, i + this.BATCH_SIZE);
        const batchResults = await this.processBatch(batch, userId, syncLog);
        savedExpenses.push(...batchResults);
      }

      // Actualizar el log de sincronización
      syncLog.status = "completed";
      syncLog.syncStats.duration = Date.now() - startTime;
      await this.syncLogRepository.save(syncLog);

      return savedExpenses;
    } catch (error: any) {
      // Actualizar el log con el error
      syncLog.status = "failed";
      syncLog.error = error.message;
      syncLog.syncStats.duration = Date.now() - startTime;
      await this.syncLogRepository.save(syncLog);

      throw error;
    }
  }

  /**
   * Obtiene el historial de sincronización para un usuario
   */
  async getSyncHistory(userId: string, limit: number = 10): Promise<SyncLog[]> {
    return this.syncLogRepository.find({
      where: { userId },
      order: { syncDate: "DESC" },
      take: limit,
    });
  }

  /**
   * Limpia datos antiguos según la política de retención
   */
  async cleanupOldData(): Promise<void> {
    const retentionPeriod = this.configService.get<number>(
      "DATA_RETENTION_DAYS",
      365
    );
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

    // Archivar gastos antiguos
    await this.expensesRepository.update(
      {
        date: LessThan(cutoffDate),
        status: In(["pending", "approved", "rejected"]),
      },
      { status: "archived" as ExpenseStatus }
    );

    // Limpiar logs de sincronización antiguos
    await this.syncLogRepository.delete({
      syncDate: LessThan(cutoffDate),
    });
  }
}

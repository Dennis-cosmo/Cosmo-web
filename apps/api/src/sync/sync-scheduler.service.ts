import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull } from "typeorm";
import { User } from "@cosmo/database";
import { ExpensesService } from "../expenses/expenses.service";
import { DataRetentionService } from "./data-retention.service";

@Injectable()
export class SyncSchedulerService {
  private readonly logger = new Logger(SyncSchedulerService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private expensesService: ExpensesService,
    private dataRetentionService: DataRetentionService
  ) {}

  /**
   * Programa la sincronización diaria de datos
   * Se ejecuta a medianoche todos los días
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: "dailySyncScheduler" })
  async scheduleDailySync() {
    this.logger.log("Iniciando sincronización programada diaria");

    try {
      // Obtener todos los usuarios activos con integración de QuickBooks
      const users = await this.userRepository.find({
        where: {
          isActive: true,
          quickbooksCompanyId: Not(IsNull()),
        },
      });

      this.logger.log(`Encontrados ${users.length} usuarios para sincronizar`);

      for (const user of users) {
        try {
          await this.syncUserData(user);
        } catch (error: any) {
          this.logger.error(
            `Error al sincronizar datos del usuario ${user.id}: ${error.message}`
          );
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Error en la sincronización programada: ${error.message}`
      );
    }
  }

  /**
   * Sincroniza los datos de un usuario específico
   */
  private async syncUserData(user: User) {
    this.logger.log(`Sincronizando datos para el usuario ${user.id}`);

    try {
      // Obtener la última fecha de sincronización
      const lastSync = await this.expensesService.getSyncHistory(user.id, 1);
      const lastSyncDate = lastSync[0]?.syncDate;

      // Si no hay sincronización previa o la última fue hace más de 24 horas
      if (!lastSyncDate || this.isSyncNeeded(lastSyncDate)) {
        // Obtener gastos desde QuickBooks
        const expenses = await this.fetchQuickBooksExpenses(user);

        // Sincronizar con la base de datos
        await this.expensesService.syncExpensesFromExternalSystem(
          expenses,
          user.id,
          "quickbooks"
        );

        this.logger.log(`Sincronización completada para el usuario ${user.id}`);
      } else {
        this.logger.log(
          `No es necesario sincronizar para el usuario ${user.id} - última sincronización: ${lastSyncDate}`
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Error al sincronizar datos del usuario ${user.id}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Verifica si es necesario sincronizar basado en la última fecha de sincronización
   */
  private isSyncNeeded(lastSyncDate: Date): boolean {
    const now = new Date();
    const hoursSinceLastSync =
      (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync >= 24;
  }

  /**
   * Obtiene los gastos de QuickBooks para un usuario
   */
  private async fetchQuickBooksExpenses(user: User): Promise<any[]> {
    // Aquí implementaríamos la lógica para obtener los gastos de QuickBooks
    // usando el token de acceso almacenado para el usuario
    // Por ahora retornamos un array vacío
    return [];
  }
}

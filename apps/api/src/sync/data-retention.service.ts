import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Expense, SyncLog } from "@cosmo/database";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);
  private readonly retentionPeriod: number;

  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(SyncLog)
    private syncLogRepository: Repository<SyncLog>,
    private configService: ConfigService
  ) {
    // Obtener el período de retención desde la configuración (por defecto 365 días)
    this.retentionPeriod = this.configService.get<number>(
      "DATA_RETENTION_DAYS",
      365
    );
  }

  /**
   * Programa la limpieza mensual de datos antiguos
   * Se ejecuta el primer día de cada mes a las 3 AM
   */
  @Cron("0 3 1 * *", { name: "monthlyDataRetention" })
  async cleanupOldData() {
    this.logger.log("Iniciando limpieza de datos antiguos");

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionPeriod);

      // Archivar gastos antiguos
      await this.archiveOldExpenses(cutoffDate);

      // Eliminar logs de sincronización antiguos
      await this.deleteOldSyncLogs(cutoffDate);

      this.logger.log("Limpieza de datos completada exitosamente");
    } catch (error: any) {
      this.logger.error(`Error en la limpieza de datos: ${error.message}`);
    }
  }

  /**
   * Archiva gastos antiguos
   */
  private async archiveOldExpenses(cutoffDate: Date) {
    try {
      const result = await this.expenseRepository.update(
        {
          date: LessThan(cutoffDate),
          status: "approved",
        },
        {
          status: "archived",
        }
      );

      this.logger.log(`Archivados ${result.affected} gastos antiguos`);
    } catch (error: any) {
      this.logger.error(`Error al archivar gastos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina logs de sincronización antiguos
   */
  private async deleteOldSyncLogs(cutoffDate: Date) {
    try {
      const result = await this.syncLogRepository.delete({
        syncDate: LessThan(cutoffDate),
      });

      this.logger.log(
        `Eliminados ${result.affected} logs de sincronización antiguos`
      );
    } catch (error: any) {
      this.logger.error(
        `Error al eliminar logs de sincronización: ${error.message}`
      );
      throw error;
    }
  }
}

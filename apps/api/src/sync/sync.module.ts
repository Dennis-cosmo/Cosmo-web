import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { User, Expense, SyncLog } from "@cosmo/database";
import { SyncSchedulerService } from "./sync-scheduler.service";
import { DataRetentionService } from "./data-retention.service";
import { ExpensesModule } from "../expenses/expenses.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    TypeOrmModule.forFeature([User, Expense, SyncLog]),
    ExpensesModule,
  ],
  providers: [SyncSchedulerService, DataRetentionService],
  exports: [SyncSchedulerService, DataRetentionService],
})
export class SyncModule {}

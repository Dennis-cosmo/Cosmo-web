import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Expense, SyncLog, User } from "@cosmo/database";
import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [TypeOrmModule.forFeature([Expense, SyncLog, User]), ConfigModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}

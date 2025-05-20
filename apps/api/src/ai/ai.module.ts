import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AiController } from "./ai.controller";
import { AiService } from "./services/ai.service";
import { AiCacheService } from "./services/ai-cache.service";
import { ExpenseClassifierService } from "./services/expense-classifier.service";
import { AiCache } from "./entities/ai-cache.entity";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AiCache])],
  controllers: [AiController],
  providers: [AiService, AiCacheService, ExpenseClassifierService],
  exports: [AiService, AiCacheService, ExpenseClassifierService],
})
export class AiModule {}

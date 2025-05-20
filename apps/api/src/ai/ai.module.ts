import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AiController } from "./ai.controller";
import { AiService } from "./services/ai.service";
import { AiCacheService } from "./services/ai-cache.service";
import { ExpenseClassifierService } from "./services/expense-classifier.service";
import { AiCache } from "./entities/ai-cache.entity";
import { OpenAiProvider } from "./providers/openai.provider";
import { DeepSeekProvider } from "./providers/deepseek.provider";
import { AiProviderFactory } from "./services/ai-provider.factory";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AiCache])],
  controllers: [AiController],
  providers: [
    AiService,
    AiCacheService,
    ExpenseClassifierService,
    OpenAiProvider,
    DeepSeekProvider,
    AiProviderFactory,
  ],
  exports: [
    AiService,
    AiCacheService,
    ExpenseClassifierService,
    AiProviderFactory,
  ],
})
export class AiModule {}

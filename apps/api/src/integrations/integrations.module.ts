import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { User } from "@cosmo/database";
import { QuickBooksService } from "./quickbooks/quickbooks.service";
import { QuickBooksController } from "./quickbooks/quickbooks.controller";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  providers: [QuickBooksService],
  controllers: [QuickBooksController],
  exports: [QuickBooksService],
})
export class IntegrationsModule {}

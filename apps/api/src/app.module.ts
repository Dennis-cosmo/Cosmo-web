import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSource } from "@cosmo/database";
import { User, Expense, Report } from "@cosmo/database";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { ReportsModule } from "./reports/reports.module";
import { AiModule } from "./ai/ai.module";
import { TaxonomyModule } from "./taxonomy/taxonomy.module";
import { LeadsModule } from "./leads/leads.module";
import { CompanyLead } from "./leads/entities/company-lead.entity";

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión a la base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("DATABASE_URL"),
        entities: [User, Expense, Report, CompanyLead],
        migrations: dataSource.options.migrations,
        logging: configService.get<string>("NODE_ENV") === "development",
        synchronize: true,
        // synchronize: configService.get<string>("NODE_ENV") === "development",
      }),
    }),

    // Limitador de tasa para evitar abusos
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    ExpensesModule,
    ReportsModule,
    AiModule,
    TaxonomyModule,
    LeadsModule,
  ],
  controllers: [AppController],
  providers: [
    // Aplicar limitador de tasa globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

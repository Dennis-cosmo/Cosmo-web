import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as path from "path";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("DATABASE_URL"),
        entities: [path.join(__dirname, "entities/**/*.entity{.ts,.js}")],
        migrations: [path.join(__dirname, "migrations/**/*{.ts,.js}")],
        autoLoadEntities: true,
        synchronize: configService.get<string>("NODE_ENV") === "development",
        logging: configService.get<string>("NODE_ENV") === "development",
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

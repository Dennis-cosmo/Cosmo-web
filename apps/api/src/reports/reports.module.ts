import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "@cosmo/database";

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ReportsModule {}

"use client";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeadsService } from "./leads.service";
import { LeadsController } from "./leads.controller";
import { CompanyLead } from "./entities/company-lead.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CompanyLead])],
  providers: [LeadsService],
  controllers: [LeadsController],
})
export class LeadsModule {}

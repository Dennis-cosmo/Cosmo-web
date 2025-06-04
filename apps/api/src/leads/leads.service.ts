import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { CompanyLead } from "./entities/company-lead.entity";
import { CreateCompanyLeadDto } from "./dto/create-company-lead.dto";

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(CompanyLead)
    private leadsRepository: Repository<CompanyLead>
  ) {}

  async create(createLeadDto: CreateCompanyLeadDto): Promise<CompanyLead> {
    const lead = this.leadsRepository.create(createLeadDto);
    return this.leadsRepository.save(lead);
  }
}

import { Body, Controller, Post } from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { CreateCompanyLeadDto } from "./dto/create-company-lead.dto";
import { CompanyLead } from "./entities/company-lead.entity";

@Controller("leads")
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(
    @Body() createLeadDto: CreateCompanyLeadDto
  ): Promise<CompanyLead> {
    return this.leadsService.create(createLeadDto);
  }
}

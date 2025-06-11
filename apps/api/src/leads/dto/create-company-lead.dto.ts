import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateCompanyLeadDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  companyName!: string;

  @IsNotEmpty()
  @IsEmail()
  contactEmail!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  contactName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

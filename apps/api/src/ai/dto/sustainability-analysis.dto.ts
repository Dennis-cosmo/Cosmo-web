import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsObject, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AiOptionsDto } from "./expense-classification.dto";

/**
 * DTO para datos de usuario para contextualizar el análisis
 */
export class UserContextDto {
  @ApiProperty({ description: "IDs de sectores de taxonomía EU del usuario" })
  @IsArray()
  @IsOptional()
  euTaxonomySectorIds?: number[];

  @ApiProperty({
    description: "Nombres de sectores de taxonomía EU del usuario",
  })
  @IsArray()
  @IsOptional()
  euTaxonomySectorNames?: string[];

  @ApiProperty({ description: "Actividades de taxonomía EU del usuario" })
  @IsArray()
  @IsOptional()
  euTaxonomyActivities?: any[];

  @ApiProperty({ description: "Nombre de la empresa" })
  @IsOptional()
  companyName?: string;
}

/**
 * DTO para el análisis de sostenibilidad de gastos
 */
export class SustainabilityAnalysisDto {
  @ApiProperty({ description: "Lista de gastos a analizar" })
  @IsArray()
  expenses!: any[];

  @ApiProperty({ description: "Información contextual del usuario" })
  @IsObject()
  @ValidateNested()
  @Type(() => UserContextDto)
  userContext!: UserContextDto;

  @ApiProperty({
    required: false,
    description: "Opciones para el procesamiento de IA",
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AiOptionsDto)
  options?: AiOptionsDto;
}

/**
 * DTO para los resultados del análisis de sostenibilidad
 */
export class SustainabilityAnalysisResultDto {
  @ApiProperty({ description: "Gastos clasificados como sostenibles" })
  sustainableExpenses!: any[];

  @ApiProperty({ description: "Gastos clasificados como no sostenibles" })
  nonSustainableExpenses!: any[];

  @ApiProperty({ description: "Total de gastos sostenibles" })
  sustainableTotal!: number;

  @ApiProperty({ description: "Total de gastos no sostenibles" })
  nonSustainableTotal!: number;

  @ApiProperty({ description: "Porcentaje de gastos sostenibles" })
  sustainablePercentage!: number;

  @ApiProperty({
    description: "Recomendaciones para mejorar la sostenibilidad",
  })
  recommendations!: string[];

  @ApiProperty({ description: "Información del modelo utilizado" })
  model!: string;

  @ApiProperty({ description: "Información de uso del modelo" })
  usage!: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

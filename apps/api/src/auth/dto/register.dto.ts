import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  IsBoolean,
  Matches,
  IsNumber,
  IsObject,
  ValidateNested,
  ArrayMaxSize,
} from "class-validator";
import { Type } from "class-transformer";

// Definimos los niveles de sostenibilidad localmente para evitar problemas de importación
export enum SustainabilityLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  LEADER = "leader",
}

// DTO para actividades económicas según la taxonomía de la UE
export class EconomicActivityDto {
  @IsNumber({}, { message: "El ID de la actividad debe ser un número" })
  id: number;

  @IsString({
    message: "El nombre de la actividad debe ser una cadena de texto",
  })
  name: string;

  @IsOptional()
  @IsArray({ message: "Los códigos NACE deben ser un array" })
  naceCodes?: string[];

  @IsNumber({}, { message: "El ID del sector debe ser un número" })
  sectorId: number;

  @IsOptional()
  @IsString({ message: "El nombre del sector debe ser una cadena de texto" })
  sectorName?: string;
}

export class RegisterDto {
  @IsEmail({}, { message: "El email debe ser válido" })
  @IsNotEmpty({ message: "El email es requerido" })
  email: string;

  @IsNotEmpty({ message: "La contraseña es requerida" })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  password: string;

  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString({ message: "El nombre debe ser una cadena de texto" })
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
  firstName: string;

  @IsNotEmpty({ message: "El apellido es requerido" })
  @IsString({ message: "El apellido debe ser una cadena de texto" })
  @MinLength(2, { message: "El apellido debe tener al menos 2 caracteres" })
  lastName: string;

  // Información de la empresa
  @IsOptional()
  @IsString({ message: "El nombre de la empresa debe ser una cadena de texto" })
  companyName?: string;

  @IsOptional()
  @IsString({
    message: "El nombre legal de la empresa debe ser una cadena de texto",
  })
  companyLegalName?: string;

  @IsOptional()
  @IsString({ message: "El ID fiscal debe ser una cadena de texto" })
  taxId?: string;

  @IsOptional()
  @IsString({ message: "El tamaño de la empresa debe ser una cadena de texto" })
  companySize?: string;

  @IsOptional()
  @IsString({ message: "La industria debe ser una cadena de texto" })
  industry?: string;

  @IsOptional()
  @IsUrl({}, { message: "El sitio web debe ser una URL válida" })
  website?: string;

  @IsOptional()
  @IsString({ message: "El país debe ser una cadena de texto" })
  country?: string;

  @IsOptional()
  @IsString({ message: "La dirección debe ser una cadena de texto" })
  address?: string;

  // Taxonomía de la UE
  @IsOptional()
  @IsArray({ message: "Los IDs de sectores deben ser un array" })
  euTaxonomySectorIds?: number[];

  @IsOptional()
  @IsArray({ message: "Los nombres de sectores deben ser un array" })
  euTaxonomySectorNames?: string[];

  @IsOptional()
  @IsArray({ message: "Las actividades económicas deben ser un array" })
  @ArrayMaxSize(3, { message: "Máximo 3 actividades económicas permitidas" })
  @ValidateNested({ each: true })
  @Type(() => EconomicActivityDto)
  euTaxonomyActivities?: EconomicActivityDto[];

  // Información de sostenibilidad
  @IsOptional()
  @IsEnum(SustainabilityLevel, {
    message:
      "El nivel de sostenibilidad debe ser uno de los siguientes: beginner, intermediate, advanced, leader",
  })
  sustainabilityLevel?: string;

  @IsOptional()
  @IsArray({ message: "Los objetivos de sostenibilidad deben ser un array" })
  sustainabilityGoals?: string[];

  @IsOptional()
  @IsArray({ message: "Las certificaciones deben ser un array" })
  certifications?: string[];

  @IsOptional()
  @IsString({ message: "El rango de presupuesto debe ser una cadena de texto" })
  sustainabilityBudgetRange?: string;

  @IsOptional()
  @IsString({ message: "Las notas de sostenibilidad deben ser texto" })
  sustainabilityNotes?: string;

  // Verificación y aceptación
  @IsOptional()
  @IsBoolean({ message: "La aceptación de términos debe ser un booleano" })
  acceptTerms?: boolean;
}

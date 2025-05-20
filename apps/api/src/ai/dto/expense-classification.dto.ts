import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO para opciones de la solicitud IA
 */
export class AiOptionsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: "Modelo de OpenAI a utilizar",
    default: "gpt-4o",
  })
  model?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: "Temperatura para la generación (0-1)",
    default: 0.3,
  })
  temperature?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: "Número máximo de tokens a generar",
    default: 2000,
  })
  maxTokens?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: "Instrucción de sistema para guiar al modelo",
  })
  systemInstruction?: string;
}

/**
 * DTO para datos de gasto a clasificar
 */
export class ExpenseDataDto {
  @IsString()
  @ApiProperty({ description: "Identificador único del gasto" })
  id: string;

  @IsString()
  @ApiProperty({ description: "Fecha del gasto en formato ISO" })
  date: string;

  @IsString()
  @ApiProperty({ description: "Descripción del gasto" })
  description: string;

  @IsNumber()
  @ApiProperty({ description: "Monto del gasto" })
  amount: number;

  @IsString()
  @ApiProperty({ description: "Moneda del gasto" })
  currency: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Categoría del gasto" })
  category?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Proveedor o comercio" })
  supplier?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: "Notas adicionales sobre el gasto",
  })
  notes?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: "Método de pago utilizado" })
  paymentMethod?: string;
}

/**
 * DTO para solicitud de clasificación de gasto
 */
export class ExpenseClassificationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ExpenseDataDto)
  @ApiProperty({ description: "Datos del gasto a clasificar" })
  expense: ExpenseDataDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AiOptionsDto)
  @ApiProperty({
    required: false,
    description: "Opciones para el procesamiento de IA",
  })
  options?: AiOptionsDto;
}

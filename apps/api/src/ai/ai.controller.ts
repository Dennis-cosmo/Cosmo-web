import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Logger,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ExpenseClassifierService } from "./services/expense-classifier.service";
import { ExpenseClassificationDto } from "./dto/expense-classification.dto";
import { TaxonomyClassificationResponse } from "./interfaces/ai-response.interface";
import { AiService } from "./services/ai.service";
import { AiProviderType } from "./services/ai-provider.factory";

@ApiTags("ai")
@Controller("ai")
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly expenseClassifierService: ExpenseClassifierService,
    private readonly aiService: AiService
  ) {}

  @Post("classify-expense")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Clasifica un gasto según la taxonomía verde de la UE",
  })
  @ApiResponse({
    status: 200,
    description: "El gasto ha sido clasificado exitosamente",
    type: Object,
  })
  async classifyExpense(
    @Body() dto: ExpenseClassificationDto
  ): Promise<TaxonomyClassificationResponse> {
    return this.expenseClassifierService.classifyExpense(dto);
  }

  @Post("classify-expenses")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Clasifica múltiples gastos según la taxonomía verde de la UE",
  })
  @ApiResponse({
    status: 200,
    description: "Los gastos han sido clasificados exitosamente",
    type: Object,
  })
  async classifyExpenses(
    @Body() dtos: ExpenseClassificationDto[]
  ): Promise<Record<string, TaxonomyClassificationResponse>> {
    return this.expenseClassifierService.classifyExpenses(dtos);
  }

  @Get("test")
  @ApiOperation({
    summary: "Prueba de conexión con IA (OpenAI o DeepSeek)",
  })
  @ApiResponse({
    status: 200,
    description: "Prueba de IA ejecutada correctamente",
    type: Object,
  })
  @ApiQuery({
    name: "provider",
    required: false,
    enum: ["openai", "deepseek", "mock"],
    description: "Proveedor de IA a utilizar",
  })
  async testAi(
    @Query("provider") provider?: "openai" | "deepseek" | "mock"
  ): Promise<{ success: boolean; result: any }> {
    try {
      this.logger.log(
        `Iniciando prueba de conexión con IA. Proveedor: ${provider || "predeterminado"}`
      );

      // Si se solicita respuesta simulada, evitamos llamadas a la API
      if (provider === "mock") {
        // Simulación de respuesta para evitar llamadas reales a las API
        const mockResponse = {
          isGreen: true,
          taxonomyCategory: "Energía renovable",
          taxonomyCode: "4.1",
          confidenceScore: 0.95,
          explanation: "Respuesta simulada para prueba del módulo de IA",
          sustainableDevelopmentGoals: [
            "ODS 7: Energía asequible y no contaminante",
            "ODS 13: Acción por el clima",
          ],
          model: "mock-model",
          usage: {
            promptTokens: 150,
            completionTokens: 100,
            totalTokens: 250,
          },
          processingTime: 500,
        };

        this.logger.log(
          "Utilizando respuesta simulada para evitar límites de API."
        );
        return {
          success: true,
          result: mockResponse,
        };
      }

      // Configuración de la consulta real con el proveedor seleccionado
      const testData = {
        query:
          "¿Cuáles son los principales objetivos de la taxonomía verde de la UE?",
      };

      const prompt =
        "Responde la siguiente pregunta con un breve resumen informativo de 3-5 puntos clave:";

      // Usar el proveedor específico si se proporciona, o el predeterminado si no
      const providerType =
        provider === "openai" || provider === "deepseek"
          ? (provider as AiProviderType)
          : undefined;

      const result = await this.aiService.processWithAI(
        testData,
        prompt,
        {
          systemInstruction:
            "Eres un experto en sostenibilidad y finanzas verdes. Proporciona información precisa y concisa.",
          temperature: 0.3,
          maxTokens: 500,
        },
        providerType
      );

      this.logger.log(
        `Respuesta de ${providerType || "IA predeterminada"} recibida.`
      );

      return {
        success: true,
        result,
      };
    } catch (error: any) {
      this.logger.error(`Error al probar la conexión con IA: ${error.message}`);
      return {
        success: false,
        result: { error: error.message },
      };
    }
  }

  @Get("providers")
  @ApiOperation({
    summary: "Lista los proveedores de IA disponibles",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de proveedores disponibles",
    type: Object,
  })
  getAvailableProviders(): { providers: string[] } {
    const providers = this.aiService.getAvailableProviders();
    return { providers };
  }
}

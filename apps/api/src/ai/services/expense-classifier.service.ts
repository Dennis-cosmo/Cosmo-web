import { Injectable, Logger } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiCacheService } from "./ai-cache.service";
import { TaxonomyClassificationResponse } from "../interfaces/ai-response.interface";
import { ExpenseClassificationRequest } from "../interfaces/ai-request.interface";

@Injectable()
export class ExpenseClassifierService {
  private readonly logger = new Logger(ExpenseClassifierService.name);

  constructor(
    private aiService: AiService,
    private aiCacheService: AiCacheService
  ) {}

  /**
   * Clasifica un gasto según la taxonomía verde de la UE
   * @param expense Datos del gasto a clasificar
   * @returns Clasificación de taxonomía verde
   */
  async classifyExpense(
    request: ExpenseClassificationRequest
  ): Promise<TaxonomyClassificationResponse> {
    try {
      // Intentar obtener resultado del caché primero
      const cachedResult =
        await this.aiCacheService.getCachedResult<TaxonomyClassificationResponse>(
          request.expense,
          this.buildExpensePrompt()
        );

      if (cachedResult) {
        this.logger.debug(
          `Usando resultado en caché para el gasto ${request.expense.id}`
        );
        return cachedResult;
      }

      // Construir el prompt específico para clasificación de taxonomía verde
      const prompt = this.buildExpensePrompt();

      // Sistema de instrucciones específico para análisis de taxonomía
      const systemInstruction = `Eres un experto en finanzas sostenibles y taxonomía verde de la UE. 
        Tu tarea es analizar gastos financieros y clasificarlos según los criterios de la taxonomía verde de la UE.
        Debes determinar si un gasto contribuye a objetivos ambientales como mitigación del cambio climático,
        adaptación al cambio climático, uso sostenible del agua, economía circular, prevención de la contaminación,
        o protección de la biodiversidad. Proporciona siempre un resultado estructurado con explicaciones claras.`;

      // Procesar con IA
      const result = await this.aiService.processWithAI<
        typeof request.expense,
        TaxonomyClassificationResponse
      >(request.expense, prompt, {
        ...request.options,
        systemInstruction,
      });

      // Guardar resultado en caché
      await this.aiCacheService.cacheResult(
        request.expense,
        prompt,
        result,
        {
          promptTokens: result.usage?.promptTokens,
          completionTokens: result.usage?.completionTokens,
          totalTokens: result.usage?.totalTokens,
          model: result.model,
        },
        24 // TTL de 24 horas
      );

      return result;
    } catch (error: any) {
      this.logger.error(`Error al clasificar gasto: ${error.message}`);
      // En caso de error, devolver una respuesta básica
      return {
        isGreen: false,
        confidenceScore: 0,
        explanation: `Error al procesar: ${error.message}`,
        model: "error",
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    }
  }

  /**
   * Clasifica múltiples gastos en lote
   * @param expenses Lista de gastos a clasificar
   * @returns Mapa de resultados de clasificación indexados por ID de gasto
   */
  async classifyExpenses(
    expenses: ExpenseClassificationRequest[]
  ): Promise<Record<string, TaxonomyClassificationResponse>> {
    const results: Record<string, TaxonomyClassificationResponse> = {};

    // Procesamiento secuencial para evitar saturar la API de OpenAI
    for (const request of expenses) {
      try {
        results[request.expense.id] = await this.classifyExpense(request);
      } catch (error: any) {
        this.logger.error(
          `Error al procesar gasto ${request.expense.id}: ${error.message}`
        );

        // En caso de error, incluir respuesta básica
        results[request.expense.id] = {
          isGreen: false,
          confidenceScore: 0,
          explanation: `Error al procesar: ${error.message}`,
          model: "error",
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
          },
        };
      }
    }

    return results;
  }

  /**
   * Construye el prompt para análisis de taxonomía verde
   */
  private buildExpensePrompt(): string {
    return `
      Analiza el siguiente gasto financiero y determina si cumple con los criterios de la taxonomía verde de la Unión Europea.
      
      Instrucciones específicas:
      1. Determina si el gasto contribuye a alguno de los siguientes objetivos ambientales:
         - Mitigación del cambio climático
         - Adaptación al cambio climático
         - Uso sostenible y protección del agua
         - Transición a una economía circular
         - Prevención y control de la contaminación
         - Protección y restauración de la biodiversidad y los ecosistemas
      
      2. Evalúa si el gasto cumple el principio de "no causar daño significativo" (DNSH) a los otros objetivos.
      
      3. Proporciona una explicación clara de la clasificación con referencias específicas a:
         - Categoría de taxonomía aplicable
         - Código de taxonomía si puedes identificarlo
         - Razones para la clasificación
      
      4. Ofrece un puntaje de confianza entre 0 y 1, donde:
         - 0.9-1.0: Muy alta confianza en la clasificación
         - 0.7-0.9: Alta confianza
         - 0.5-0.7: Confianza moderada
         - 0.3-0.5: Baja confianza
         - 0.0-0.3: Muy baja confianza / datos insuficientes
      
      5. Si el gasto NO es verde, sugiere alternativas más sostenibles.
      
      Proporciona tu análisis en formato JSON estructurado.
    `;
  }
}

import { Injectable, Logger } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiCacheService } from "./ai-cache.service";
import { SustainabilityAnalysisResultDto } from "../dto/sustainability-analysis.dto";

@Injectable()
export class SustainabilityAnalyzerService {
  private readonly logger = new Logger(SustainabilityAnalyzerService.name);

  constructor(
    private aiService: AiService,
    private aiCacheService: AiCacheService
  ) {}

  /**
   * Analiza gastos para determinar cuáles son sostenibles según la taxonomía verde EU
   * @param expenses Lista de gastos a analizar
   * @param userContext Contexto del usuario (sectores, actividades económicas, etc.)
   * @param options Opciones adicionales para la IA
   * @returns Análisis de sostenibilidad de los gastos
   */
  async analyzeSustainability(
    expenses: any[],
    userContext: any,
    options?: any
  ): Promise<SustainabilityAnalysisResultDto> {
    try {
      // Validar datos de entrada
      if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
        throw new Error("La lista de gastos está vacía o es inválida");
      }

      if (!userContext) {
        throw new Error("El contexto del usuario es requerido");
      }

      // Intentar obtener resultado del caché
      const cachedResult =
        await this.aiCacheService.getCachedResult<SustainabilityAnalysisResultDto>(
          { expenses, userContext },
          this.buildSustainabilityPrompt()
        );

      if (cachedResult) {
        this.logger.debug(
          "Usando resultado en caché para el análisis de sostenibilidad"
        );
        return cachedResult;
      }

      // Construir el prompt con instrucciones específicas
      const prompt = this.buildSustainabilityPrompt();

      // Sistema de instrucciones para el análisis de sostenibilidad
      const systemInstruction = `Eres un experto en finanzas sostenibles, taxonomía verde de la UE y análisis de gastos corporativos.
      Tu tarea es analizar una lista de gastos corporativos y determinar cuáles son sostenibles según criterios de la taxonomía verde de la UE.
      Debes considerar el sector y actividades económicas de la empresa para contextualizar tu análisis.
      Proporciona un resultado estructurado que clasifique cada gasto como sostenible o no sostenible, explicando brevemente las razones.`;

      // Preparar los datos para el análisis
      const expensesForAI = expenses.map((exp: any) => ({
        id: exp.id,
        description: String(exp.description ?? ""),
        date: String(exp.date ?? ""),
        amount: String(exp.amount ?? ""),
        currency: String(exp.currency ?? ""),
        category: String(exp.category ?? ""),
        supplier: String(exp.supplier ?? ""),
        notes: String(exp.notes ?? ""),
        paymentMethod: String(exp.paymentMethod ?? ""),
      }));
      const requestData = {
        expenses: expensesForAI,
        userContext,
      };

      // Procesar con IA con timeout
      const IA_TIMEOUT_MS = 90000; // 90 segundos
      let resultRaw: any;
      try {
        resultRaw = await Promise.race([
          this.aiService.processWithAI<typeof requestData, any>(
            requestData,
            prompt,
            {
              ...options,
              systemInstruction,
              responseFormat: "json_object",
            }
          ),
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error("Timeout: la IA tardó demasiado en responder")
                ),
              IA_TIMEOUT_MS
            )
          ),
        ]);
      } catch (err) {
        const errMsg =
          err && typeof err === "object" && "message" in err
            ? (err as any).message
            : String(err);
        this.logger.error(`Error o timeout en la llamada a la IA: ${errMsg}`);
        throw new Error(
          "El análisis de sostenibilidad tardó demasiado o falló. Intenta de nuevo más tarde."
        );
      }

      // Loguear la respuesta cruda de la IA para depuración (sin backticks)
      let rawLog =
        typeof resultRaw === "string" ? resultRaw : JSON.stringify(resultRaw);
      rawLog = rawLog.replace(/^```json|```$/g, "").trim();
      this.logger.log(`Respuesta cruda de la IA: ${rawLog}`);

      // Si la respuesta ya es un objeto válido, usarlo directamente
      let result = resultRaw;
      if (typeof resultRaw === "string") {
        // Intentar extraer JSON del texto
        const extracted = this.extractJsonFromText(resultRaw);
        if (!extracted) {
          this.logger.error(
            `Respuesta IA no contiene JSON válido: ${resultRaw}`
          );
          throw new Error(
            "La respuesta de la IA no tiene el formato esperado (no se pudo extraer JSON)"
          );
        }
        result = extracted;
      }

      // Validar la estructura de la respuesta
      if (!this.isValidAnalysisResult(result)) {
        this.logger.error(
          `Respuesta IA con formato incorrecto: ${JSON.stringify(result)}`
        );
        throw new Error("La respuesta de la IA no tiene el formato esperado");
      }

      // Asegurar que usage y model existan para evitar errores en el frontend
      if (!("usage" in result)) result.usage = {};
      if (!("model" in result)) result.model = null;

      // Guardar resultado en caché
      await this.aiCacheService.cacheResult(
        { expenses, userContext },
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
      this.logger.error(
        `Error al analizar sostenibilidad: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Valida que la respuesta tenga la estructura esperada
   */
  private isValidAnalysisResult(result: any): boolean {
    return (
      result &&
      Array.isArray(result.sustainableExpenses) &&
      Array.isArray(result.nonSustainableExpenses) &&
      typeof result.sustainableTotal === "number" &&
      typeof result.nonSustainableTotal === "number" &&
      typeof result.sustainablePercentage === "number" &&
      Array.isArray(result.recommendations)
    );
  }

  /**
   * Construye el prompt para análisis de sostenibilidad
   */
  private buildSustainabilityPrompt(): string {
    return `
      Analiza la siguiente lista de gastos empresariales y determina cuáles son sostenibles según la taxonomía verde de la Unión Europea.

      Instrucciones:
      1. Utiliza la información del contexto del usuario (sector económico y actividades) para comprender mejor el tipo de empresa.
      2. Para cada gasto, evalúa:
         - Si contribuye positivamente a objetivos ambientales según la taxonomía UE.
         - Si cumple con el principio "no causar daño significativo" (DNSH).
         - Si está alineado con las actividades sostenibles del sector de la empresa.
      3. Clasifica cada gasto como "sostenible" o "no sostenible" según estos criterios.
      4. Para gastos sostenibles, identifica qué objetivos ambientales apoyan:
         - Mitigación del cambio climático
         - Adaptación al cambio climático
         - Uso sostenible del agua
         - Economía circular
         - Prevención de la contaminación
         - Protección de ecosistemas
      5. Para gastos no sostenibles, sugiere alternativas más sostenibles cuando sea posible.
      6. Calcula el total monetario y porcentaje para ambas categorías.
      7. Proporciona 3-5 recomendaciones específicas para mejorar la sostenibilidad de los gastos.

      IMPORTANTE:
      - Responde ÚNICAMENTE con un JSON válido, sin explicaciones ni texto adicional.
      - No incluyas ningún comentario ni explicación fuera del JSON.
      - No incluyas ningún texto antes o después del JSON.
      - El JSON debe tener la siguiente estructura exacta:
      {
        "sustainableExpenses": [array de gastos sostenibles con sus razones],
        "nonSustainableExpenses": [array de gastos no sostenibles con sus razones],
        "sustainableTotal": número (suma de gastos sostenibles),
        "nonSustainableTotal": número (suma de gastos no sostenibles),
        "sustainablePercentage": número (porcentaje de gastos sostenibles),
        "recommendations": [array de recomendaciones de mejora]
      }
    `;
  }

  /**
   * Extrae el primer bloque JSON válido de un texto
   */
  private extractJsonFromText(text: string): any | null {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      // Aquí podrías intentar limpiar el texto o usar una librería como 'jsonrepair'
      return null;
    }
  }
}

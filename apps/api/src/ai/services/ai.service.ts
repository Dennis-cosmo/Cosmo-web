import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration, OpenAIApi } from "openai";
import { AiRequestOptions } from "../interfaces/ai-request.interface";

@Injectable()
export class AiService {
  private openai: OpenAIApi;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    // Inicializar cliente de OpenAI con la clave API desde las variables de entorno
    const configuration = new Configuration({
      apiKey: this.configService.get<string>("OPENAI_API_KEY"),
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Método genérico para procesar datos con IA
   * @param data Los datos a procesar
   * @param prompt El prompt base para procesar los datos
   * @param options Opciones adicionales
   * @returns Respuesta procesada por la IA
   */
  async processWithAI<T, R>(
    data: T,
    prompt: string,
    options: AiRequestOptions = {}
  ): Promise<R> {
    const startTime = Date.now();

    // Obtener opciones con valores por defecto de las variables de entorno
    const {
      model = this.configService.get<string>("OPENAI_MODEL") || "gpt-4o",
      temperature = 0.3,
      maxTokens = this.configService.get<number>("OPENAI_MAX_TOKENS") || 2000,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      systemInstruction = "Analiza los siguientes datos y proporciona un resultado estructurado.",
    } = options;

    try {
      // Crear la solicitud a la API de OpenAI
      const messages = [
        { role: "system", content: systemInstruction },
        {
          role: "user",
          content: `${prompt}\n\nDatos: ${JSON.stringify(data, null, 2)}`,
        },
      ];

      const completion = await this.openai.createChatCompletion({
        model,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        messages: messages as any,
      });

      const responseContent = completion.data.choices[0]?.message?.content;
      const processingTime = Date.now() - startTime;

      if (!responseContent) {
        throw new Error("No se recibió respuesta de la IA");
      }

      this.logger.debug(
        `Procesamiento de IA completado en ${processingTime}ms. Tokens: ${
          completion.data.usage?.total_tokens || "desconocido"
        }`
      );

      // Para formatos JSON, intentar parsear la respuesta
      let parsedResponse: R;
      try {
        parsedResponse = JSON.parse(responseContent) as R;
      } catch (e) {
        // Si no es JSON, devolver como texto
        parsedResponse = responseContent as unknown as R;
      }

      // Añadir metadatos de uso si la respuesta es un objeto
      if (typeof parsedResponse === "object" && parsedResponse !== null) {
        return {
          ...parsedResponse,
          model,
          usage: {
            promptTokens: completion.data.usage?.prompt_tokens || 0,
            completionTokens: completion.data.usage?.completion_tokens || 0,
            totalTokens: completion.data.usage?.total_tokens || 0,
          },
          processingTime,
        } as R;
      }

      return parsedResponse;
    } catch (error: any) {
      this.logger.error(
        `Error al procesar datos con IA: ${error.message}`,
        error.stack
      );
      throw new Error(`Error en procesamiento de IA: ${error.message}`);
    }
  }
}

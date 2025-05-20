import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAIApi } from "openai";
import {
  AiMessage,
  AiProvider,
  AiProviderOptions,
  AiProviderResponse,
} from "../interfaces/ai-provider.interface";
import {
  ChatCompletionOptions,
  ExtendedConfiguration,
} from "../types/openai-config.types";

@Injectable()
export class OpenAiProvider implements AiProvider {
  private openai: OpenAIApi;
  private readonly logger = new Logger(OpenAiProvider.name);
  readonly providerName = "openai";

  constructor(private configService: ConfigService) {
    // Inicializar cliente de OpenAI con la clave API desde las variables de entorno
    const configuration: ExtendedConfiguration = {
      apiKey: this.configService.get<string>("OPENAI_API_KEY") || "",
    };
    this.openai = new OpenAIApi(configuration as any);
  }

  /**
   * Procesa mensajes con la API de OpenAI
   */
  async processPrompt<T>(
    messages: AiMessage[],
    options: AiProviderOptions
  ): Promise<AiProviderResponse<T>> {
    const startTime = Date.now();

    // Obtener opciones con valores por defecto
    const {
      model = this.configService.get<string>("OPENAI_MODEL") || "gpt-4o",
      temperature = 0.3,
      maxTokens = this.configService.get<number>("OPENAI_MAX_TOKENS") || 2000,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      responseFormat,
    } = options;

    try {
      // Crear la solicitud a la API de OpenAI
      const completionOptions: ChatCompletionOptions = {
        model,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        messages: messages as any,
      };

      // Añadir formato de respuesta si está especificado
      if (responseFormat) {
        completionOptions.response_format = { type: responseFormat };
      }

      const completion = await this.openai.createChatCompletion(
        completionOptions as any
      );

      const responseContent = completion.data.choices[0]?.message?.content;
      const processingTime = Date.now() - startTime;

      if (!responseContent) {
        throw new Error("No se recibió respuesta de OpenAI");
      }

      this.logger.debug(
        `Procesamiento de OpenAI completado en ${processingTime}ms. Tokens: ${
          completion.data.usage?.total_tokens || "desconocido"
        }`
      );

      // Para formatos JSON, intentar parsear la respuesta
      let parsedResult: T;
      try {
        parsedResult =
          responseFormat === "json_object"
            ? (JSON.parse(responseContent) as T)
            : (responseContent as unknown as T);
      } catch (e) {
        // Si no es JSON, devolver como texto
        parsedResult = responseContent as unknown as T;
      }

      return {
        result: parsedResult,
        model,
        usage: {
          promptTokens: completion.data.usage?.prompt_tokens || 0,
          completionTokens: completion.data.usage?.completion_tokens || 0,
          totalTokens: completion.data.usage?.total_tokens || 0,
        },
        processingTime,
      };
    } catch (error: any) {
      this.logger.error(
        `Error al procesar datos con OpenAI: ${error.message}`,
        error.stack
      );
      throw new Error(`Error en procesamiento de OpenAI: ${error.message}`);
    }
  }
}

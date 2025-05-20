import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAIApi, Configuration } from "openai";
import axios from "axios";
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
export class DeepSeekProvider implements AiProvider {
  private openai: OpenAIApi;
  private readonly logger = new Logger(DeepSeekProvider.name);
  readonly providerName = "deepseek";

  constructor(private configService: ConfigService) {
    // Inicializar cliente de DeepSeek con la clave API desde las variables de entorno
    const apiKey = this.configService.get<string>("DEEPSEEK_API_KEY") || "";

    this.logger.debug(
      `Inicializando DeepSeekProvider con API key: ${apiKey.substring(0, 7)}...`
    );

    const baseURL = "https://api.deepseek.com/v1";
    this.logger.debug(`Usando URL base para DeepSeek: ${baseURL}`);

    try {
      // Crear una configuración personalizada con un cliente Axios explícito
      const axiosInstance = axios.create({
        baseURL,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      });

      // Usar la configuración estándar de OpenAI con nuestro cliente Axios
      const configuration = new Configuration({
        apiKey,
      });

      // Crear la instancia de OpenAI con nuestra configuración
      this.openai = new OpenAIApi(configuration);

      // Reemplazar el cliente HTTP interno con nuestro cliente personalizado
      (this.openai as any).axios = axiosInstance;

      this.logger.debug(
        "Cliente DeepSeek inicializado correctamente con autorización explícita"
      );
    } catch (error: any) {
      this.logger.error(
        `Error al inicializar el cliente DeepSeek: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Procesa mensajes con la API de DeepSeek
   */
  async processPrompt<T>(
    messages: AiMessage[],
    options: AiProviderOptions
  ): Promise<AiProviderResponse<T>> {
    const startTime = Date.now();

    // Obtener opciones con valores por defecto
    const {
      model = this.configService.get<string>("DEEPSEEK_MODEL") ||
        "deepseek-chat",
      temperature = 0.3,
      maxTokens = this.configService.get<number>("DEEPSEEK_MAX_TOKENS") || 2000,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      responseFormat,
    } = options;

    try {
      // Crear la solicitud a la API de DeepSeek
      const completionOptions: ChatCompletionOptions = {
        model,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        messages: messages as any,
      };

      this.logger.debug(
        `Enviando solicitud a DeepSeek con modelo: ${model}, opciones: ${JSON.stringify(completionOptions, null, 2)}`
      );

      // Verificar si la configuración de OpenAI está correcta
      if (!this.openai) {
        throw new Error("El cliente OpenAI no está inicializado");
      }

      // Intentar hacer la solicitud directamente con Axios como alternativa
      try {
        // Mostrar la configuración actual para depurar
        const axiosInstance = (this.openai as any).axios;
        if (axiosInstance) {
          this.logger.debug("Configuración de Axios:", {
            baseURL: axiosInstance.defaults.baseURL,
            headers:
              axiosInstance.defaults.headers?.common ||
              axiosInstance.defaults.headers,
          });
        }

        // Realizar la solicitud con la API de OpenAI
        const completion = await this.openai.createChatCompletion(
          completionOptions as any
        );

        const responseContent = completion.data.choices[0]?.message?.content;
        const processingTime = Date.now() - startTime;

        if (!responseContent) {
          throw new Error("No se recibió respuesta de DeepSeek");
        }

        this.logger.debug(
          `Procesamiento de DeepSeek completado en ${processingTime}ms. Tokens: ${
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
      } catch (openaiError: any) {
        // Si falla, intentar con una solicitud Axios directa como último recurso
        this.logger.warn(
          `Error en solicitud con OpenAI: ${openaiError.message}, intentando con Axios directo`
        );

        const apiKey = this.configService.get<string>("DEEPSEEK_API_KEY") || "";
        const axiosResp = await axios.post(
          "https://api.deepseek.com/v1/chat/completions",
          completionOptions,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        const responseContent = axiosResp.data.choices[0]?.message?.content;
        const processingTime = Date.now() - startTime;

        return {
          result: responseContent as unknown as T,
          model,
          usage: {
            promptTokens: axiosResp.data.usage?.prompt_tokens || 0,
            completionTokens: axiosResp.data.usage?.completion_tokens || 0,
            totalTokens: axiosResp.data.usage?.total_tokens || 0,
          },
          processingTime,
        };
      }
    } catch (error: any) {
      this.logger.error(
        `Error al procesar datos con DeepSeek: ${error.message}`,
        error.stack
      );

      // Añadir información adicional de error si está disponible
      if (error.response) {
        this.logger.error(
          `Detalles de la respuesta de error: ${JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )}`
        );
      }

      throw new Error(`Error en procesamiento de DeepSeek: ${error.message}`);
    }
  }
}

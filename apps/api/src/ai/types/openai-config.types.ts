import { Configuration } from "openai";

/**
 * Tipo extendido para la configuración de OpenAI para incluir propiedades adicionales
 * que no están en la definición de tipos original pero son aceptadas por la API
 */
export interface ExtendedConfiguration {
  apiKey: string;
  basePath?: string;
  baseURL?: string;
}

/**
 * Interfaz para manejar parámetros adicionales en createChatCompletion
 * que no están en la definición de tipos original
 */
export interface ChatCompletionOptions {
  model: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  messages: Array<{
    role: string;
    content: string;
  }>;
  response_format?: {
    type: string;
  };
}

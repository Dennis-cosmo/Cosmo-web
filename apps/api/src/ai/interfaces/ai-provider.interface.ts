/**
 * Interfaz abstracta para proveedores de IA
 * Permite implementar diferentes servicios (OpenAI, DeepSeek, etc) de manera intercambiable
 */
export interface AiProvider {
  /**
   * Procesa un prompt con el modelo de IA
   * @param messages Mensajes a procesar
   * @param options Opciones de configuración
   * @returns Respuesta del modelo
   */
  processPrompt<T>(
    messages: AiMessage[],
    options: AiProviderOptions
  ): Promise<AiProviderResponse<T>>;

  /**
   * Nombre del proveedor para identificarlo
   */
  readonly providerName: string;
}

/**
 * Estructura de mensaje para IA
 */
export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Opciones comunes para todos los proveedores
 */
export interface AiProviderOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  responseFormat?: "text" | "json_object";
  systemInstruction?: string;
}

/**
 * Respuesta genérica del proveedor de IA
 */
export interface AiProviderResponse<T> {
  result: T;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  processingTime: number;
}

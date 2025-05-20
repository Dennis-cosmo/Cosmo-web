/**
 * Interfaz base para las solicitudes a la API de OpenAI
 */
export interface AiRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemInstruction?: string;
  responseFormat?: "text" | "json_object";
}

/**
 * Interfaz para solicitudes de análisis de texto general
 */
export interface TextAnalysisRequest {
  content: string;
  options?: AiRequestOptions;
}

/**
 * Interfaz para solicitudes de clasificación de gastos
 */
export interface ExpenseClassificationRequest {
  expense: {
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: string;
    category?: string;
    supplier?: string;
    notes?: string;
    paymentMethod?: string;
    [key: string]: any; // Para propiedades adicionales
  };
  options?: AiRequestOptions;
}

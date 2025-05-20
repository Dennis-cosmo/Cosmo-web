/**
 * Interfaz base para respuestas de la API de OpenAI
 */
export interface AiBaseResponse {
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  processingTime?: number; // Tiempo que tardó el procesamiento en ms
}

/**
 * Respuesta para análisis de texto general
 */
export interface TextAnalysisResponse extends AiBaseResponse {
  content: string;
}

/**
 * Interfaz para respuestas de clasificación de taxonomía verde
 */
export interface TaxonomyClassificationResponse extends AiBaseResponse {
  isGreen: boolean;
  taxonomyCategory?: string;
  taxonomyCode?: string;
  confidenceScore: number; // 0-1
  explanation: string;
  sustainableDevelopmentGoals?: string[];
  recommendedActions?: string[];
  alternativesIfNotGreen?: string[];
}

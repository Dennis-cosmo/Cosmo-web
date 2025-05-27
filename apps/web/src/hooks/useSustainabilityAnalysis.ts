import { useState } from "react";
import { post, fetchApi } from "../lib/api";
import { useUserProfile } from "./useUserProfile";

export interface SustainabilityAnalysisResult {
  sustainableExpenses: any[];
  nonSustainableExpenses: any[];
  sustainableTotal: number;
  nonSustainableTotal: number;
  sustainablePercentage: number;
  recommendations: string[];
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const ANALYSIS_TIMEOUT_MS = 90000; // 90 segundos

/**
 * Hook para analizar la sostenibilidad de los gastos
 */
export function useSustainabilityAnalysis() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SustainabilityAnalysisResult | null>(
    null
  );
  const { profile } = useUserProfile();

  /**
   * Analiza la sostenibilidad de un conjunto de gastos
   * @param expenses Lista de gastos para analizar
   */
  const analyzeExpenses = async (
    expenses: any[]
  ): Promise<SustainabilityAnalysisResult> => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Validar que haya gastos para analizar
      if (!expenses || expenses.length === 0) {
        throw new Error("No hay gastos para analizar");
      }

      // Preparar información del usuario para contextualizar el análisis
      const userContext = {
        euTaxonomySectorIds: profile?.euTaxonomySectorIds || [],
        euTaxonomySectorNames: profile?.euTaxonomySectorNames || [],
        euTaxonomyActivities: profile?.euTaxonomyActivities || [],
        companyName: profile?.companyName || "",
      };

      // Timeout manual para UX robusta
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, ANALYSIS_TIMEOUT_MS);

      let analysisResult: SustainabilityAnalysisResult;
      try {
        // Usar fetchApi directamente para pasar la señal
        const response = await fetchApi("/ai/analyze-sustainability", {
          method: "POST",
          body: JSON.stringify({
            expenses,
            userContext,
            options: {
              temperature: 0.3,
              maxTokens: 3000,
              responseFormat: "json_object",
            },
          }),
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        });
        analysisResult = await response.json();
      } finally {
        clearTimeout(timeout);
      }

      // Validar la respuesta
      if (
        !analysisResult ||
        !analysisResult.sustainableExpenses ||
        !analysisResult.nonSustainableExpenses
      ) {
        throw new Error("Respuesta inválida del servidor");
      }

      setResult(analysisResult);
      return analysisResult;
    } catch (err: any) {
      let errorMessage =
        err.name === "AbortError"
          ? "El análisis tardó demasiado. Intenta de nuevo o reduce la cantidad de gastos."
          : err.response?.data?.message ||
            err.message ||
            "Error al analizar la sostenibilidad de los gastos";
      setError(errorMessage);
      setResult(null);
      console.error("Error en análisis de sostenibilidad:", err);

      // Devolver un resultado vacío en caso de error
      const emptyResult: SustainabilityAnalysisResult = {
        sustainableExpenses: [],
        nonSustainableExpenses: [],
        sustainableTotal: 0,
        nonSustainableTotal: 0,
        sustainablePercentage: 0,
        recommendations: [`Error: ${errorMessage}`],
        model: "error",
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };

      return emptyResult;
    } finally {
      setLoading(false);
    }
  };

  // Permitir reintentar desde el modal
  const retry = (expenses: any[]) => analyzeExpenses(expenses);

  return {
    loading,
    error,
    result,
    analyzeExpenses,
    retry,
    setResult, // Para control manual si se requiere
    setError,
  };
}

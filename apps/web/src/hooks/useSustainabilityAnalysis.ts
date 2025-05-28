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

const POLLING_INTERVAL_MS = 3000; // 3 segundos
const MAX_POLLING_TIME_MS = 5 * 60 * 1000; // 5 minutos

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
   * Analiza la sostenibilidad de un conjunto de gastos usando jobs asíncronos
   * @param expenses Lista de gastos para analizar
   */
  const analyzeExpenses = async (
    expenses: any[]
  ): Promise<SustainabilityAnalysisResult> => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (!expenses || expenses.length === 0) {
        throw new Error("No hay gastos para analizar");
      }
      const userContext = {
        euTaxonomySectorIds: profile?.euTaxonomySectorIds || [],
        euTaxonomySectorNames: profile?.euTaxonomySectorNames || [],
        euTaxonomyActivities: profile?.euTaxonomyActivities || [],
        companyName: profile?.companyName || "",
      };
      // 1. Solicitar el análisis y obtener jobId
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
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { jobId } = await response.json();
      if (!jobId) throw new Error("No se pudo crear el job de análisis");
      // 2. Polling al endpoint de resultado
      let pollingTime = 0;
      let pollingResult = null;
      while (pollingTime < MAX_POLLING_TIME_MS) {
        await new Promise((res) => setTimeout(res, POLLING_INTERVAL_MS));
        pollingTime += POLLING_INTERVAL_MS;
        const pollRes = await fetchApi(
          `/ai/analyze-sustainability-result?jobId=${jobId}`
        );
        const pollData = await pollRes.json();
        if (pollData.status === "done") {
          pollingResult = pollData.result;
          break;
        }
        if (pollData.status === "error") {
          throw new Error(
            pollData.error || "Error en el análisis de sostenibilidad"
          );
        }
        // Si status es pending, sigue esperando
      }
      if (!pollingResult) {
        throw new Error(
          "El análisis tardó demasiado. Intenta de nuevo más tarde."
        );
      }
      setResult(pollingResult);
      return pollingResult;
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

  const retry = (expenses: any[]) => analyzeExpenses(expenses);

  return {
    loading,
    error,
    result,
    analyzeExpenses,
    retry,
    setResult,
    setError,
  };
}

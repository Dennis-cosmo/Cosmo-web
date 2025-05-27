"use client";

import { useState, useEffect } from "react";
import { useSustainabilityAnalysis } from "../../hooks/useSustainabilityAnalysis";
import SustainabilityAnalysisResults from "./SustainabilityAnalysisResults";

export default function SustainabilityAnalysisClient() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const {
    analyzeExpenses,
    result,
    loading,
    error,
    retry,
    setResult,
    setError,
  } = useSustainabilityAnalysis();

  // Buscar todos los gastos disponibles en la página
  const fetchExpensesFromDom = () => {
    const expensesData: any[] = [];
    const expenseRows = document.querySelectorAll("table tbody tr");

    if (expenseRows.length > 0) {
      expenseRows.forEach((row, index) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 5) {
          const dateText = cells[0].textContent?.trim() || "";
          const descriptionElem = cells[1].querySelector("a");
          const descriptionText = descriptionElem?.textContent?.trim() || "";
          const amountText = cells[2].textContent?.trim() || "";
          const categoryText = cells[3].textContent?.trim() || "";
          const supplierText = cells[4].textContent?.trim() || "";

          const expenseId =
            descriptionElem?.getAttribute("href")?.split("/").pop() ||
            `exp-${index}`;
          const amountMatch = amountText.match(/[\d,\.]+/);
          const amount = amountMatch
            ? parseFloat(amountMatch[0].replace(",", "."))
            : 0;
          const currencyMatch = amountText.match(/[^\d,\.]+/);
          const currency = currencyMatch ? currencyMatch[0].trim() : "EUR";

          expensesData.push({
            id: expenseId,
            date: dateText,
            description: descriptionText,
            amount: amount,
            currency: currency,
            category: categoryText === "Sin categoría" ? "" : categoryText,
            supplier: supplierText === "No especificado" ? "" : supplierText,
          });
        }
      });
    }

    return expensesData;
  };

  // Escuchar el evento de análisis de sostenibilidad
  useEffect(() => {
    const handleAnalysisRequest = async () => {
      setIsOpen(true);
      setIsAnalyzing(true);
      try {
        const expensesData = fetchExpensesFromDom();
        if (expensesData.length === 0) {
          throw new Error("No se encontraron gastos para analizar");
        }
        setExpenses(expensesData);
        await analyzeExpenses(expensesData);
      } catch (error: any) {
        console.error("Error al analizar gastos:", error);
        // El error será manejado por el hook useSustainabilityAnalysis
      } finally {
        setIsAnalyzing(false);
      }
    };

    window.addEventListener("analyze-sustainability", handleAnalysisRequest);
    return () => {
      window.removeEventListener(
        "analyze-sustainability",
        handleAnalysisRequest
      );
    };
  }, [analyzeExpenses]);

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setError(null);
    const container = document.getElementById(
      "sustainability-analysis-container"
    );
    if (container) {
      container.classList.add("hidden");
    }
  };

  const handleRetry = () => {
    if (expenses.length > 0) {
      setError(null);
      setResult(null);
      setIsAnalyzing(true);
      analyzeExpenses(expenses).finally(() => setIsAnalyzing(false));
    }
  };

  // El modal debe estar abierto si está analizando, cargando, hay error o hay resultado
  if (!isOpen && !(loading || isAnalyzing || error || result)) {
    return null;
  }

  // Determinar si se debe mostrar el loader
  const showLoader = loading || isAnalyzing;
  const noResults =
    result &&
    !showLoader &&
    !error &&
    result.sustainableExpenses.length === 0 &&
    result.nonSustainableExpenses.length === 0;

  return (
    <div className="bg-white dark:bg-cosmo-800 rounded-lg shadow-xl overflow-hidden">
      {showLoader && (
        <div className="flex flex-col items-center justify-center p-10 min-h-[300px]">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-eco-green mb-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center mb-2">
              Organizando y clasificando tus gastos con IA...
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
              Este proceso puede tardar hasta 1-2 minutos dependiendo de la
              cantidad de datos y la carga del servidor.
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {expenses.length > 0
                ? `${expenses.length} gastos en proceso`
                : "Recopilando datos..."}
            </span>
            <div className="w-full mt-6">
              <div className="w-full h-2 bg-gray-200 dark:bg-cosmo-700 rounded-full overflow-hidden">
                <div className="h-2 bg-eco-green animate-pulse w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !showLoader && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
          <h3 className="text-lg font-medium mb-2">Error en el análisis</h3>
          <p>{error}</p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-eco-green text-white rounded-md shadow-sm text-sm hover:bg-eco-green/90 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-white dark:bg-cosmo-800 rounded-md shadow-sm text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-cosmo-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {noResults && (
        <div className="p-6 text-center text-gray-600 dark:text-gray-300">
          <h3 className="text-lg font-medium mb-2">
            No se encontraron resultados
          </h3>
          <p>
            La IA no pudo clasificar ningún gasto como sostenible o no
            sostenible. Intenta con otros datos o revisa las descripciones de
            los gastos.
          </p>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-white dark:bg-cosmo-800 rounded-md shadow-sm text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-cosmo-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}

      {result && !showLoader && !error && !noResults && (
        <SustainabilityAnalysisResults result={result} onClose={handleClose} />
      )}
    </div>
  );
}

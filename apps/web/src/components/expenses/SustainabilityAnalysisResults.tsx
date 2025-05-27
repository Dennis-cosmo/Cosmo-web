"use client";

import { useState } from "react";
import { SustainabilityAnalysisResult } from "../../hooks/useSustainabilityAnalysis";

interface SustainabilityAnalysisResultsProps {
  result: SustainabilityAnalysisResult;
  onClose: () => void;
}

export default function SustainabilityAnalysisResults({
  result,
  onClose,
}: SustainabilityAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<
    "sustainable" | "nonSustainable" | "recommendations"
  >("sustainable");

  // Formatear número como moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  // Utilidad para mostrar un campo o 'N/A' si no existe
  const safe = (val: any) =>
    val !== undefined && val !== null && val !== "" ? val : "N/A";

  // Obtener todas las claves extra de los gastos (además de las estándar)
  const getExtraKeys = (expenses: any[], standardKeys: string[]) => {
    const extra = new Set<string>();
    expenses.forEach((exp) => {
      Object.keys(exp).forEach((key) => {
        if (!standardKeys.includes(key)) extra.add(key);
      });
    });
    return Array.from(extra);
  };

  const standardKeys = [
    "description",
    "date",
    "category",
    "amount",
    "supplier",
    "reason",
    "alternative",
  ];
  const extraSust = getExtraKeys(result.sustainableExpenses, standardKeys);
  const extraNonSust = getExtraKeys(
    result.nonSustainableExpenses,
    standardKeys
  );

  // Función para normalizar los campos de cada gasto
  function normalizeExpense(expense: any) {
    // Si viene 'reasons', lo pasamos a 'reason'
    if (expense.reasons && !expense.reason) {
      expense.reason = expense.reasons;
      delete expense.reasons;
    }
    // Si falta 'reason', lo ponemos como N/A
    if (!expense.reason) expense.reason = "N/A";
    // Si falta 'alternative', lo ponemos como N/A
    if (!expense.alternative) expense.alternative = "N/A";
    // Si falta 'supplier', lo ponemos como N/A
    if (!expense.supplier) expense.supplier = "N/A";
    // Si falta 'category', lo ponemos como N/A
    if (!expense.category) expense.category = "N/A";
    // Si falta 'description', lo ponemos como N/A
    if (!expense.description) expense.description = "N/A";
    // Si falta 'date', lo ponemos como N/A
    if (!expense.date) expense.date = "N/A";
    // Si falta 'amount', lo ponemos como N/A
    if (!expense.amount) expense.amount = "N/A";
    return expense;
  }

  const handleClick = () => {
    console.log("Botón de análisis clickeado");
    const event = new CustomEvent("analyze-sustainability");
    window.dispatchEvent(event);
    const container = document.getElementById(
      "sustainability-analysis-container"
    );
    if (container) {
      container.classList.remove("hidden");
      console.log("Contenedor del modal encontrado y mostrado");
    } else {
      console.error("Contenedor del modal no encontrado");
    }
  };

  return (
    <div className="bg-white dark:bg-cosmo-800 shadow-lg rounded-lg overflow-hidden">
      {/* Encabezado con resumen */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-cosmo-700 border-b border-gray-200 dark:border-cosmo-600">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Análisis de Sostenibilidad
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
            OpEx
          </h3>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            {formatCurrency(result.sustainableTotal)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {result.sustainableExpenses.length} elementos (
            {result.sustainablePercentage.toFixed(1)}%)
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            OpEx
          </h3>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
            {formatCurrency(result.nonSustainableTotal)}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {result.nonSustainableExpenses.length} elementos (
            {(100 - result.sustainablePercentage).toFixed(1)}%)
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Total Analizado
          </h3>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {formatCurrency(
              result.sustainableTotal + result.nonSustainableTotal
            )}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {result.sustainableExpenses.length +
              result.nonSustainableExpenses.length}{" "}
            elementos
          </p>
        </div>
      </div>

      {/* Pestañas para navegar entre resultados */}
      <div className="px-6 border-b border-gray-200 dark:border-cosmo-600">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("sustainable")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sustainable"
                ? "border-eco-green text-eco-green dark:border-eco-green dark:text-eco-green"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Sostenibles ({result.sustainableExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab("nonSustainable")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "nonSustainable"
                ? "border-red-500 text-red-500 dark:border-red-400 dark:text-red-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            No Sostenibles ({result.nonSustainableExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "recommendations"
                ? "border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Recomendaciones
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {activeTab === "sustainable" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              OpEx
            </h3>
            {result.sustainableExpenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron gastos sostenibles.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-cosmo-600">
                  <thead className="bg-gray-50 dark:bg-cosmo-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Razón
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Alternativa
                      </th>
                      {extraSust.map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-cosmo-800 divide-y divide-gray-200 dark:divide-cosmo-700">
                    {result.sustainableExpenses.map((expense, index) => {
                      const normalizedExpense = normalizeExpense(expense);
                      return (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-gray-50 dark:bg-cosmo-700/30"
                              : ""
                          }
                        >
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {safe(normalizedExpense.description)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.category)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.supplier)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.reason)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.alternative)}
                          </td>
                          {extraSust.map((key) => (
                            <td
                              key={key}
                              className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300"
                            >
                              {safe(normalizedExpense[key])}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "nonSustainable" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              OpEx
            </h3>
            {result.nonSustainableExpenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron gastos no sostenibles.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-cosmo-600">
                  <thead className="bg-gray-50 dark:bg-cosmo-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Razón
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Alternativa
                      </th>
                      {extraNonSust.map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-cosmo-800 divide-y divide-gray-200 dark:divide-cosmo-700">
                    {result.nonSustainableExpenses.map((expense, index) => {
                      const normalizedExpense = normalizeExpense(expense);
                      return (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-gray-50 dark:bg-cosmo-700/30"
                              : ""
                          }
                        >
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {safe(normalizedExpense.description)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.category)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.supplier)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.reason)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {safe(normalizedExpense.alternative)}
                          </td>
                          {extraNonSust.map((key) => (
                            <td
                              key={key}
                              className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300"
                            >
                              {safe(normalizedExpense[key])}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Recomendaciones para mejorar
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {recommendation}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pie con información del modelo */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-cosmo-700 border-t border-gray-200 dark:border-cosmo-600 text-xs text-gray-500 dark:text-gray-400">
        <p>Análisis generado por modelo: {result.model || "N/A"}</p>
        <p>
          Tokens utilizados: {result.usage?.totalTokens ?? "N/A"} (
          {result.usage?.promptTokens ?? "N/A"} prompt,{" "}
          {result.usage?.completionTokens ?? "N/A"}
          respuesta)
        </p>
      </div>
    </div>
  );
}

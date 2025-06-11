"use client";

import { useState } from "react";
import { SustainabilityAnalysisResult } from "../../hooks/useSustainabilityAnalysis";

interface SustainabilityAnalysisResultsProps {
  result: SustainabilityAnalysisResult;
  onClose: () => void;
  isInline?: boolean;
}

export default function SustainabilityAnalysisResults({
  result,
  onClose,
  isInline = false,
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
  const safe = (val: any) => {
    if (val === undefined || val === null || val === "") {
      return "N/A";
    }

    // Si es un objeto, convertirlo a string JSON legible
    if (typeof val === "object") {
      try {
        return JSON.stringify(val, null, 2);
      } catch (error) {
        return "Objeto complejo";
      }
    }

    // Si es un array, convertirlo a string
    if (Array.isArray(val)) {
      return val.join(", ");
    }

    // Para otros tipos, convertir a string
    return String(val);
  };

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
    <div className="bg-[#1A1A1A] shadow-lg rounded-lg overflow-hidden border border-[#3E9D0A]/20">
      {/* Encabezado con resumen */}
      <div className="px-6 py-4 bg-black/30 border-b border-[#3E9D0A]/20">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#E1E1E1]">
            Análisis de Sostenibilidad
          </h2>
          {!isInline && (
            <button
              onClick={onClose}
              className="text-[#E1E1E1]/60 hover:text-[#E1E1E1] transition-colors"
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
          )}
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#3E9D0A]/10 p-4 rounded-lg border border-[#3E9D0A]/20">
          <h3 className="text-sm font-medium text-[#C6FF00]">CapEx</h3>
          <p className="text-2xl font-bold text-[#3E9D0A] mt-1">
            {formatCurrency(result.sustainableTotal)}
          </p>
          <p className="text-sm text-[#E1E1E1] mt-1">
            {result.sustainableExpenses.length} elementos (
            {result.sustainablePercentage.toFixed(1)}%)
          </p>
        </div>

        <div className="bg-[#3E9D0A]/5 p-4 rounded-lg border border-[#3E9D0A]/20">
          <h3 className="text-sm font-medium text-[#C6FF00]">OpEx</h3>
          <p className="text-2xl font-bold text-[#3E9D0A] mt-1">
            {formatCurrency(result.nonSustainableTotal)}
          </p>
          <p className="text-sm text-[#E1E1E1] mt-1">
            {result.nonSustainableExpenses.length} elementos (
            {(100 - result.sustainablePercentage).toFixed(1)}%)
          </p>
        </div>

        <div className="bg-[#3E9D0A]/10 p-4 rounded-lg border border-[#3E9D0A]/20">
          <h3 className="text-sm font-medium text-[#C6FF00]">Turnover</h3>
          <p className="text-2xl font-bold text-[#3E9D0A] mt-1">
            {formatCurrency(50000)} {/* Datos mock */}
          </p>
          <p className="text-sm text-[#E1E1E1] mt-1">
            Facturación anual estimada
          </p>
        </div>

        <div className="bg-[#3E9D0A]/10 p-4 rounded-lg border border-[#3E9D0A]/20">
          <h3 className="text-sm font-medium text-[#C6FF00]">
            Total Analizado
          </h3>
          <p className="text-2xl font-bold text-[#3E9D0A] mt-1">
            {formatCurrency(
              result.sustainableTotal + result.nonSustainableTotal
            )}
          </p>
          <p className="text-sm text-[#E1E1E1] mt-1">
            {result.sustainableExpenses.length +
              result.nonSustainableExpenses.length}{" "}
            elementos
          </p>
        </div>
      </div>

      {/* Pestañas para navegar entre resultados */}
      <div className="px-6 border-b border-[#3E9D0A]/20">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("sustainable")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sustainable"
                ? "border-[#C6FF00] text-[#C6FF00]"
                : "border-transparent text-[#E1E1E1]/60 hover:text-[#E1E1E1] hover:border-[#3E9D0A]/40"
            }`}
          >
            Sostenibles ({result.sustainableExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab("nonSustainable")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "nonSustainable"
                ? "border-[#C6FF00] text-[#C6FF00]"
                : "border-transparent text-[#E1E1E1]/60 hover:text-[#E1E1E1] hover:border-[#3E9D0A]/40"
            }`}
          >
            No Sostenibles ({result.nonSustainableExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "recommendations"
                ? "border-[#C6FF00] text-[#C6FF00]"
                : "border-transparent text-[#E1E1E1]/60 hover:text-[#E1E1E1] hover:border-[#3E9D0A]/40"
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
            <h3 className="text-lg font-medium text-[#E1E1E1] mb-2">OpEx</h3>
            {result.sustainableExpenses.length === 0 ? (
              <p className="text-[#E1E1E1]/60">
                No se encontraron gastos sostenibles.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#3E9D0A]/20">
                  <thead className="bg-black/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Razón
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Alternativa
                      </th>
                      {extraSust.map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3E9D0A]/20">
                    {result.sustainableExpenses.map((expense, index) => {
                      const normalizedExpense = normalizeExpense(expense);
                      return (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-[#3E9D0A]/5" : ""}
                        >
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.description)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.category)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.supplier)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.reason)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.alternative)}
                          </td>
                          {extraSust.map((key) => (
                            <td
                              key={key}
                              className="px-6 py-4 text-sm text-[#E1E1E1]"
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
            <h3 className="text-lg font-medium text-[#E1E1E1] mb-2">OpEx</h3>
            {result.nonSustainableExpenses.length === 0 ? (
              <p className="text-[#E1E1E1]/60">
                No se encontraron gastos no sostenibles.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#3E9D0A]/20">
                  <thead className="bg-black/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Razón
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider">
                        Alternativa
                      </th>
                      {extraNonSust.map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-[#E1E1E1]/60 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3E9D0A]/20">
                    {result.nonSustainableExpenses.map((expense, index) => {
                      const normalizedExpense = normalizeExpense(expense);
                      return (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-[#3E9D0A]/5" : ""}
                        >
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.description)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.category)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.supplier)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.reason)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E1E1E1]">
                            {safe(normalizedExpense.alternative)}
                          </td>
                          {extraNonSust.map((key) => (
                            <td
                              key={key}
                              className="px-6 py-4 text-sm text-[#E1E1E1]"
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
            <h3 className="text-lg font-medium text-[#E1E1E1] mb-2">
              Recomendaciones para mejorar
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="bg-[#3E9D0A]/10 p-4 rounded-lg border border-[#3E9D0A]/20"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-[#C6FF00]"
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
                      <p className="text-sm text-[#E1E1E1]">{recommendation}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pie con información del modelo */}
      <div className="px-6 py-4 bg-black/30 border-t border-[#3E9D0A]/20 text-xs text-[#E1E1E1]/60">
        <p>Análisis generado por modelo: {result.model || "N/A"}</p>
        <p>
          Tokens utilizados: {result.usage?.totalTokens ?? "N/A"} (
          {result.usage?.promptTokens ?? "N/A"} prompt,{" "}
          {result.usage?.completionTokens ?? "N/A"}
          respuesta)
        </p>
      </div>

      {!isInline && (
        <div className="px-6 py-4 bg-black/30 border-t border-[#3E9D0A]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#3E9D0A]/20 rounded-md shadow-sm text-sm font-medium 
                     text-[#E1E1E1] hover:bg-[#3E9D0A]/10 hover:border-[#3E9D0A]/40 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3E9D0A]"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ReportMetric {
  label: string;
  value: number;
  previousValue: number;
  unit: string;
}

interface SustainabilityScore {
  category: string;
  score: number;
  maxScore: number;
  improvement: number;
}

export default function SustainabilityReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedView, setSelectedView] = useState("overview");

  const metrics: ReportMetric[] = [
    {
      label: "Huella de Carbono",
      value: 45.2,
      previousValue: 52.8,
      unit: "tCO2e",
    },
    {
      label: "Consumo de Energía",
      value: 12500,
      previousValue: 13200,
      unit: "kWh",
    },
    {
      label: "Residuos Reciclados",
      value: 78,
      previousValue: 65,
      unit: "%",
    },
    {
      label: "Agua Ahorrada",
      value: 1250,
      previousValue: 1100,
      unit: "m³",
    },
  ];

  const scores: SustainabilityScore[] = [
    {
      category: "Energía Renovable",
      score: 85,
      maxScore: 100,
      improvement: 15,
    },
    {
      category: "Gestión de Residuos",
      score: 92,
      maxScore: 100,
      improvement: 8,
    },
    {
      category: "Eficiencia Hídrica",
      score: 78,
      maxScore: 100,
      improvement: 12,
    },
    {
      category: "Cadena de Suministro",
      score: 88,
      maxScore: 100,
      improvement: 10,
    },
  ];

  const calculateTrend = (current: number, previous: number) => {
    const percentage = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(percentage).toFixed(1),
      isPositive: percentage > 0,
    };
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E1E1E1]">
          Reporte de Sostenibilidad
        </h1>
        <p className="text-[#E1E1E1]/60 mt-2">
          Monitoreo y análisis del desempeño ambiental de tu empresa
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex bg-black/30 rounded-lg p-1">
          <button
            onClick={() => setSelectedPeriod("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === "monthly"
                ? "bg-[#3E9D0A] text-[#E1E1E1]"
                : "text-[#E1E1E1]/60 hover:text-[#E1E1E1]"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setSelectedPeriod("quarterly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === "quarterly"
                ? "bg-[#3E9D0A] text-[#E1E1E1]"
                : "text-[#E1E1E1]/60 hover:text-[#E1E1E1]"
            }`}
          >
            Trimestral
          </button>
          <button
            onClick={() => setSelectedPeriod("yearly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === "yearly"
                ? "bg-[#3E9D0A] text-[#E1E1E1]"
                : "text-[#E1E1E1]/60 hover:text-[#E1E1E1]"
            }`}
          >
            Anual
          </button>
        </div>

        <div className="flex bg-black/30 rounded-lg p-1">
          <button
            onClick={() => setSelectedView("overview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === "overview"
                ? "bg-[#3E9D0A] text-[#E1E1E1]"
                : "text-[#E1E1E1]/60 hover:text-[#E1E1E1]"
            }`}
          >
            Vista General
          </button>
          <button
            onClick={() => setSelectedView("detailed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === "detailed"
                ? "bg-[#3E9D0A] text-[#E1E1E1]"
                : "text-[#E1E1E1]/60 hover:text-[#E1E1E1]"
            }`}
          >
            Detallado
          </button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const trend = calculateTrend(metric.value, metric.previousValue);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/30 border border-[#3E9D0A]/20 rounded-lg p-6"
            >
              <h3 className="text-[#E1E1E1]/60 text-sm font-medium mb-2">
                {metric.label}
              </h3>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-[#E1E1E1]">
                  {metric.value}
                </span>
                <span className="text-[#E1E1E1]/60 text-sm mb-1">
                  {metric.unit}
                </span>
              </div>
              <div
                className={`flex items-center mt-2 ${
                  trend.isPositive ? "text-[#C6FF00]" : "text-red-400"
                }`}
              >
                <span className="text-sm">
                  {trend.isPositive ? "↑" : "↓"} {trend.value}%
                </span>
                <span className="text-xs ml-1 text-[#E1E1E1]/40">
                  vs periodo anterior
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Puntuaciones de Sostenibilidad */}
      <div className="bg-black/30 border border-[#3E9D0A]/20 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-[#E1E1E1] mb-6">
          Puntuaciones por Categoría
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scores.map((score, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#E1E1E1]">{score.category}</span>
                <span className="text-[#C6FF00]">
                  {score.score}/{score.maxScore}
                </span>
              </div>
              <div className="h-2 bg-[#3E9D0A]/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(score.score / score.maxScore) * 100}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#3E9D0A] rounded-full"
                />
              </div>
              <div className="text-xs text-[#E1E1E1]/60">
                +{score.improvement}% de mejora
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones Recomendadas */}
      <div className="bg-black/30 border border-[#3E9D0A]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#E1E1E1] mb-6">
          Acciones Recomendadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Optimizar Consumo Energético"
            description="Implementar sistemas de monitoreo en tiempo real para identificar picos de consumo"
            impact="Alto"
          />
          <ActionCard
            title="Mejorar Gestión de Residuos"
            description="Establecer programa de reciclaje y compostaje en todas las instalaciones"
            impact="Medio"
          />
          <ActionCard
            title="Reducir Huella de Carbono"
            description="Transición a vehículos eléctricos para entregas locales"
            impact="Alto"
          />
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  impact,
}: {
  title: string;
  description: string;
  impact: "Alto" | "Medio" | "Bajo";
}) {
  return (
    <div className="bg-[#1A1A1A] border border-[#3E9D0A]/20 rounded-lg p-4 hover:border-[#3E9D0A]/40 transition-colors">
      <h3 className="text-[#C6FF00] font-medium mb-2">{title}</h3>
      <p className="text-[#E1E1E1]/60 text-sm mb-4">{description}</p>
      <div className="flex items-center">
        <span className="text-xs font-medium text-[#E1E1E1]/40 mr-2">
          Impacto:
        </span>
        <span
          className={`text-xs font-medium ${
            impact === "Alto"
              ? "text-[#C6FF00]"
              : impact === "Medio"
                ? "text-yellow-400"
                : "text-[#E1E1E1]/60"
          }`}
        >
          {impact}
        </span>
      </div>
    </div>
  );
}

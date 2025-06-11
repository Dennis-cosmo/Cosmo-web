"use client";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useSession } from "next-auth/react";
import LogoPrincipal from "@cosmo/web/components/logos/LogoPrincipal";
import IconPrincipal from "@cosmo/web/components/logos/IconPrincipal";

// Datos estáticos para los gráficos (mantener como respaldo)
const staticData = {
  companyName: "ACME GmbH",
  period: "Q1 2025",
  sustainabilityScore: "RATIO: 2:4",

  // Taxonomy Eligible Activities (respaldo)
  taxonomyEligibleActivities: [
    {
      name: "Manufacture of electrical and electronic equipment: C26",
      opEx: "$12,000",
      capEx: "$8,000",
      turnover: "$30,000",
      criteria: [
        {
          label: "Substantial contribution criteria",
          color: "bg-eco-green/20 border-eco-green text-eco-green",
        },
        {
          label: "Climate Change Mitigation",
          color: "bg-lime-accent/20 border-lime-accent text-lime-accent",
        },
        {
          label: "Climate Change Adaptation",
          color: "bg-eco-green/20 border-eco-green text-eco-green",
        },
        {
          label: "Water",
          color: "bg-lime-accent/20 border-lime-accent text-lime-accent",
        },
        {
          label: "Pollution",
          color: "bg-cosmo-500/20 border-cosmo-500 text-cosmo-500",
        },
        {
          label: "Biodiversity",
          color: "bg-eco-green/20 border-eco-green text-eco-green",
        },
      ],
      minimumSafeguards: ["OECD", "UN Guiding Principles"],
      article: "SFDR: Article 8",
    },
    {
      name: "Electricity generation from bioenergy D35.11",
      opEx: "$10,000",
      capEx: "$6,000",
      turnover: "$25,000",
      criteria: [
        {
          label: "Substantial contribution criteria",
          color: "bg-eco-green/20 border-eco-green text-eco-green",
        },
        {
          label: "Climate Change Mitigation",
          color: "bg-lime-accent/20 border-lime-accent text-lime-accent",
        },
        {
          label: "Climate Change Adaptation",
          color: "bg-eco-green/20 border-eco-green text-eco-green",
        },
        {
          label: "Water",
          color: "bg-lime-accent/20 border-lime-accent text-lime-accent",
        },
        {
          label: "Pollution",
          color: "bg-cosmo-500/20 border-cosmo-500 text-cosmo-500",
        },
      ],
      minimumSafeguards: ["OECD", "UN Guiding Principles"],
      article: "SFDR: Article 9",
    },
  ],

  // Non-green Activities (datos estáticos)
  nonGreenActivities: [
    {
      name: "Fossil fuel extraction and processing: B06",
      opEx: "$18,000",
      capEx: "$15,000",
      turnover: "$45,000",
      criteria: [
        {
          label: "Does Not Meet Criteria",
          color: "bg-red-500/20 border-red-500 text-red-400",
        },
      ],
      minimumSafeguards: ["DNSH Not Met"],
      article: "SFDR: Article 6",
    },
    {
      name: "Coal mining and related activities: B05",
      opEx: "$9,000",
      capEx: "$7,000",
      turnover: "$22,000",
      criteria: [
        {
          label: "Does Not Meet Criteria",
          color: "bg-red-500/20 border-red-500 text-red-400",
        },
      ],
      minimumSafeguards: ["DNSH Not Met"],
      article: "SFDR: Article 6",
    },
  ],
};

// Datos estáticos para los gráficos (mantener)
const pieData = [
  { name: "Scope 1", value: 30 },
  { name: "Scope 2", value: 20 },
  { name: "Scope 3", value: 50 },
];
const pieColors = ["#00FF9D", "#A3E635", "#6EE7B7"];

const barData = [
  { name: "Energy", Renewable: 60, NonRenewable: 40 },
  { name: "Water", Usage: 80 },
  { name: "Biodiversity", Impact: 30 },
];

const totalPie = pieData.reduce((acc, curr) => acc + curr.value, 0);

export default function Dashboard() {
  const { data: session } = useSession();
  const { profile, loading, error } = useUserProfile();
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "Cargando...",
    period: "Q1 2025",
    sustainabilityScore: "RATIO: 2:4",
  });
  const [taxonomyActivities, setTaxonomyActivities] = useState<any[]>([]);
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      // Actualizar información de la empresa
      setCompanyInfo({
        companyName: profile.companyName || "Tu Empresa",
        period: "Q1 2025", // Esto podría venir del backend en el futuro
        sustainabilityScore: "RATIO: 2:4", // Esto podría calcularse en el backend
      });

      // Actualizar actividades de taxonomía si existen
      if (
        profile.taxonomyActivities &&
        Array.isArray(profile.taxonomyActivities) &&
        profile.taxonomyActivities.length > 0
      ) {
        console.log(
          `Dashboard: Cargando ${profile.taxonomyActivities.length} actividades de taxonomía`
        );
        setTaxonomyActivities(profile.taxonomyActivities);
        setTaxonomyError(null);
      } else {
        console.warn(
          "Dashboard: No se encontraron actividades de taxonomía en el perfil"
        );
        // Usar datos de respaldo si no hay datos reales
        setTaxonomyActivities([]);
        setTaxonomyError(
          "No se encontraron actividades de taxonomía registradas para este usuario"
        );
      }
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full py-8 px-6 border-b border-white/10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <LogoPrincipal
                width={120}
                height={30}
                className="text-[#c5ff00] drop-shadow-[0_0_15px_rgba(197,255,0,0.5)]"
              />
              <IconPrincipal width={32} height={32} className="ml-2" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              {companyInfo.companyName}
            </span>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="px-5 py-2 rounded-md bg-cosmo-700 hover:bg-eco-green text-white font-medium transition-all duration-200 shadow-sm hover:scale-105">
              Connect
            </button>
            <button className="px-5 py-2 rounded-md bg-cosmo-700 hover:bg-eco-green text-white font-medium transition-all duration-200 shadow-sm hover:scale-105">
              Upload Document
            </button>
            <button className="px-5 py-2 rounded-md bg-cosmo-700 hover:bg-eco-green text-white font-medium transition-all duration-200 shadow-sm hover:scale-105">
              Scan Document
            </button>
            <button className="px-5 py-2 rounded-md bg-lime-accent hover:bg-eco-green text-cosmo-500 font-medium transition-all duration-200 shadow-sm hover:scale-105">
              Generate Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Summary Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 animate-fadeIn">
          <div className="flex flex-col gap-2">
            <span className="uppercase text-white/60 text-xs tracking-widest">
              Sustainability Score
            </span>
            <span className="text-2xl font-bold text-lime-accent animate-fadeIn">
              {companyInfo.sustainabilityScore}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="uppercase text-white/60 text-xs tracking-widest">
              Period
            </span>
            <span className="text-lg font-semibold text-white animate-fadeIn delay-200">
              {companyInfo.period}
            </span>
          </div>
        </div>

        {/* EU Taxonomy Classification Section */}
        <div className="mb-12">
          {/* Taxonomy Eligible Activities */}
          <div className="mb-16 relative">
            <div className="bg-gradient-to-r from-eco-green to-lime-accent text-cosmo-500 text-center py-3.5 rounded-md mb-10 font-semibold text-lg border border-eco-green/20 transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer">
              Taxonomy Eligible
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eco-green"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 p-4 rounded-lg text-center">
                <p className="text-white mb-2">Error al cargar el perfil</p>
                <p className="text-white/70 text-sm">{error}</p>
              </div>
            ) : taxonomyError ? (
              <div className="bg-cosmo-800/70 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-white/70 mb-2">{taxonomyError}</p>
                <p className="text-white/50 text-sm">
                  Por favor complete el registro de actividades económicas en su
                  perfil
                </p>
              </div>
            ) : taxonomyActivities.length === 0 ? (
              <div className="bg-cosmo-800/70 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-white/70">
                  No se han registrado actividades económicas según la Taxonomía
                  EU
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {taxonomyActivities.map((activity, idx) => (
                  <div
                    key={activity.id || idx}
                    className="group bg-cosmo-800/70 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-md transition-all duration-500 hover:scale-[1.03] hover:bg-cosmo-800/90 hover:border-eco-green/30 animate-fadeIn relative overflow-hidden"
                    style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-eco-green/5 to-lime-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-eco-green/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 group-hover:bg-eco-green/20 transition-all duration-500"></div>

                    <h2 className="text-2xl font-bold mb-2 text-white/90 tracking-tight group-hover:text-eco-green transition-colors duration-300">
                      {activity.name}
                    </h2>

                    {activity.sectorName && (
                      <div className="mb-4 text-sm text-white/60">
                        Sector: {activity.sectorName}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-4">
                      <div className="flex-1 bg-cosmo-700/60 rounded-lg p-4 flex flex-col items-center border border-cosmo-500/30 backdrop-blur-sm hover:border-eco-green/30 hover:bg-cosmo-700/80 transition-all duration-300 transform hover:-translate-y-1">
                        <span className="text-xs text-white/60 mb-1">OpEx</span>
                        <span className="text-lg font-semibold">
                          {activity.opEx}
                        </span>
                      </div>
                      <div className="flex-1 bg-cosmo-700/60 rounded-lg p-4 flex flex-col items-center border border-cosmo-500/30 backdrop-blur-sm hover:border-eco-green/30 hover:bg-cosmo-700/80 transition-all duration-300 transform hover:-translate-y-1">
                        <span className="text-xs text-white/60 mb-1">
                          CapEx
                        </span>
                        <span className="text-lg font-semibold">
                          {activity.capEx}
                        </span>
                      </div>
                      <div className="flex-1 bg-cosmo-700/60 rounded-lg p-4 flex flex-col items-center border border-cosmo-500/30 backdrop-blur-sm hover:border-eco-green/30 hover:bg-cosmo-700/80 transition-all duration-300 transform hover:-translate-y-1">
                        <span className="text-xs text-white/60 mb-1">
                          Turnover
                        </span>
                        <span className="text-lg font-semibold">
                          {activity.turnover}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {activity.criteria?.map((c: any, i: any) => (
                        <span
                          key={c.label + i}
                          className={`px-3 py-1 rounded-full border text-xs font-medium ${c.color} flex items-center gap-1 animate-fadeIn transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-eco-green/10`}
                          style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                        >
                          {c.label}
                        </span>
                      ))}
                    </div>

                    {activity.naceCodes && activity.naceCodes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {activity.naceCodes.map((code: any, i: any) => (
                          <span
                            key={`nace-${code}-${i}`}
                            className="bg-lime-accent/10 text-lime-accent px-2 py-1 rounded text-xs font-medium"
                          >
                            NACE: {code}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2 mt-2">
                      {activity.minimumSafeguards?.map((ms: any, i: any) => (
                        <span
                          key={ms + i}
                          className="px-2 py-1 rounded bg-cosmo-700/80 border border-cosmo-500/40 text-xs text-white/80 animate-fadeIn delay-300 hover:bg-cosmo-700 hover:border-eco-green/30 transition-all duration-300"
                        >
                          {ms}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-2">
                      <span className="px-4 py-2 rounded-md bg-gradient-to-r from-eco-green to-lime-accent text-cosmo-500 text-sm font-semibold border border-white/20 shadow-lg relative overflow-hidden group-hover:shadow-eco-green/20 transition-all duration-300">
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                        <span className="relative z-10">
                          {activity.article}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Non-green Activities (mantener como estático) */}
          <div className="mb-12 relative">
            <div className="bg-gray-400 text-cosmo-800 text-center py-3.5 rounded-md mb-10 font-semibold text-lg border border-gray-500/20 transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer">
              Non-green
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {staticData.nonGreenActivities.map((activity, idx) => (
                <div
                  key={activity.name}
                  className="group bg-cosmo-800/70 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-md transition-all duration-500 hover:scale-[1.03] hover:bg-cosmo-800/90 hover:border-red-500/30 animate-fadeIn relative overflow-hidden"
                  style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 group-hover:bg-red-500/20 transition-all duration-500"></div>

                  <h2 className="text-2xl font-bold mb-2 text-white/90 tracking-tight group-hover:text-red-400/90 transition-colors duration-300">
                    {activity.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-4">
                    <div className="flex-1 bg-cosmo-700/60 rounded-lg p-4 flex flex-col items-center border border-cosmo-500/30 backdrop-blur-sm hover:border-red-500/30 hover:bg-cosmo-700/80 transition-all duration-300 transform hover:-translate-y-1">
                      <span className="text-xs text-white/60 mb-1">OpEx</span>
                      <span className="text-lg font-semibold">
                        {activity.opEx}
                      </span>
                    </div>
                    <div className="flex-1 bg-cosmo-700/60 rounded-lg p-4 flex flex-col items-center border border-cosmo-500/30 backdrop-blur-sm hover:border-red-500/30 hover:bg-cosmo-700/80 transition-all duration-300 transform hover:-translate-y-1">
                      <span className="text-xs text-white/60 mb-1">CapEx</span>
                      <span className="text-lg font-semibold">
                        {activity.capEx}
                      </span>
                    </div>
                    <div className="flex-1 bg-cosmo-700/60 rounded-lg p-4 flex flex-col items-center border border-cosmo-500/30 backdrop-blur-sm hover:border-red-500/30 hover:bg-cosmo-700/80 transition-all duration-300 transform hover:-translate-y-1">
                      <span className="text-xs text-white/60 mb-1">
                        Turnover
                      </span>
                      <span className="text-lg font-semibold">
                        {activity.turnover}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {activity.criteria.map((c, i) => (
                      <span
                        key={c.label + i}
                        className={`px-3 py-1 rounded-full border text-xs font-medium ${c.color} flex items-center gap-1 animate-fadeIn transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10`}
                        style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2 mt-2">
                    {activity.minimumSafeguards.map((ms, i) => (
                      <span
                        key={ms + i}
                        className="px-2 py-1 rounded bg-cosmo-700/80 border border-cosmo-500/40 text-xs text-white/80 animate-fadeIn delay-300 hover:bg-cosmo-700 hover:border-red-500/30 transition-all duration-300"
                      >
                        {ms}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <span className="px-4 py-2 rounded-md bg-gradient-to-r from-red-500/80 to-red-400/80 text-white text-sm font-semibold border border-white/20 shadow-lg relative overflow-hidden group-hover:shadow-red-500/20 transition-all duration-300">
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <span className="relative z-10">{activity.article}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Environmental Data Section */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-6 text-white/90">
            Environmental Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Emisiones - Pie Chart */}
            <div className="bg-cosmo-800/70 rounded-2xl p-8 border border-white/10 shadow-xl flex flex-col items-center animate-fadeIn">
              <h4 className="text-lg font-semibold mb-4 text-white/90">
                GHG Emissions (Scope 1, 2, 3)
              </h4>
              <div className="flex flex-col items-center w-full mb-4">
                <div className="flex justify-center w-full">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={pieColors[index % pieColors.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-center">
                  {pieData.map((entry, idx) => {
                    const percent = ((entry.value / totalPie) * 100).toFixed(0);
                    return (
                      <div
                        key={entry.name}
                        className="flex items-center justify-center gap-2 whitespace-normal break-words"
                      >
                        <span
                          className="inline-block w-4 h-4 rounded-full"
                          style={{ backgroundColor: pieColors[idx] }}
                        ></span>
                        <span className="text-white/80 text-xs break-words max-w-[140px]">
                          {entry.name} - {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <button className="bg-eco-green text-cosmo-500 px-4 py-2 rounded-md font-medium hover:bg-lime-accent transition-colors">
                  Calculate
                </button>
                <button className="bg-cosmo-700 text-white px-4 py-2 rounded-md font-medium hover:bg-eco-green transition-colors">
                  Add Data
                </button>
              </div>
            </div>
            {/* Energía, Agua, Biodiversidad - Bar Chart */}
            <div className="bg-cosmo-800/70 rounded-2xl p-8 border border-white/10 shadow-xl animate-fadeIn flex flex-col items-center">
              <h4 className="text-lg font-semibold mb-4 text-white/90">
                Energy, Water & Biodiversity
              </h4>
              <div className="w-full flex justify-center mb-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ background: "#222", border: "none" }}
                      itemStyle={{ color: "#fff", fontWeight: 500 }}
                      labelStyle={{ color: "#fff", fontWeight: 700 }}
                      cursor={{ fill: "#00FF9D", fillOpacity: 0.1 }}
                    />
                    <Legend wrapperStyle={{ color: "#fff" }} />
                    <Bar
                      dataKey="Renewable"
                      stackId="a"
                      fill="#00FF9D"
                      barSize={24}
                    />
                    <Bar
                      dataKey="NonRenewable"
                      stackId="a"
                      fill="#A3E635"
                      barSize={24}
                    />
                    <Bar dataKey="Usage" fill="#00FF9D" barSize={24} />
                    <Bar dataKey="Impact" fill="#A3E635" barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <button className="bg-cosmo-700 text-white px-4 py-2 rounded-md font-medium hover:bg-eco-green transition-colors">
                  Connect to Provider
                </button>
                <button className="bg-cosmo-700 text-white px-4 py-2 rounded-md font-medium hover:bg-eco-green transition-colors">
                  Upload Receipts
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Social Data Section */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold mb-4 text-white/90">Social Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-cosmo-800/70 rounded-2xl p-6 border border-white/10 shadow-xl animate-fadeIn">
              <h4 className="text-lg font-semibold mb-2 text-white/90">
                Employee Diversity, Equity & Inclusion (DEI)
              </h4>
              <ul className="list-disc list-inside text-white/80 text-sm">
                <li>Diversity metrics</li>
                <li>Equity & inclusion programs</li>
                <li>Employee turnover</li>
                <li>Health & safety</li>
                <li>Fair wages</li>
              </ul>
            </div>
            <div className="bg-cosmo-800/70 rounded-2xl p-6 border border-white/10 shadow-xl animate-fadeIn">
              <h4 className="text-lg font-semibold mb-2 text-white/90">
                Community & Stakeholder Engagement
              </h4>
              <ul className="list-disc list-inside text-white/80 text-sm">
                <li>Community impact</li>
                <li>Stakeholder engagement</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Governance Data Section */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold mb-4 text-white/90">
            Governance Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-cosmo-800/70 rounded-2xl p-6 border border-white/10 shadow-xl animate-fadeIn">
              <h4 className="text-lg font-semibold mb-2 text-white/90">
                Board & Executive
              </h4>
              <ul className="list-disc list-inside text-white/80 text-sm">
                <li>Board composition (diversity, independence)</li>
                <li>Executive compensation linked to sustainability</li>
              </ul>
            </div>
            <div className="bg-cosmo-800/70 rounded-2xl p-6 border border-white/10 shadow-xl animate-fadeIn">
              <h4 className="text-lg font-semibold mb-2 text-white/90">
                Ethics & Rights
              </h4>
              <ul className="list-disc list-inside text-white/80 text-sm">
                <li>Anti-corruption & ethical business practices</li>
                <li>Shareholder rights & voting policies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Alignment with International Standards Section */}
        <section className="mb-10">
          <h3 className="text-2xl font-bold mb-4 text-white/90">
            Alignment with International Standards
          </h3>
          <div className="bg-cosmo-800/70 rounded-2xl p-6 border border-white/10 shadow-xl animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="flex items-center justify-between bg-cosmo-700/50 hover:bg-eco-green/20 text-white/80 hover:text-white px-4 py-3 rounded-lg transition-all duration-300 border border-white/5 hover:border-eco-green/30 group">
                <span>IFRS (S1 & S2)</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-eco-green transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>

              <button className="flex items-center justify-between bg-cosmo-700/50 hover:bg-eco-green/20 text-white/80 hover:text-white px-4 py-3 rounded-lg transition-all duration-300 border border-white/5 hover:border-eco-green/30 group">
                <span>TNFD</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-eco-green transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>

              <button className="flex items-center justify-between bg-cosmo-700/50 hover:bg-eco-green/20 text-white/80 hover:text-white px-4 py-3 rounded-lg transition-all duration-300 border border-white/5 hover:border-eco-green/30 group">
                <span>UN SDGs</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-eco-green transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>

              <button className="flex items-center justify-between bg-cosmo-700/50 hover:bg-eco-green/20 text-white/80 hover:text-white px-4 py-3 rounded-lg transition-all duration-300 border border-white/5 hover:border-eco-green/30 group">
                <span>EU Taxonomy alignment</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-eco-green transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>

              <button className="flex items-center justify-between bg-cosmo-700/50 hover:bg-eco-green/20 text-white/80 hover:text-white px-4 py-3 rounded-lg transition-all duration-300 border border-white/5 hover:border-eco-green/30 group">
                <span>SFDR classification (Article 6, 8, or 9)</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-eco-green transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>

              <button className="flex items-center justify-between bg-cosmo-700/50 hover:bg-eco-green/20 text-white/80 hover:text-white px-4 py-3 rounded-lg transition-all duration-300 border border-white/5 hover:border-eco-green/30 group">
                <span>Science-Based Targets Initiative (SBTi)</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-eco-green transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Virtual Assistant */}
      <div className="fixed bottom-8 right-8 z-50 animate-fadeIn">
        <button className="bg-eco-green text-cosmo-500 px-6 py-3 rounded-full shadow-lg font-semibold text-lg hover:bg-lime-accent transition-colors duration-200 hover:scale-105">
          Virtual Assistant
        </button>
      </div>
    </div>
  );
}

// Animaciones personalizadas (asegúrate de tenerlas en tailwind.config.js)
// animate-fadeIn: 'fadeIn 0.8s ease-out both'

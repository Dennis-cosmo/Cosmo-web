"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SearchBar from "@cosmo/web/components/investors/SearchBar";
import Filters from "@cosmo/web/components/investors/Filters";
import CompanyCard from "@cosmo/web/components/investors/CompanyCard";

// Datos de ejemplo
const companies = [
  {
    id: 1,
    name: "EcoTech Solutions",
    country: "Germany",
    sector: "Clean Energy",
    alignedPercentage: 85,
    eligiblePercentage: 92,
  },
  {
    id: 2,
    name: "Green Transport Ltd",
    country: "France",
    sector: "Transportation",
    alignedPercentage: 78,
    eligiblePercentage: 88,
  },
  {
    id: 3,
    name: "Sustainable Buildings Co",
    country: "Spain",
    sector: "Construction",
    alignedPercentage: 72,
    eligiblePercentage: 81,
  },
  {
    id: 4,
    name: "Nordic Wind Power",
    country: "Denmark",
    sector: "Clean Energy",
    alignedPercentage: 91,
    eligiblePercentage: 95,
  },
  {
    id: 5,
    name: "Smart Grid Systems",
    country: "Netherlands",
    sector: "Clean Energy",
    alignedPercentage: 88,
    eligiblePercentage: 93,
  },
  {
    id: 6,
    name: "Circular Materials SA",
    country: "Spain",
    sector: "Recycling",
    alignedPercentage: 76,
    eligiblePercentage: 84,
  },
  {
    id: 7,
    name: "BioTech Innovations",
    country: "Sweden",
    sector: "Biotechnology",
    alignedPercentage: 82,
    eligiblePercentage: 89,
  },
  {
    id: 8,
    name: "Ocean Clean Solutions",
    country: "Norway",
    sector: "Water Management",
    alignedPercentage: 87,
    eligiblePercentage: 91,
  },
  {
    id: 9,
    name: "Green Building Materials",
    country: "Italy",
    sector: "Construction",
    alignedPercentage: 79,
    eligiblePercentage: 86,
  },
  {
    id: 10,
    name: "Solar Systems AG",
    country: "Germany",
    sector: "Clean Energy",
    alignedPercentage: 93,
    eligiblePercentage: 96,
  },
  {
    id: 11,
    name: "Electric Mobility Tech",
    country: "France",
    sector: "Transportation",
    alignedPercentage: 84,
    eligiblePercentage: 90,
  },
  {
    id: 12,
    name: "Waste Management Plus",
    country: "Belgium",
    sector: "Recycling",
    alignedPercentage: 81,
    eligiblePercentage: 87,
  },
];

// Ordenar compañías por porcentaje de alineación
const sortedCompanies = companies.sort(
  (a, b) => b.alignedPercentage - a.alignedPercentage
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function InvestorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");

  // Filtrar compañías basado en búsqueda y filtros
  const filteredCompanies = useMemo(() => {
    return sortedCompanies.filter((company) => {
      const matchesSearch = company.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCountry =
        selectedCountry === "all" || company.country === selectedCountry;
      const matchesSector =
        selectedSector === "all" || company.sector === selectedSector;
      return matchesSearch && matchesCountry && matchesSector;
    });
  }, [searchTerm, selectedCountry, selectedSector]);

  return (
    <div className="space-y-8">
      {/* Sección de búsqueda y filtros */}
      <div className="space-y-4 bg-[#1A1A1A] p-6 rounded-2xl border border-[#3E9D0A]/20">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <Filters
          selectedCountry={selectedCountry}
          selectedSector={selectedSector}
          onCountryChange={setSelectedCountry}
          onSectorChange={setSelectedSector}
        />
      </div>

      {/* Lista vertical de compañías */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                mass: 1,
              }}
            >
              <CompanyCard company={company} ranking={index + 1} />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-[#1A1A1A] rounded-2xl border border-[#3E9D0A]/20">
            <p className="text-[#E1E1E1] text-lg">
              No se encontraron compañías que coincidan con los criterios de
              búsqueda.
            </p>
          </div>
        )}
      </motion.div>

      {/* Sección de estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: "Compañías Analizadas", value: "500+" },
          { label: "Actividades Sostenibles", value: "150+" },
          { label: "Países Cubiertos", value: "30+" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="bg-[#1A1A1A] rounded-2xl p-6 text-center border border-[#3E9D0A]/20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-3xl font-bold text-[#C6FF00] mb-2"
            >
              {stat.value}
            </motion.div>
            <div className="text-[#E1E1E1]">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Estilos para ocultar la barra de scroll */}
      <style jsx global>{`
        /* Ocultar scrollbar para Chrome, Safari y Opera */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

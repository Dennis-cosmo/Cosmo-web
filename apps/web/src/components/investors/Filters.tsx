"use client";

import { motion } from "framer-motion";

interface FiltersProps {
  selectedCountry: string;
  selectedSector: string;
  onCountryChange: (value: string) => void;
  onSectorChange: (value: string) => void;
}

const countries = [
  { value: "all", label: "Todos los países" },
  { value: "Spain", label: "España" },
  { value: "Germany", label: "Alemania" },
  { value: "France", label: "Francia" },
  { value: "Denmark", label: "Dinamarca" },
  { value: "Netherlands", label: "Países Bajos" },
  { value: "Sweden", label: "Suecia" },
  { value: "Norway", label: "Noruega" },
  { value: "Italy", label: "Italia" },
  { value: "Belgium", label: "Bélgica" },
];

const sectors = [
  { value: "all", label: "Todos los sectores" },
  { value: "Clean Energy", label: "Energía Limpia" },
  { value: "Transportation", label: "Transporte" },
  { value: "Construction", label: "Construcción" },
  { value: "Recycling", label: "Reciclaje" },
  { value: "Biotechnology", label: "Biotecnología" },
  { value: "Water Management", label: "Gestión del Agua" },
];

export default function Filters({
  selectedCountry,
  selectedSector,
  onCountryChange,
  onSectorChange,
}: FiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-4"
    >
      {/* Filtro de países */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-[#E1E1E1]/60 mb-2">
          País
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full bg-black/30 border border-[#3E9D0A]/20 rounded-xl px-4 py-2.5 text-[#E1E1E1]
                   focus:outline-none focus:border-[#3E9D0A]/40 focus:ring-1 focus:ring-[#3E9D0A]/40
                   transition-all duration-200"
        >
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de sectores */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-[#E1E1E1]/60 mb-2">
          Sector
        </label>
        <select
          value={selectedSector}
          onChange={(e) => onSectorChange(e.target.value)}
          className="w-full bg-black/30 border border-[#3E9D0A]/20 rounded-xl px-4 py-2.5 text-[#E1E1E1]
                   focus:outline-none focus:border-[#3E9D0A]/40 focus:ring-1 focus:ring-[#3E9D0A]/40
                   transition-all duration-200"
        >
          {sectors.map((sector) => (
            <option key={sector.value} value={sector.value}>
              {sector.label}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}

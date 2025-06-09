"use client";

import { motion } from "framer-motion";
import {
  ChartBarIcon,
  GlobeAltIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface CompanyCardProps {
  company: {
    id: number;
    name: string;
    country: string;
    sector: string;
    alignedPercentage: number;
    eligiblePercentage: number;
  };
  ranking: number;
}

export default function CompanyCard({ company, ranking }: CompanyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl bg-[#1A1A1A] border border-[#3E9D0A]/20"
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#C6FF00]/0 via-[#C6FF00]/5 to-[#C6FF00]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Contenido principal */}
      <div className="relative p-6">
        <div className="flex items-center gap-6">
          {/* Ranking */}
          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-[#3E9D0A]/10 rounded-xl">
            <span className="text-3xl font-bold text-[#C6FF00]">
              #{ranking}
            </span>
          </div>

          {/* Información de la compañía */}
          <div className="flex-grow">
            <h3 className="text-xl font-medium text-[#C6FF00] group-hover:text-[#C6FF00]/90 transition-colors">
              {company.name}
            </h3>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-[#E1E1E1]/60">
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{company.country}</span>
              </div>
              <div className="flex items-center text-[#E1E1E1]/60">
                <ChartBarIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{company.sector}</span>
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="flex-shrink-0 flex items-center gap-8">
            <div className="relative">
              <div className="text-2xl font-medium text-[#3E9D0A] group-hover:text-[#C6FF00] transition-colors">
                {company.alignedPercentage}%
              </div>
              <div className="text-sm text-[#E1E1E1]/60">Aligned</div>
              {/* Barra de progreso */}
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#3E9D0A]/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${company.alignedPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#3E9D0A]/40"
                />
              </div>
            </div>
            <div className="relative">
              <div className="text-2xl font-medium text-[#3E9D0A] group-hover:text-[#C6FF00] transition-colors">
                {company.eligiblePercentage}%
              </div>
              <div className="text-sm text-[#E1E1E1]/60">Eligible</div>
              {/* Barra de progreso */}
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#3E9D0A]/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${company.eligiblePercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#3E9D0A]/40"
                />
              </div>
            </div>
            <SparklesIcon className="h-6 w-6 text-[#3E9D0A] opacity-50 group-hover:text-[#C6FF00] group-hover:opacity-100 transition-all ml-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

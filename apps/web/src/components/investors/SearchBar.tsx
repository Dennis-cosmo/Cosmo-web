"use client";

import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="relative flex items-center bg-black/30 rounded-xl px-4 py-3 border border-[#3E9D0A]/20 focus-within:border-[#3E9D0A]/40 transition-colors">
        <MagnifyingGlassIcon className="h-5 w-5 text-[#3E9D0A] group-hover:text-[#C6FF00] transition-colors duration-300" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por nombre de compañía, ISIN o actividad sostenible..."
          className="flex-1 ml-3 bg-transparent text-[#E1E1E1] placeholder-[#E1E1E1]/40 focus:placeholder-[#E1E1E1]/60 
                   focus:outline-none transition-all"
        />

        {/* Tecla de acceso rápido */}
        <div className="hidden md:flex items-center space-x-1 ml-2">
          <kbd className="px-2 py-1 text-xs text-[#E1E1E1]/40 bg-black/30 rounded-lg border border-[#3E9D0A]/10">
            ⌘
          </kbd>
          <kbd className="px-2 py-1 text-xs text-[#E1E1E1]/40 bg-black/30 rounded-lg border border-[#3E9D0A]/10">
            K
          </kbd>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  ChartBarIcon,
  GlobeAltIcon,
  SparklesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

const navigationItems = [
  {
    name: "Subscription",
    icon: BuildingLibraryIcon,
    href: "#subscription",
  },
  {
    name: "Company Profiles",
    icon: GlobeAltIcon,
    href: "#profiles",
  },
  {
    name: "Sustainable Activity",
    icon: SparklesIcon,
    href: "#activity",
  },
  {
    name: "Portfolio Builder",
    icon: ChartBarIcon,
    href: "#portfolio",
  },
];

export default function InvestorsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cosmo-900">
      {/* Subheader con navegación */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-10 bg-cosmo-900/80 backdrop-blur-lg border-b border-eco-green/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ y: -2 }}
                  className="group flex items-center space-x-2 text-white/60 hover:text-eco-green transition-colors duration-200"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>

                  {/* Indicador de selección */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-eco-green/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    layoutId="navIndicator"
                  />
                </motion.a>
              ))}
            </div>
          </nav>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

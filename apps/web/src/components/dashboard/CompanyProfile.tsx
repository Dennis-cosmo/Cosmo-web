"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CompanyProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companyLegalName: string;
  taxId: string;
  companySize: string;
  industry: string;
  website: string;
  country: string;
  address: string;
  sustainabilityLevel: string;
  sustainabilityGoals: string[];
  certifications: string[];
  sustainabilityBudgetRange: string;
  sustainabilityNotes: string;
  createdAt: string;
}

// Mapeo de valores clave para mostrar nombres legibles
const industryNames: Record<string, string> = {
  technology: "Tecnología",
  manufacturing: "Fabricación",
  retail: "Comercio minorista",
  services: "Servicios",
  healthcare: "Salud",
  education: "Educación",
  finance: "Servicios financieros",
  energy: "Energía",
  construction: "Construcción",
  agriculture: "Agricultura",
  transportation: "Transporte",
  hospitality: "Hostelería",
  media: "Medios de comunicación",
  other: "Otro",
};

const sustainabilityLevelNames: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
  leader: "Líder",
};

const sustainabilityGoalNames: Record<string, string> = {
  carbon_reduction: "Reducción de carbono",
  waste_reduction: "Reducción de residuos",
  energy_efficiency: "Eficiencia energética",
  water_conservation: "Conservación del agua",
  sustainable_sourcing: "Abastecimiento sostenible",
  biodiversity: "Biodiversidad",
  circular_economy: "Economía circular",
  social_responsibility: "Responsabilidad social",
  other: "Otro",
};

const certificationNames: Record<string, string> = {
  iso14001: "ISO 14001",
  iso50001: "ISO 50001",
  bcorp: "B Corp",
  euEcolabel: "EU Ecolabel",
  ecovadis: "EcoVadis",
  cdp: "CDP",
  other: "Otro",
};

const budgetRangeNames: Record<string, string> = {
  under_5000: "Menos de €5.000",
  "5000_20000": "€5.000 - €20.000",
  "20000_50000": "€20.000 - €50.000",
  "50000_100000": "€50.000 - €100.000",
  over_100000: "Más de €100.000",
};

export default function CompanyProfile() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<CompanyProfileData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener datos del perfil");
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("No se pudieron cargar los datos del perfil");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [session]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 mb-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
        {error}
      </div>
    );
  }

  // Datos de fallback si la API aún no está implementada
  const displayData = profileData || {
    id: session?.user?.id || "",
    email: session?.user?.email || "",
    firstName: session?.user?.firstName || "",
    lastName: session?.user?.lastName || "",
    companyName: session?.user?.companyName || "Empresa",
    companyLegalName: "Pendiente",
    taxId: "Pendiente",
    companySize: "Pendiente",
    industry: "technology",
    website: "https://ejemplo.com",
    country: "España",
    address: "Pendiente",
    sustainabilityLevel: "beginner",
    sustainabilityGoals: ["carbon_reduction", "waste_reduction"],
    certifications: ["iso14001"],
    sustainabilityBudgetRange: "5000_20000",
    sustainabilityNotes: "Notas pendientes",
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-eco-green/20 flex items-center justify-center text-eco-green font-medium text-lg">
          {displayData.firstName.charAt(0)}
          {displayData.lastName.charAt(0)}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {displayData.firstName} {displayData.lastName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {displayData.email}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Empresa</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {displayData.companyName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sector</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {industryNames[displayData.industry] || displayData.industry}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">País</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {displayData.country}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Nivel sostenible
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {sustainabilityLevelNames[displayData.sustainabilityLevel] ||
                displayData.sustainabilityLevel}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Objetivos de sostenibilidad
        </p>
        <div className="flex flex-wrap gap-2">
          {displayData.sustainabilityGoals.map((goal) => (
            <span
              key={goal}
              className="bg-eco-green/10 text-eco-green text-xs py-1 px-2 rounded-full"
            >
              {sustainabilityGoalNames[goal] || goal}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button className="text-sm text-eco-green hover:text-lime-accent flex items-center">
          <svg
            className="h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Editar perfil completo
        </button>
      </div>
    </div>
  );
}

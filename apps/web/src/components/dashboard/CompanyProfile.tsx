"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

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

// Mapeo para mostrar nombres legibles
const industryNames: Record<string, string> = {
  technology: "Tecnología",
  manufacturing: "Manufactura",
  retail: "Comercio minorista",
  healthcare: "Salud",
  financial: "Servicios financieros",
  energy: "Energía",
  agriculture: "Agricultura",
  construction: "Construcción",
  transportation: "Transporte y logística",
  hospitality: "Hostelería y turismo",
  education: "Educación",
  consulting: "Consultoría",
  other: "Otro",
};

const sustainabilityLevelNames: Record<string, string> = {
  beginner: "Principiante - Comenzando el viaje de sostenibilidad",
  intermediate: "Intermedio - Implementando algunas prácticas",
  advanced: "Avanzado - Programa de sostenibilidad establecido",
  leader: "Líder - Referente en sostenibilidad en la industria",
};

const sustainabilityGoalNames: Record<string, string> = {
  carbon_reduction: "Reducción de huella de carbono",
  waste_reduction: "Reducción de residuos",
  renewable_energy: "Transición a energías renovables",
  water_conservation: "Conservación del agua",
  sustainable_supply: "Cadena de suministro sostenible",
  circular_economy: "Economía circular",
  esg_reporting: "Informes ESG",
  employee_wellbeing: "Bienestar de empleados",
  community_impact: "Impacto en la comunidad",
};

const certificationNames: Record<string, string> = {
  iso14001: "ISO 14001 - Gestión Ambiental",
  bcorp: "B Corp",
  iso50001: "ISO 50001 - Gestión de Energía",
  ecolabel: "EU Ecolabel",
  fairtrade: "Fairtrade",
  leed: "LEED",
  energystar: "Energy Star",
  greenguard: "GREENGUARD",
  fsc: "FSC (Forest Stewardship Council)",
};

const budgetRangeNames: Record<string, string> = {
  less_5000: "Menos de 5.000€ al año",
  "5000_20000": "Entre 5.000€ y 20.000€ al año",
  "20000_50000": "Entre 20.000€ y 50.000€ al año",
  "50000_100000": "Entre 50.000€ y 100.000€ al año",
  more_100000: "Más de 100.000€ al año",
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
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eco-green"></div>
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
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{displayData.companyName}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Usuario desde {new Date(displayData.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button className="text-sm bg-eco-green hover:bg-lime-accent text-white py-2 px-4 rounded">
          Editar perfil
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica de la empresa */}
        <section className="bg-gray-50 dark:bg-cosmo-700 rounded-lg p-4">
          <h3 className="font-medium text-lg mb-3">Información de empresa</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                Nombre comercial
              </span>
              <span className="font-medium">{displayData.companyName}</span>
            </div>

            {displayData.companyLegalName && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  Razón social
                </span>
                <span className="font-medium">
                  {displayData.companyLegalName}
                </span>
              </div>
            )}

            {displayData.taxId && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  CIF/NIF
                </span>
                <span className="font-medium">{displayData.taxId}</span>
              </div>
            )}

            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                Sector
              </span>
              <span className="font-medium">
                {industryNames[displayData.industry] || displayData.industry}
              </span>
            </div>

            {displayData.companySize && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  Tamaño
                </span>
                <span className="font-medium">{displayData.companySize}</span>
              </div>
            )}

            {displayData.website && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  Sitio web
                </span>
                <a
                  href={displayData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-eco-green hover:underline font-medium"
                >
                  {displayData.website}
                </a>
              </div>
            )}

            {displayData.country && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  País
                </span>
                <span className="font-medium">{displayData.country}</span>
              </div>
            )}

            {displayData.address && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  Dirección
                </span>
                <span className="font-medium">{displayData.address}</span>
              </div>
            )}
          </div>
        </section>

        {/* Información de contacto */}
        <section className="bg-gray-50 dark:bg-cosmo-700 rounded-lg p-4">
          <h3 className="font-medium text-lg mb-3">Información de contacto</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                Contacto principal
              </span>
              <span className="font-medium">
                {displayData.firstName} {displayData.lastName}
              </span>
            </div>

            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                Email
              </span>
              <span className="font-medium">{displayData.email}</span>
            </div>
          </div>
        </section>

        {/* Perfil de sostenibilidad */}
        <section className="bg-gray-50 dark:bg-cosmo-700 rounded-lg p-4 lg:col-span-2">
          <h3 className="font-medium text-lg mb-3">Perfil de sostenibilidad</h3>

          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                Nivel de sostenibilidad
              </span>
              <div className="mt-2">
                <div className="bg-lime-accent/10 text-eco-green py-1 px-3 rounded-full inline-flex items-center">
                  <span className="w-2 h-2 bg-eco-green rounded-full mr-2"></span>
                  <span>
                    {sustainabilityLevelNames[
                      displayData.sustainabilityLevel
                    ] || displayData.sustainabilityLevel}
                  </span>
                </div>
              </div>
            </div>

            {displayData.sustainabilityGoals &&
              displayData.sustainabilityGoals.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">
                    Objetivos de sostenibilidad
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displayData.sustainabilityGoals.map((goal) => (
                      <span
                        key={goal}
                        className="bg-gray-100 dark:bg-cosmo-600 py-1 px-2 rounded-md text-sm"
                      >
                        {sustainabilityGoalNames[goal] || goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {displayData.certifications &&
              displayData.certifications.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">
                    Certificaciones
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displayData.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="bg-gray-100 dark:bg-cosmo-600 py-1 px-2 rounded-md text-sm"
                      >
                        {certificationNames[cert] || cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {displayData.sustainabilityBudgetRange && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  Presupuesto anual para sostenibilidad
                </span>
                <span className="font-medium">
                  {budgetRangeNames[displayData.sustainabilityBudgetRange] ||
                    displayData.sustainabilityBudgetRange}
                </span>
              </div>
            )}

            {displayData.sustainabilityNotes && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">
                  Notas adicionales
                </span>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                  {displayData.sustainabilityNotes}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

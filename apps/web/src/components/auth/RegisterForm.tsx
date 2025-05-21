"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import EUTaxonomySelector from "../ui/EUTaxonomySelector";
import { TaxonomyActivity } from "../../hooks/useTaxonomy";

// Paso 1: Esquema de validación de la cuenta
const accountSchema = z
  .object({
    email: z.string().email("Por favor, introduce un email válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Función auxiliar para validar URLs con o sin protocolo
const urlValidator = (value: string) => {
  if (!value) return true; // Permitir valores vacíos

  // Si ya tiene protocolo, usar validador URL normal
  if (value.match(/^https?:\/\//i)) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  // Si no tiene protocolo, añadir https:// y validar
  try {
    new URL(`https://${value}`);
    return true;
  } catch {
    return false;
  }
};

// Paso 2: Esquema de validación de la empresa
const companySchema = z.object({
  companyName: z.string().min(2, "El nombre de la empresa es requerido"),
  companyLegalName: z.string().optional(),
  taxId: z.string().optional(),
  companySize: z
    .string()
    .min(1, "Por favor selecciona el tamaño de la empresa"),
  industry: z.string().min(1, "Por favor selecciona una industria"),
  website: z
    .string()
    .refine(urlValidator, "Por favor introduce una URL válida")
    .optional()
    .or(z.literal("")),
  country: z.string().optional(),
  address: z.string().optional(),

  // Taxonomía EU
  euTaxonomySectorIds: z.array(z.number()).min(0),
  euTaxonomySectorNames: z.array(z.string()).min(0),
  euTaxonomyActivities: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        sectorId: z.number(),
        sectorName: z.string().optional(),
        naceCodes: z.array(z.string()).optional(),
      })
    )
    .max(3, "Solo puedes seleccionar hasta 3 actividades")
    .optional(),
});

// Paso 3: Esquema de validación de sostenibilidad
const sustainabilitySchema = z.object({
  sustainabilityLevel: z.string().optional(),
  sustainabilityGoals: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  sustainabilityBudgetRange: z.string().optional(),
  sustainabilityNotes: z.string().optional(),
});

// Paso 4: Esquema de validación de verificación
const verificationSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar la política de privacidad",
  }),
});

// Esquema completo de registro
const registerSchema = z
  .object({
    // Campos de cuenta
    email: z.string().email("Por favor, introduce un email válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),

    // Campos de empresa
    companyName: z.string().min(2, "El nombre de la empresa es requerido"),
    companyLegalName: z.string().optional(),
    taxId: z.string().optional(),
    companySize: z
      .string()
      .min(1, "Por favor selecciona el tamaño de la empresa"),
    industry: z.string().min(1, "Por favor selecciona una industria"),
    website: z
      .string()
      .refine(urlValidator, "Por favor introduce una URL válida")
      .optional()
      .or(z.literal("")),
    country: z.string().optional(),
    address: z.string().optional(),

    // Taxonomía EU
    euTaxonomySectorIds: z.array(z.number()).min(0),
    euTaxonomySectorNames: z.array(z.string()).min(0),
    euTaxonomyActivities: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
          sectorId: z.number(),
          sectorName: z.string().optional(),
          naceCodes: z.array(z.string()).optional(),
        })
      )
      .max(3, "Solo puedes seleccionar hasta 3 actividades")
      .optional(),

    // Campos de sostenibilidad
    sustainabilityLevel: z.string().optional(),
    sustainabilityGoals: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    sustainabilityBudgetRange: z.string().optional(),
    sustainabilityNotes: z.string().optional(),

    // Campos de verificación
    acceptTerms: z.boolean(),
    acceptPrivacy: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.acceptTerms === true, {
    message: "Debes aceptar los términos y condiciones",
    path: ["acceptTerms"],
  })
  .refine((data) => data.acceptPrivacy === true, {
    message: "Debes aceptar la política de privacidad",
    path: ["acceptPrivacy"],
  });

// Opciones para los campos de selección
const companySizeOptions = [
  { value: "", label: "Seleccionar..." },
  { value: "1-10", label: "1-10 empleados" },
  { value: "11-50", label: "11-50 empleados" },
  { value: "51-200", label: "51-200 empleados" },
  { value: "201-1000", label: "201-1000 empleados" },
  { value: "1000+", label: "Más de 1000 empleados" },
];

const industryOptions = [
  { value: "", label: "Seleccionar..." },
  { value: "technology", label: "Tecnología" },
  { value: "manufacturing", label: "Manufactura" },
  { value: "retail", label: "Comercio minorista" },
  { value: "healthcare", label: "Salud" },
  { value: "financial", label: "Servicios financieros" },
  { value: "energy", label: "Energía" },
  { value: "agriculture", label: "Agricultura" },
  { value: "construction", label: "Construcción" },
  { value: "transportation", label: "Transporte y logística" },
  { value: "hospitality", label: "Hostelería y turismo" },
  { value: "education", label: "Educación" },
  { value: "consulting", label: "Consultoría" },
  { value: "other", label: "Otro" },
];

const sustainabilityLevelOptions = [
  { value: "", label: "Seleccionar..." },
  {
    value: "beginner",
    label: "Principiante - Comenzando el viaje de sostenibilidad",
  },
  {
    value: "intermediate",
    label: "Intermedio - Implementando algunas prácticas",
  },
  {
    value: "advanced",
    label: "Avanzado - Programa de sostenibilidad establecido",
  },
  {
    value: "leader",
    label: "Líder - Referente en sostenibilidad en la industria",
  },
];

const sustainabilityGoalsOptions = [
  { value: "carbon_reduction", label: "Reducción de huella de carbono" },
  { value: "waste_reduction", label: "Reducción de residuos" },
  { value: "renewable_energy", label: "Transición a energías renovables" },
  { value: "water_conservation", label: "Conservación del agua" },
  { value: "sustainable_supply", label: "Cadena de suministro sostenible" },
  { value: "circular_economy", label: "Economía circular" },
  { value: "esg_reporting", label: "Informes ESG" },
  { value: "employee_wellbeing", label: "Bienestar de empleados" },
  { value: "community_impact", label: "Impacto en la comunidad" },
];

const certificationsOptions = [
  { value: "iso14001", label: "ISO 14001 - Gestión Ambiental" },
  { value: "bcorp", label: "B Corp" },
  { value: "iso50001", label: "ISO 50001 - Gestión de Energía" },
  { value: "ecolabel", label: "EU Ecolabel" },
  { value: "fairtrade", label: "Fairtrade" },
  { value: "leed", label: "LEED" },
  { value: "energystar", label: "Energy Star" },
  { value: "greenguard", label: "GREENGUARD" },
  { value: "fsc", label: "FSC (Forest Stewardship Council)" },
];

const budgetRangeOptions = [
  { value: "", label: "Seleccionar..." },
  { value: "less_5000", label: "Menos de 5.000€ al año" },
  { value: "5000_20000", label: "Entre 5.000€ y 20.000€ al año" },
  { value: "20000_50000", label: "Entre 20.000€ y 50.000€ al año" },
  { value: "50000_100000", label: "Entre 50.000€ y 100.000€ al año" },
  { value: "more_100000", label: "Más de 100.000€ al año" },
];

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Cuenta
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",

    // Paso 2: Empresa
    companyName: "",
    companyLegalName: "",
    taxId: "",
    companySize: "",
    industry: "",
    website: "",
    country: "",
    address: "",

    // Taxonomía EU
    euTaxonomySectorIds: [] as number[],
    euTaxonomySectorNames: [] as string[],
    euTaxonomyActivities: [] as TaxonomyActivity[],

    // Paso 3: Sostenibilidad
    sustainabilityLevel: "",
    sustainabilityGoals: [] as string[],
    certifications: [] as string[],
    sustainabilityBudgetRange: "",
    sustainabilityNotes: "",

    // Paso 4: Verificación
    acceptTerms: false,
    acceptPrivacy: false,
  });

  // Función para actualizar el estado del formulario
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error específico
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambios en selecciones múltiples
  const handleMultiSelect = (
    name: string,
    value: string,
    isChecked: boolean
  ) => {
    setFormData((prev) => {
      const currentValues = prev[name as keyof typeof prev] as string[];

      if (Array.isArray(currentValues)) {
        if (isChecked) {
          return {
            ...prev,
            [name]: [...currentValues, value],
          };
        } else {
          return {
            ...prev,
            [name]: currentValues.filter((v) => v !== value),
          };
        }
      }

      return prev;
    });
  };

  // Manejador para el cambio de sectores de taxonomía
  const handleSectorsChange = (sectorIds: number[], sectorNames: string[]) => {
    setFormData({
      ...formData,
      euTaxonomySectorIds: sectorIds,
      euTaxonomySectorNames: sectorNames,
      // No limpiamos las actividades para permitir seleccionar de distintos sectores
    });
  };

  // Manejador para el cambio de actividades de taxonomía
  const handleActivitiesChange = (activities: TaxonomyActivity[]) => {
    setFormData({
      ...formData,
      euTaxonomyActivities: activities,
    });
  };

  // Validar los datos según el paso actual
  const validate = (currentStep: number) => {
    setErrors({});
    let isValid = true;
    let newErrors: Record<string, string> = {};

    // Validar según el paso
    if (currentStep === 1) {
      try {
        accountSchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            newErrors[err.path[0]] = err.message;
          });
          isValid = false;
        }
      }
    } else if (currentStep === 2) {
      try {
        companySchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (typeof err.path[0] === "string") {
              newErrors[err.path[0]] = err.message;
            }
          });
          isValid = false;
        }
      }

      // Validación personalizada para taxonomía EU
      if (
        formData.euTaxonomyActivities.length > 0 &&
        formData.euTaxonomySectorIds.length === 0
      ) {
        newErrors.euTaxonomySectorIds =
          "Debes seleccionar al menos un sector para añadir actividades";
        isValid = false;
      }

      if (formData.euTaxonomyActivities.length > 3) {
        newErrors.euTaxonomyActivities =
          "Solo puedes seleccionar hasta 3 actividades";
        isValid = false;
      }
    } else if (currentStep === 3) {
      try {
        sustainabilitySchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            newErrors[err.path[0]] = err.message;
          });
          isValid = false;
        }
      }
    } else if (currentStep === 4) {
      try {
        verificationSchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            newErrors[err.path[0]] = err.message;
          });
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Avanzar al siguiente paso
  const handleNext = () => {
    if (validate(step)) {
      setStep((prev) => prev + 1);
    }
  };

  // Retroceder al paso anterior
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Enviar formulario completo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate(step)) {
      return;
    }

    if (step < 4) {
      handleNext();
      return;
    }

    try {
      setIsLoading(true);

      // Preparar datos para enviar
      const dataToSubmit = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        companyLegalName: formData.companyLegalName,
        taxId: formData.taxId,
        companySize: formData.companySize,
        industry: formData.industry,
        website: formData.website,
        country: formData.country,
        address: formData.address,
        euTaxonomySectorIds: formData.euTaxonomySectorIds,
        euTaxonomySectorNames: formData.euTaxonomySectorNames,
        euTaxonomyActivities: formData.euTaxonomyActivities,
        sustainabilityLevel: formData.sustainabilityLevel,
        sustainabilityGoals: formData.sustainabilityGoals,
        certifications: formData.certifications,
        sustainabilityBudgetRange: formData.sustainabilityBudgetRange,
        sustainabilityNotes: formData.sustainabilityNotes,
        acceptTerms: formData.acceptTerms,
      };

      // Enviar datos al servidor
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Ha ocurrido un error en el registro"
        );
      }

      // Redireccionar a la página de éxito
      router.push("/auth/register-success");
    } catch (error: any) {
      console.error("Error en registro:", error);
      setGeneralError(error.message || "Error en el registro");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar el paso actual
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderAccountStep();
      case 2:
        return renderCompanyStep();
      case 3:
        return renderSustainabilityStep();
      case 4:
        return renderVerificationStep();
      default:
        return null;
    }
  };

  // Paso 1: Información de la cuenta
  const renderAccountStep = () => {
    return (
      <div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Paso 2: Información de la empresa
  const renderCompanyStep = () => {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Información de la empresa
        </h3>

        <div className="mt-4">
          <label
            htmlFor="companyName"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Nombre comercial de la empresa*
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
            value={formData.companyName}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="companyLegalName"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Razón social (opcional)
          </label>
          <input
            id="companyLegalName"
            name="companyLegalName"
            type="text"
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
            value={formData.companyLegalName}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.companyLegalName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.companyLegalName}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="taxId"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Identificación fiscal (CIF/NIF) (opcional)
          </label>
          <input
            id="taxId"
            name="taxId"
            type="text"
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
            value={formData.taxId}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.taxId && (
            <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label
              htmlFor="companySize"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Tamaño de la empresa*
            </label>
            <select
              id="companySize"
              name="companySize"
              required
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
              value={formData.companySize}
              onChange={handleChange}
              disabled={isLoading}
            >
              {companySizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.companySize && (
              <p className="mt-1 text-sm text-red-600">{errors.companySize}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="industry"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Sector/Industria*
            </label>
            <select
              id="industry"
              name="industry"
              required
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
              value={formData.industry}
              onChange={handleChange}
              disabled={isLoading}
            >
              {industryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="website"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Sitio web (opcional)
          </label>
          <input
            id="website"
            name="website"
            type="text"
            placeholder="www.ejemplo.com o https://ejemplo.com"
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
            value={formData.website}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
          <p className="text-xs mt-1 text-gray-600">
            Puedes introducir la URL con o sin https://
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label
              htmlFor="country"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              País (opcional)
            </label>
            <input
              id="country"
              name="country"
              type="text"
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
              value={formData.country}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="address"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Dirección (opcional)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-green text-gray-900"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5 bg-blue-100/70">
            <h4 className="text-base sm:text-lg font-medium text-blue-800">
              Taxonomía de Finanzas Sostenibles UE
            </h4>
            <p className="text-xs sm:text-sm text-blue-700 mt-1">
              La Taxonomía UE es un sistema de clasificación que establece qué
              actividades económicas se consideran ambientalmente sostenibles.
              Esta información nos ayuda a analizar tus gastos en el contexto de
              cumplimiento con la taxonomía.
            </p>
          </div>

          <div className="p-3 sm:p-4 md:p-5">
            <EUTaxonomySelector
              selectedSectorIds={formData.euTaxonomySectorIds}
              selectedActivities={formData.euTaxonomyActivities}
              onSectorsChange={handleSectorsChange}
              onActivitiesChange={handleActivitiesChange}
              disabled={isLoading}
            />

            <div className="mt-3 text-xs">
              <a
                href="https://ec.europa.eu/sustainable-finance-taxonomy/wizard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span>Más información sobre la Taxonomía UE</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 ml-1"
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
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Paso 3: Información de sostenibilidad
  const renderSustainabilityStep = () => {
    return (
      <>
        <h3 className="text-xl font-semibold mb-2">Perfil de sostenibilidad</h3>
        <p className="text-sm text-grey-stone mb-4">
          Estos datos nos ayudarán a personalizar tu experiencia con funciones
          de sostenibilidad relevantes para tu empresa.
        </p>

        <div className="mt-4">
          <label htmlFor="sustainabilityLevel" className="label">
            Nivel actual de sostenibilidad
          </label>
          <select
            id="sustainabilityLevel"
            name="sustainabilityLevel"
            className={`input w-full ${errors.sustainabilityLevel ? "border-red-500" : ""}`}
            value={formData.sustainabilityLevel}
            onChange={handleChange}
            disabled={isLoading}
          >
            {sustainabilityLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.sustainabilityLevel && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sustainabilityLevel}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="label block mb-2">
            Objetivos de sostenibilidad (selecciona los que apliquen)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sustainabilityGoalsOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`goal-${option.value}`}
                  type="checkbox"
                  className="h-4 w-4 text-eco-green focus:ring-lime-accent"
                  checked={formData.sustainabilityGoals.includes(option.value)}
                  onChange={(e) =>
                    handleMultiSelect(
                      "sustainabilityGoals",
                      option.value,
                      e.target.checked
                    )
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor={`goal-${option.value}`}
                  className="ml-2 text-sm text-charcoal dark:text-pure-white"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {errors.sustainabilityGoals && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sustainabilityGoals}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="label block mb-2">
            Certificaciones (selecciona las que apliquen)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {certificationsOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`cert-${option.value}`}
                  type="checkbox"
                  className="h-4 w-4 text-eco-green focus:ring-lime-accent"
                  checked={formData.certifications.includes(option.value)}
                  onChange={(e) =>
                    handleMultiSelect(
                      "certifications",
                      option.value,
                      e.target.checked
                    )
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor={`cert-${option.value}`}
                  className="ml-2 text-sm text-charcoal dark:text-pure-white"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {errors.certifications && (
            <p className="text-red-500 text-sm mt-1">{errors.certifications}</p>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="sustainabilityBudgetRange" className="label">
            Presupuesto anual aproximado para iniciativas sostenibles
          </label>
          <select
            id="sustainabilityBudgetRange"
            name="sustainabilityBudgetRange"
            className={`input w-full ${errors.sustainabilityBudgetRange ? "border-red-500" : ""}`}
            value={formData.sustainabilityBudgetRange}
            onChange={handleChange}
            disabled={isLoading}
          >
            {budgetRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.sustainabilityBudgetRange && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sustainabilityBudgetRange}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="sustainabilityNotes" className="label">
            Notas adicionales sobre sostenibilidad
          </label>
          <textarea
            id="sustainabilityNotes"
            name="sustainabilityNotes"
            rows={3}
            className={`input w-full ${errors.sustainabilityNotes ? "border-red-500" : ""}`}
            value={formData.sustainabilityNotes}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Comparte cualquier información adicional sobre tus iniciativas de sostenibilidad..."
          />
          {errors.sustainabilityNotes && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sustainabilityNotes}
            </p>
          )}
        </div>
      </>
    );
  };

  // Paso 4: Verificación y términos
  const renderVerificationStep = () => {
    return (
      <>
        <h3 className="text-xl font-semibold mb-2">Verificación final</h3>
        <p className="text-sm text-grey-stone mb-6">
          Estás a punto de completar tu registro. Revisa la información y acepta
          los términos para continuar.
        </p>

        <div className="bg-lime-accent/10 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-charcoal dark:text-pure-white mb-2">
            Resumen de registro
          </h4>
          <div className="grid grid-cols-1 gap-1 text-sm">
            <div className="flex items-start">
              <span className="font-medium w-1/3">Empresa:</span>
              <span className="text-grey-stone">{formData.companyName}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium w-1/3">Contacto:</span>
              <span className="text-grey-stone">
                {formData.firstName} {formData.lastName}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium w-1/3">Email:</span>
              <span className="text-grey-stone">{formData.email}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium w-1/3">Industria:</span>
              <span className="text-grey-stone">
                {industryOptions.find((o) => o.value === formData.industry)
                  ?.label || formData.industry}
              </span>
            </div>

            {/* Mostrar sectores de taxonomía si están seleccionados */}
            {formData.euTaxonomySectorNames.length > 0 && (
              <div className="flex items-start">
                <span className="font-medium w-1/3">Sectores EU:</span>
                <span className="text-grey-stone">
                  {formData.euTaxonomySectorNames.join(", ")}
                </span>
              </div>
            )}

            {/* Mostrar actividades económicas si están seleccionadas */}
            {formData.euTaxonomyActivities.length > 0 && (
              <div className="flex items-start">
                <span className="font-medium w-1/3">Actividades:</span>
                <div className="text-grey-stone flex-1">
                  <ul className="list-disc pl-5 space-y-1">
                    {formData.euTaxonomyActivities.map((activity) => (
                      <li key={activity.id}>
                        {activity.name}
                        {activity.naceCodes &&
                          activity.naceCodes.length > 0 && (
                            <span className="text-xs text-gray-500 block">
                              NACE: {activity.naceCodes.join(", ")}
                            </span>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start mb-4">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              className="h-4 w-4 mt-1 text-eco-green focus:ring-lime-accent"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm">
              Acepto los{" "}
              <Link
                href="/terms"
                className="text-eco-green hover:text-lime-accent"
              >
                Términos y Condiciones
              </Link>{" "}
              de Cosmo
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm -mt-2 mb-4">
              {errors.acceptTerms}
            </p>
          )}

          <div className="flex items-start">
            <input
              id="acceptPrivacy"
              name="acceptPrivacy"
              type="checkbox"
              className="h-4 w-4 mt-1 text-eco-green focus:ring-lime-accent"
              checked={formData.acceptPrivacy}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="acceptPrivacy" className="ml-2 text-sm">
              Acepto la{" "}
              <Link
                href="/privacy"
                className="text-eco-green hover:text-lime-accent"
              >
                Política de Privacidad
              </Link>{" "}
              de Cosmo
            </label>
          </div>
          {errors.acceptPrivacy && (
            <p className="text-red-500 text-sm mt-1">{errors.acceptPrivacy}</p>
          )}
        </div>
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{generalError}</span>
        </div>
      )}

      {/* Indicador de progreso */}
      <div className="flex mb-6">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex-1">
            <div
              className={`w-full h-2 ${
                stepNumber <= step
                  ? "bg-eco-green"
                  : "bg-soft-grey dark:bg-cosmo-600"
              } ${stepNumber === 1 ? "rounded-l-full" : ""} ${
                stepNumber === 4 ? "rounded-r-full" : ""
              }`}
            ></div>
            <div className="text-xs text-center mt-1">
              {stepNumber === 1 && "Cuenta"}
              {stepNumber === 2 && "Empresa"}
              {stepNumber === 3 && "Sostenibilidad"}
              {stepNumber === 4 && "Verificación"}
            </div>
          </div>
        ))}
      </div>

      {/* Contenido del paso actual */}
      {renderStep()}

      {/* Botones de navegación */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 mt-6">
        {step > 1 && (
          <button
            type="button"
            className="btn-secondary"
            onClick={handleBack}
            disabled={isLoading}
          >
            Atrás
          </button>
        )}

        {step < 4 ? (
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={handleNext}
            disabled={isLoading}
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Completando registro...
              </div>
            ) : (
              "Completar registro"
            )}
          </button>
        )}
      </div>
    </form>
  );
}

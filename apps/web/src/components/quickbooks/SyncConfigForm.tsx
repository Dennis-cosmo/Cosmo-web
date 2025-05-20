"use client";

import { useState, FormEvent } from "react";
import { QuickBooksSyncPreferences } from "../../lib/quickbooks/types";

interface SyncConfigFormProps {
  companyId: string;
  currentConfig: QuickBooksSyncPreferences;
}

export default function SyncConfigForm({
  companyId,
  currentConfig,
}: SyncConfigFormProps) {
  const [formState, setFormState] = useState<QuickBooksSyncPreferences>({
    dataTypes: currentConfig?.dataTypes || ["expenses"],
    syncFrequency: currentConfig?.syncFrequency || "daily",
    importPeriod: currentConfig?.importPeriod || "1month",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextSyncTime, setNextSyncTime] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      setError("No hay una empresa conectada");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/integrations/quickbooks/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          preferences: formState,
          forceSyncNow: false, // No forzamos sincronización aquí, solo guardamos config
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la configuración");
      }

      const data = await response.json();
      setSuccess(true);

      // Si la respuesta incluye información sobre la próxima sincronización, la mostramos
      if (data.nextSyncTime) {
        setNextSyncTime(new Date(data.nextSyncTime).toLocaleString());
      }

      // Redirigir o actualizar la página después de un breve retraso
      setTimeout(() => {
        window.location.href = `/integrations/quickbooks?company=${companyId}`;
      }, 1500);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof QuickBooksSyncPreferences,
    value: any
  ) => {
    if (field === "dataTypes") {
      // Para checkbox de tipos de datos
      const newDataTypes = [...formState.dataTypes];
      if (newDataTypes.includes(value)) {
        // Si ya está seleccionado, lo quitamos
        const index = newDataTypes.indexOf(value);
        newDataTypes.splice(index, 1);
      } else {
        // Si no está seleccionado, lo añadimos
        newDataTypes.push(value);
      }
      setFormState({ ...formState, dataTypes: newDataTypes });
    } else {
      // Para otros campos
      setFormState({ ...formState, [field]: value });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Opciones de tipos de datos */}
      <div>
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipos de datos a sincronizar
          </legend>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="dataType-expenses"
                name="dataTypes"
                type="checkbox"
                className="h-4 w-4 text-eco-green focus:ring-eco-green border-gray-300 rounded"
                checked={formState.dataTypes.includes("expenses")}
                onChange={() => handleInputChange("dataTypes", "expenses")}
              />
              <label
                htmlFor="dataType-expenses"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Gastos
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="dataType-invoices"
                name="dataTypes"
                type="checkbox"
                className="h-4 w-4 text-eco-green focus:ring-eco-green border-gray-300 rounded"
                checked={formState.dataTypes.includes("invoices")}
                onChange={() => handleInputChange("dataTypes", "invoices")}
                disabled // Deshabilitado temporalmente
              />
              <label
                htmlFor="dataType-invoices"
                className="ml-2 block text-sm text-gray-400 dark:text-gray-500"
              >
                Facturas (próximamente)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="dataType-vendors"
                name="dataTypes"
                type="checkbox"
                className="h-4 w-4 text-eco-green focus:ring-eco-green border-gray-300 rounded"
                checked={formState.dataTypes.includes("vendors")}
                onChange={() => handleInputChange("dataTypes", "vendors")}
                disabled // Deshabilitado temporalmente
              />
              <label
                htmlFor="dataType-vendors"
                className="ml-2 block text-sm text-gray-400 dark:text-gray-500"
              >
                Proveedores (próximamente)
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Frecuencia de sincronización */}
      <div>
        <label
          htmlFor="syncFrequency"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Frecuencia de sincronización
        </label>
        <select
          id="syncFrequency"
          name="syncFrequency"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-cosmo-700 dark:text-white focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md"
          value={formState.syncFrequency}
          onChange={(e) => handleInputChange("syncFrequency", e.target.value)}
        >
          <option value="hourly">Cada hora</option>
          <option value="6hours">Cada 6 horas</option>
          <option value="12hours">Cada 12 horas</option>
          <option value="daily">Diariamente</option>
        </select>
      </div>

      {/* Período de importación */}
      <div>
        <label
          htmlFor="importPeriod"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Período de datos a importar
        </label>
        <select
          id="importPeriod"
          name="importPeriod"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-cosmo-700 dark:text-white focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md"
          value={formState.importPeriod}
          onChange={(e) => handleInputChange("importPeriod", e.target.value)}
        >
          <option value="1month">Último mes</option>
          <option value="3months">Últimos 3 meses</option>
          <option value="6months">Últimos 6 meses</option>
          <option value="1year">Último año</option>
          <option value="all">Todo el historial</option>
        </select>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Guardando...
            </>
          ) : (
            "Guardar configuración"
          )}
        </button>
      </div>

      {/* Mensajes de éxito o error */}
      {success && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
          Configuración guardada correctamente.
          {nextSyncTime && (
            <div className="mt-1">
              Próxima sincronización programada: {nextSyncTime}
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </form>
  );
}

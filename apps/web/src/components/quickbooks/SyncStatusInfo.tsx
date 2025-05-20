"use client";

import { useState, useEffect } from "react";
import { QuickBooksSavedConfig } from "../../lib/quickbooks/types";

interface SyncStatusInfoProps {
  syncStatus: any;
  savedConfig: QuickBooksSavedConfig | null;
  companyId: string;
}

export default function SyncStatusInfo({
  syncStatus,
  savedConfig,
  companyId,
}: SyncStatusInfoProps) {
  const [timeUntilSync, setTimeUntilSync] = useState<string | null>(null);
  const [shouldSync, setShouldSync] = useState<boolean>(false);

  // Verificar el estado de sincronización cada 30 segundos
  useEffect(() => {
    if (!companyId) return;

    // Mostrar tiempo hasta próxima sincronización
    const getTimeUntilNextSync = () => {
      if (!savedConfig?.nextSyncTime) return;

      const now = new Date();
      const nextSync = new Date(savedConfig.nextSyncTime);
      const diffMs = nextSync.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeUntilSync("Sincronización pendiente");
        setShouldSync(true);
        return;
      }
      setShouldSync(false);

      // Formatear tiempo restante
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHours > 24) {
        const days = Math.floor(diffHours / 24);
        setTimeUntilSync(
          `En aproximadamente ${days} día${days > 1 ? "s" : ""}`
        );
      } else if (diffHours > 0) {
        setTimeUntilSync(
          `En ${diffHours} hora${diffHours > 1 ? "s" : ""} y ${diffMinutes} minuto${
            diffMinutes !== 1 ? "s" : ""
          }`
        );
      } else if (diffMinutes > 0) {
        setTimeUntilSync(
          `En ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`
        );
      } else {
        setTimeUntilSync("Muy pronto");
      }
    };

    // Verificar el estado inicialmente
    getTimeUntilNextSync();

    // Configurar intervalo para actualizar el tiempo restante
    const interval = setInterval(() => {
      getTimeUntilNextSync();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [companyId, savedConfig]);

  if (!savedConfig) {
    return null;
  }

  const { preferences, lastSyncTime, syncStats } = savedConfig;

  return (
    <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-cosmo-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Estado de sincronización
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Última sincronización */}
          <div className="bg-gray-50 dark:bg-cosmo-700 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-eco-green rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Última sincronización
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lastSyncTime
                        ? new Date(lastSyncTime).toLocaleString()
                        : "Nunca"}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Próxima sincronización */}
          <div className="bg-gray-50 dark:bg-cosmo-700 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-lime-accent rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Próxima sincronización
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {savedConfig.nextSyncTime
                        ? new Date(savedConfig.nextSyncTime).toLocaleString()
                        : "No programada"}
                    </div>
                  </dd>
                  {timeUntilSync && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {timeUntilSync}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Elementos sincronizados */}
          <div className="bg-gray-50 dark:bg-cosmo-700 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Elementos sincronizados
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {syncStats?.totalItemsSynced || 0}
                    </div>
                  </dd>
                  {syncStats?.itemsByType?.expenses && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {syncStats.itemsByType.expenses} gastos
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración actual */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Configuración actual
          </h4>
          <div className="mt-2 border-t border-gray-200 dark:border-gray-700">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500 dark:text-gray-400">
                  Tipos de datos
                </dt>
                <dd className="text-gray-900 dark:text-white">
                  {preferences.dataTypes.includes("expenses") && "Gastos"}
                  {preferences.dataTypes.includes("invoices") && ", Facturas"}
                  {preferences.dataTypes.includes("vendors") && ", Proveedores"}
                </dd>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500 dark:text-gray-400">
                  Frecuencia de sincronización
                </dt>
                <dd className="text-gray-900 dark:text-white">
                  {preferences.syncFrequency === "hourly" && "Cada hora"}
                  {preferences.syncFrequency === "6hours" && "Cada 6 horas"}
                  {preferences.syncFrequency === "12hours" && "Cada 12 horas"}
                  {preferences.syncFrequency === "daily" && "Diariamente"}
                </dd>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <dt className="text-gray-500 dark:text-gray-400">
                  Período de importación
                </dt>
                <dd className="text-gray-900 dark:text-white">
                  {preferences.importPeriod === "1month" && "Último mes"}
                  {preferences.importPeriod === "3months" && "Últimos 3 meses"}
                  {preferences.importPeriod === "6months" && "Últimos 6 meses"}
                  {preferences.importPeriod === "1year" && "Último año"}
                  {preferences.importPeriod === "all" && "Todo el historial"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Indicador de sincronización pendiente */}
        {shouldSync && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Sincronización pendiente
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                  <p>
                    Es hora de sincronizar tus datos con QuickBooks. Usa el
                    botón "Sincronizar ahora" para iniciar la sincronización.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

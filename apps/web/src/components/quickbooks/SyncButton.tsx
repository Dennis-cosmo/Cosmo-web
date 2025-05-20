"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SyncButtonProps {
  companyId: string | undefined;
  isConnected: boolean;
  isRunning: boolean;
  syncStatus: any;
}

export default function SyncButton({
  companyId,
  isConnected,
  isRunning,
  syncStatus,
}: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(isRunning);
  const [syncProgress, setSyncProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  const startSync = async (forceSync = false) => {
    if (!companyId || !isConnected || isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncProgress(10);
      setError(null);
      setSyncResult(null);
      setCompleted(false);

      console.log("Iniciando sincronización para companyId:", companyId);

      // Obtener la configuración actual para usar las mismas preferencias
      let preferences = {
        dataTypes: ["expenses"],
        syncFrequency: "daily",
        importPeriod: "1month",
      };

      // Si hay configuración guardada, usamos esa
      if (syncStatus?.savedConfig?.preferences) {
        preferences = syncStatus.savedConfig.preferences;
      }

      const response = await fetch("/api/integrations/quickbooks/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          preferences,
          forceSyncNow: forceSync, // Indicamos si forzamos la sincronización
        }),
      });

      setSyncProgress(30);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al iniciar la sincronización"
        );
      }

      const data = await response.json();
      console.log("Respuesta de sincronización:", data);

      // Si no es necesario sincronizar y no estamos forzando
      if (data.status === "waiting" && !forceSync) {
        setIsSyncing(false);
        setError(
          `No es necesario sincronizar en este momento. Próxima sincronización: ${new Date(data.nextSyncTime).toLocaleString()}`
        );
        return;
      }

      // Verificar el estado periódicamente
      const checkStatus = async () => {
        try {
          const statusResponse = await fetch(
            `/api/integrations/quickbooks/sync?companyId=${companyId}`
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log("Estado de sincronización:", statusData);

            setSyncProgress(statusData.progress || 30);

            if (statusData.error) {
              setError(`Error: ${statusData.error}`);
              setIsSyncing(false);
              return false;
            }

            if (!statusData.isRunning && statusData.lastSyncTime) {
              setSyncResult(
                `Sincronización completada el ${new Date(statusData.lastSyncTime).toLocaleString()}`
              );
              setIsSyncing(false);
              setSyncProgress(100);
              setCompleted(true);

              // Redireccionar a la página de gastos después de un breve retraso
              setTimeout(() => {
                router.push("/expenses");
              }, 1500);

              return false;
            }

            return true;
          }
          return true;
        } catch (error) {
          console.error("Error al verificar estado:", error);
          return true;
        }
      };

      // Verificar el estado cada 2 segundos
      const interval = setInterval(async () => {
        const shouldContinue = await checkStatus();
        if (!shouldContinue) {
          clearInterval(interval);
        } else {
          // Si continuamos, incrementar progreso gradualmente
          setSyncProgress((prev) => {
            const newProgress = prev + 5;
            return newProgress > 95 ? 95 : newProgress;
          });
        }
      }, 2000);

      // Establecer un tiempo límite para la sincronización (30 segundos)
      setTimeout(() => {
        clearInterval(interval);
        if (isSyncing) {
          setIsSyncing(false);
          setSyncProgress(100);
          setCompleted(true);
          setSyncResult("La sincronización ha completado");

          // Redireccionar a la página de gastos después de un breve retraso
          setTimeout(() => {
            router.refresh();
          }, 1500);
        }
      }, 30000);
    } catch (error) {
      console.error("Error al iniciar sincronización:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      setIsSyncing(false);
    }
  };

  if (!isConnected) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green opacity-50 cursor-not-allowed"
      >
        Sincronizar ahora
      </button>
    );
  }

  if (completed) {
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-green-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-500">Sincronización completada</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: "100%" }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirigiendo a la página de gastos...
        </p>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-eco-green"
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
          <span className="text-eco-green">Sincronizando...</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
          <div
            className="bg-eco-green h-2.5 rounded-full"
            style={{ width: `${syncProgress}%` }}
          ></div>
        </div>
      </div>
    );
  }

  // Agregar botón para forzar sincronización
  const shouldSync = syncStatus?.shouldSync;

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => startSync(true)} // Forzar sincronización
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
        >
          Sincronizar ahora
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 text-right">
          {error}
        </div>
      )}
      {syncResult && (
        <div className="text-sm text-green-600 dark:text-green-400 text-right">
          {syncResult}
        </div>
      )}
      {!shouldSync &&
        !error &&
        !syncResult &&
        syncStatus?.timeUntilNextSync > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
            Próxima sincronización programada{" "}
            {new Date(syncStatus.savedConfig.nextSyncTime).toLocaleString()}
          </div>
        )}
    </div>
  );
}

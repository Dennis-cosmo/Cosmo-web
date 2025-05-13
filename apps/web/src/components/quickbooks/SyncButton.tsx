"use client";

import { useState } from "react";

interface SyncButtonProps {
  companyId: string | undefined;
  isConnected: boolean;
  isRunning: boolean;
}

export default function SyncButton({
  companyId,
  isConnected,
  isRunning,
}: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(isRunning);
  const [syncProgress, setSyncProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startSync = async () => {
    if (!companyId || !isConnected || isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncProgress(10);
      setError(null);

      const response = await fetch("/api/integrations/quickbooks/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          preferences: {
            dataTypes: ["expenses"],
            syncFrequency: "daily",
            importPeriod: "1month",
          },
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
      console.log("Sincronización iniciada:", data);

      // Simular progreso (en una implementación real, consultaríamos el estado real)
      const interval = setInterval(() => {
        setSyncProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsSyncing(false);
              // Después de terminar, recargar la página para mostrar los datos actualizados
              window.location.reload();
            }, 1000);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
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

  return (
    <>
      <button
        type="button"
        onClick={startSync}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
      >
        Sincronizar ahora
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface QuickBooksSyncStatusProps {
  syncStatus: any;
}

export default function QuickBooksSyncStatus({
  syncStatus,
}: QuickBooksSyncStatusProps) {
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncCount, setSyncCount] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay información de sincronización en sessionStorage
    const storedSyncTime = sessionStorage.getItem("lastQuickBooksSyncTime");
    const storedSyncCount = sessionStorage.getItem("lastQuickBooksSyncCount");

    if (storedSyncTime) {
      setLastSyncTime(new Date(storedSyncTime).toLocaleString());
    } else if (syncStatus?.lastSyncTime) {
      setLastSyncTime(new Date(syncStatus.lastSyncTime).toLocaleString());
    }

    if (storedSyncCount) {
      setSyncCount(storedSyncCount);
    }
  }, [syncStatus]);

  if (!lastSyncTime) {
    return null; // No mostrar nada si no hay sincronización
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
            Sincronización con QuickBooks
          </h3>
          <div className="mt-2 text-sm text-green-700 dark:text-green-200">
            <p>
              {syncCount
                ? `Se han sincronizado ${syncCount} gastos desde QuickBooks.`
                : "Datos sincronizados con QuickBooks."}{" "}
              Última sincronización: {lastSyncTime}
            </p>
          </div>
          <div className="mt-3">
            <Link
              href="/integrations/quickbooks"
              className="text-sm font-medium text-green-700 dark:text-green-300 hover:underline"
            >
              Configurar sincronización
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

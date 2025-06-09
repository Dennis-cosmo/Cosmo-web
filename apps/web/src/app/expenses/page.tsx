import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import Link from "next/link";
import {
  getSyncStatus,
  getCachedExpenses,
} from "../../lib/quickbooks/services/sync";
import { QuickBooksExpense } from "../../lib/quickbooks/types";
import SustainabilityAnalysisButton from "../../components/expenses/SustainabilityAnalysisButton";
import SustainabilityAnalysisClient from "../../components/expenses/SustainabilityAnalysisClient";
import CachedExpensesList from "../../components/expenses/CachedExpensesList";

// Componente temporal para mostrar el estado de sincronización
function QuickBooksSyncStatus({ syncStatus }: { syncStatus: any }) {
  return (
    <div className="mb-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Estado de QuickBooks
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
            <p>
              {syncStatus.isRunning
                ? "Sincronización en curso..."
                : syncStatus.lastSyncTime
                  ? `Última sincronización: ${new Date(
                      syncStatus.lastSyncTime
                    ).toLocaleString()}`
                  : "No hay sincronización reciente."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Obtener el estado de sincronización
  const syncStatus = await getSyncStatus();
  const hasSyncedData =
    syncStatus.lastSyncTime !== null && syncStatus.companyId !== null;

  // Obtener gastos desde la caché en lugar de la base de datos
  let expenses: QuickBooksExpense[] = [];
  let isRealData = false;

  try {
    if (hasSyncedData && session.user?.id && syncStatus.companyId) {
      // Obtener los gastos de la caché
      expenses = await getCachedExpenses(session.user.id, syncStatus.companyId);
      isRealData = expenses.length > 0;
      console.log(`Cargados ${expenses.length} gastos desde la caché`);
    }

    // Si no hay datos en caché, cargar ejemplos
    if (!isRealData) {
      // Datos de ejemplo para mostrar cuando no hay conexión
      expenses = [
        {
          id: "example-1",
          date: new Date().toISOString().split("T")[0],
          description: "Material de oficina",
          amount: 120.5,
          currency: "EUR",
          category: "Oficina",
          vendor: "Papelería Central",
          sourceId: "example-1",
          sourceSystem: "quickbooks",
        },
        {
          id: "example-2",
          date: new Date().toISOString().split("T")[0],
          description: "Suscripción software",
          amount: 49.99,
          currency: "EUR",
          category: "Software",
          vendor: "Adobe",
          sourceId: "example-2",
          sourceSystem: "quickbooks",
        },
        {
          id: "example-3",
          date: new Date().toISOString().split("T")[0],
          description: "Equipo informático",
          amount: 899.99,
          currency: "EUR",
          category: "Hardware",
          vendor: "Apple Store",
          sourceId: "example-3",
          sourceSystem: "quickbooks",
        },
      ];
      console.log("Usando datos de ejemplo para visualización");
    }
  } catch (error) {
    console.error("Error al cargar gastos:", error);
    // Datos de ejemplo en caso de error
    expenses = [
      {
        id: "example-error-1",
        date: new Date().toISOString().split("T")[0],
        description: "Ejemplo (error al cargar datos reales)",
        amount: 100,
        currency: "EUR",
        category: "Misc",
        vendor: "Ejemplo",
        sourceId: "example-error-1",
        sourceSystem: "quickbooks",
      },
    ];
  }

  // Calcular estadísticas básicas para mostrar
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Extraer categorías únicas usando filter y reduce para compatibilidad
  const categoriesSet: { [key: string]: boolean } = {};
  expenses.forEach((expense) => {
    if (expense.category) {
      categoriesSet[expense.category] = true;
    }
  });
  const categoriesCount = Object.keys(categoriesSet).length;

  // Estadísticas de gastos
  const expenseStats = [
    {
      label: "Total mensual",
      value: `${expenses[0]?.currency || "EUR"} ${totalAmount.toFixed(2)}`,
    },
    { label: "Categorías", value: categoriesCount.toString() },
    { label: "Elementos", value: expenses.length.toString() },
    {
      label: "Última sincronización",
      value: syncStatus.lastSyncTime
        ? new Date(syncStatus.lastSyncTime).toLocaleDateString()
        : "Nunca",
    },
  ];

  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 bg-black dark:bg-deep-space min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado de la página */}
        <div className="mb-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Gastos</h1>
            <p className="mt-1 text-sm text-gray-400">
              Monitorea, clasifica y analiza todos tus gastos empresariales.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <SustainabilityAnalysisButton />
            <Link
              href="/integrations/quickbooks"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-cosmo-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-cosmo-800 hover:bg-gray-50 dark:hover:bg-cosmo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green dark:focus:ring-offset-cosmo-800"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Sincronizar QuickBooks
            </Link>
          </div>
        </div>

        {/* Componente de estado de sincronización de QuickBooks */}
        <QuickBooksSyncStatus syncStatus={syncStatus} />

        {/* Mostrar estadísticas de gastos */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {expenseStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800 dark:bg-cosmo-800 overflow-hidden shadow-lg border border-gray-700 rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-xl font-semibold text-white">
                  {stat.value}
                </dd>
              </div>
            </div>
          ))}
        </div>

        {/* Contenedor para el análisis de sostenibilidad - Ahora visible por defecto */}
        <div id="sustainability-analysis-container" className="mb-8">
          <SustainabilityAnalysisClient />
        </div>

        {/* Usar nuestro nuevo componente de listado de gastos cacheados */}
        <CachedExpensesList
          initialExpenses={expenses}
          isRealData={isRealData}
        />
      </div>
    </main>
  );
}

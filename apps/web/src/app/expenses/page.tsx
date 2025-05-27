import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import Link from "next/link";
import { getSyncStatus } from "../../lib/quickbooks/services/sync";
import { fetchExpenses } from "../../lib/quickbooks/services/expenses";
import { QuickBooksExpense } from "../../lib/quickbooks/types";
import SustainabilityAnalysisButton from "../../components/expenses/SustainabilityAnalysisButton";
import SustainabilityAnalysisClient from "../../components/expenses/SustainabilityAnalysisClient";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Obtener el estado de sincronización
  const syncStatus = await getSyncStatus();
  const hasSyncedData =
    syncStatus.lastSyncTime !== null && syncStatus.companyId !== null;

  // Variable para almacenar los gastos reales o ficticios
  let expenses: QuickBooksExpense[] = [];
  let isRealData = false;

  if (hasSyncedData && syncStatus.companyId) {
    try {
      // Intentar obtener datos reales de QuickBooks
      // Para una implementación completa, deberíamos obtener estos datos de la base de datos
      // Aquí usamos directamente fetchExpenses como ejemplo
      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 1);
      const startDate = fromDate.toISOString().split("T")[0];

      expenses = await fetchExpenses(syncStatus.companyId, startDate);
      isRealData = expenses.length > 0;

      console.log(`Cargados ${expenses.length} gastos reales desde QuickBooks`);
    } catch (error) {
      console.error("Error al cargar gastos desde QuickBooks:", error);
      // Si falla la carga de datos reales, continuamos con datos ficticios
    }
  }

  // Si no hay datos reales, usar datos ficticios para demo
  if (!isRealData) {
    expenses = [
      {
        id: "exp-001",
        date: "2023-04-12",
        description: "Servicios de consultoría",
        amount: 1250.0,
        currency: "EUR",
        category: "Servicios profesionales",
        supplier: "Consultoría Verde S.L.",
        notes: "",
        paymentMethod: "Transferencia",
        sourceId: "demo-001",
        sourceSystem: "quickbooks",
        rawData: {},
      },
      {
        id: "exp-002",
        date: "2023-04-10",
        description: "Electricidad oficina central",
        amount: 485.75,
        currency: "EUR",
        category: "Energía",
        supplier: "EnergyPower Inc.",
        notes: "",
        paymentMethod: "Domiciliación",
        sourceId: "demo-002",
        sourceSystem: "quickbooks",
        rawData: {},
      },
      // ... más datos ficticios ...
    ];
  }

  // Calcular estadísticas basadas en los gastos
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  // Extraer categorías únicas
  const uniqueCategories = new Set<string>();
  expenses.forEach((expense) => {
    if (expense.category) uniqueCategories.add(expense.category);
  });
  const categories = uniqueCategories.size;

  // Extraer proveedores únicos para el filtro
  const uniqueSuppliers = new Set<string>();
  expenses.forEach((expense) => {
    if (expense.supplier) uniqueSuppliers.add(expense.supplier);
  });

  // Convertir Sets a Arrays para iteración
  const categoriesArray = Array.from(uniqueCategories);
  const suppliersArray = Array.from(uniqueSuppliers);

  // Estadísticas de gastos
  const expenseStats = [
    {
      label: "Total mensual",
      value: `${expenses[0]?.currency || "EUR"} ${totalAmount.toFixed(2)}`,
    },
    { label: "Categorías", value: categories.toString() },
    { label: "Elementos", value: expenses.length.toString() },
    {
      label: "Última sincronización",
      value: syncStatus.lastSyncTime
        ? new Date(syncStatus.lastSyncTime).toLocaleDateString()
        : "Nunca",
    },
  ];

  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-deep-space min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado de la página */}
        <div className="mb-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Gastos
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitorea, clasifica y analiza todos tus gastos empresariales.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <SustainabilityAnalysisButton />
            <button
              type="button"
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
              Importar gastos
            </button>
          </div>
        </div>

        {/* Aviso de fuente de datos */}
        {isRealData ? (
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                  Datos sincronizados
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-200">
                  <p>
                    Mostrando datos reales importados desde QuickBooks. Última
                    sincronización:{" "}
                    {syncStatus.lastSyncTime
                      ? new Date(syncStatus.lastSyncTime).toLocaleString()
                      : "Desconocida"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : hasSyncedData ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
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
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Datos de ejemplo
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                  <p>
                    No se encontraron gastos en QuickBooks. Mostrando datos de
                    ejemplo para visualización.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
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
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Información sobre gastos
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                  <p>
                    Los gastos se importan automáticamente desde sistemas de
                    gestión empresarial como SAP o QuickBooks.
                    <Link
                      href="/integrations/quickbooks"
                      className="font-medium underline ml-1"
                    >
                      Configura ahora la integración con QuickBooks
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la página */}
        <div>
          {/* Componente de análisis de sostenibilidad */}
          <div
            id="sustainability-analysis-container"
            className="hidden mb-8"
          ></div>

          {/* Montar el cliente de análisis de sostenibilidad para el modal y resultados */}
          <SustainabilityAnalysisClient />

          {/* Resto del contenido de la página */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {expenseStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-cosmo-800 overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white dark:bg-cosmo-800 shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Filtrar gastos
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Fecha
                  </label>
                  <select
                    id="date"
                    name="date"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                  >
                    <option>Todos los períodos</option>
                    <option>Último mes</option>
                    <option>Últimos 3 meses</option>
                    <option>Últimos 6 meses</option>
                    <option>Último año</option>
                    <option>Personalizado</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Categoría
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                  >
                    <option>Todas las categorías</option>
                    {categoriesArray.map((category, index) => (
                      <option key={index}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="supplier"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Proveedor
                  </label>
                  <select
                    id="supplier"
                    name="supplier"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                  >
                    <option>Todos los proveedores</option>
                    {suppliersArray.map((supplier, index) => (
                      <option key={index}>{supplier}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Buscar
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="focus:ring-eco-green focus:border-eco-green block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                      placeholder="Buscar gastos..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listado de gastos */}
          {expenses.length > 0 ? (
            <div className="flex flex-col mt-8">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 dark:border-cosmo-700 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-cosmo-700">
                      <thead className="bg-gray-50 dark:bg-cosmo-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Fecha
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Descripción
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Importe
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Categoría
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Proveedor
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-cosmo-800 divide-y divide-gray-200 dark:divide-cosmo-700">
                        {expenses.map((expense, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0
                                ? "bg-gray-50 dark:bg-cosmo-700/30"
                                : "bg-white dark:bg-cosmo-800"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {new Date(expense.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              <a
                                href={`/expenses/${expense.id}`}
                                className="text-eco-green hover:text-eco-green/80"
                              >
                                {expense.description}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {new Intl.NumberFormat("es-ES", {
                                style: "currency",
                                currency: expense.currency,
                              }).format(expense.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {expense.category || "Sin categoría"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {expense.supplier || "No especificado"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-cosmo-800 shadow rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 10c0 5-3.5 8.5-7 11.5-3.5-3-7-6.5-7-11.5a7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No hay gastos
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No se encontraron gastos para el período seleccionado.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-eco-green hover:bg-eco-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
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
                  Importar gastos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

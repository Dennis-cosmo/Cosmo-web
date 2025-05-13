import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import Link from "next/link";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Datos ficticios para la demostración
  const expenses = [
    {
      id: "exp-001",
      date: "12/04/2023",
      description: "Servicios de consultoría",
      amount: "€1,250.00",
      category: "Servicios profesionales",
      impact: "bajo",
      status: "aprobado",
    },
    {
      id: "exp-002",
      date: "10/04/2023",
      description: "Electricidad oficina central",
      amount: "€485.75",
      category: "Energía",
      impact: "medio",
      status: "pendiente",
    },
    {
      id: "exp-003",
      date: "05/04/2023",
      description: "Materiales de embalaje",
      amount: "€750.25",
      category: "Materiales",
      impact: "alto",
      status: "aprobado",
    },
    {
      id: "exp-004",
      date: "01/04/2023",
      description: "Transporte de mercancías",
      amount: "€1,120.00",
      category: "Transporte",
      impact: "alto",
      status: "rechazado",
    },
    {
      id: "exp-005",
      date: "28/03/2023",
      description: "Renovación licencias software",
      amount: "€890.50",
      category: "IT y Software",
      impact: "bajo",
      status: "aprobado",
    },
    {
      id: "exp-006",
      date: "25/03/2023",
      description: "Mantenimiento equipos",
      amount: "€340.00",
      category: "Mantenimiento",
      impact: "bajo",
      status: "pendiente",
    },
    {
      id: "exp-007",
      date: "20/03/2023",
      description: "Viajes corporativos",
      amount: "€1,875.25",
      category: "Viajes",
      impact: "alto",
      status: "aprobado",
    },
    {
      id: "exp-008",
      date: "15/03/2023",
      description: "Materiales oficina",
      amount: "€235.10",
      category: "Suministros",
      impact: "bajo",
      status: "aprobado",
    },
  ];

  // Estadísticas de gastos
  const expenseStats = [
    { label: "Total mensual", value: "€7,946.85" },
    { label: "Categorías", value: "8" },
    { label: "Pendientes", value: "2" },
    { label: "Huella de carbono", value: "1.8 t" },
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
          <div className="mt-4 sm:mt-0">
            <Link
              href="/integrations"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Configurar integraciones
            </Link>
          </div>
        </div>

        {/* Aviso de integraciones */}
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
                  gestión empresarial como SAP o QuickBooks. Próximamente podrás
                  configurar estas integraciones en la sección de
                  "Integraciones".
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
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
                  <option>Servicios profesionales</option>
                  <option>Energía</option>
                  <option>Materiales</option>
                  <option>Transporte</option>
                  <option>IT y Software</option>
                  <option>Mantenimiento</option>
                  <option>Viajes</option>
                  <option>Suministros</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="impact"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Impacto ambiental
                </label>
                <select
                  id="impact"
                  name="impact"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                >
                  <option>Todos</option>
                  <option>Alto</option>
                  <option>Medio</option>
                  <option>Bajo</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                >
                  <option>Todos</option>
                  <option>Aprobado</option>
                  <option>Pendiente</option>
                  <option>Rechazado</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Buscar gastos por descripción, ID o cantidad..."
                  className="focus:ring-eco-green focus:border-eco-green block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
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

        {/* Tabla de gastos */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-200 dark:border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Lista de gastos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-cosmo-700">
              <thead className="bg-gray-50 dark:bg-cosmo-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    ID
                  </th>
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
                    Impacto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-cosmo-800 divide-y divide-gray-200 dark:divide-cosmo-700">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 dark:hover:bg-cosmo-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {expense.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {expense.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200 max-w-xs truncate">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {expense.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          expense.impact === "alto"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : expense.impact === "medio"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {expense.impact}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          expense.status === "aprobado"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : expense.status === "pendiente"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/expenses/${expense.id}`}
                        className="text-eco-green hover:text-lime-accent mr-3"
                      >
                        Ver
                      </Link>
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        title="Clasificar gasto"
                      >
                        Clasificar
                      </button>
                      <button
                        className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                        title="Aprobar gasto"
                      >
                        Aprobar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          <div className="bg-white dark:bg-cosmo-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-cosmo-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-cosmo-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-cosmo-700 hover:bg-gray-50 dark:hover:bg-cosmo-600"
              >
                Anterior
              </a>
              <a
                href="#"
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-cosmo-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-cosmo-700 hover:bg-gray-50 dark:hover:bg-cosmo-600"
              >
                Siguiente
              </a>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando <span className="font-medium">1</span> a{" "}
                  <span className="font-medium">8</span> de{" "}
                  <span className="font-medium">20</span> resultados
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-cosmo-600 bg-white dark:bg-cosmo-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-cosmo-600"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-current="page"
                    className="z-10 bg-eco-green border-eco-green text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="bg-white dark:bg-cosmo-700 border-gray-300 dark:border-cosmo-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-cosmo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    2
                  </a>
                  <a
                    href="#"
                    className="bg-white dark:bg-cosmo-700 border-gray-300 dark:border-cosmo-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-cosmo-600 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium"
                  >
                    3
                  </a>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-cosmo-600 bg-white dark:bg-cosmo-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                    ...
                  </span>
                  <a
                    href="#"
                    className="bg-white dark:bg-cosmo-700 border-gray-300 dark:border-cosmo-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-cosmo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    8
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-cosmo-600 bg-white dark:bg-cosmo-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-cosmo-600"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

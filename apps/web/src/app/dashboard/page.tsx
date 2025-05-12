import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import CompanyProfile from "../../components/dashboard/CompanyProfile";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Datos ficticios para el dashboard
  const stats = [
    { label: "Total de gastos", value: "€8,245.50", change: "+14%" },
    { label: "Huella de carbono", value: "2.4 t", change: "-8%" },
    { label: "Puntuación ESG", value: "72/100", change: "+5%" },
    { label: "Tasa de reciclaje", value: "68%", change: "+12%" },
  ];

  const recentExpenses = [
    {
      id: "exp-001",
      date: "12/04/2023",
      description: "Servicios de consultoría",
      amount: "€1,250.00",
      category: "Servicios profesionales",
      impact: "bajo",
    },
    {
      id: "exp-002",
      date: "10/04/2023",
      description: "Electricidad oficina central",
      amount: "€485.75",
      category: "Energía",
      impact: "medio",
    },
    {
      id: "exp-003",
      date: "05/04/2023",
      description: "Materiales de embalaje",
      amount: "€750.25",
      category: "Materiales",
      impact: "alto",
    },
    {
      id: "exp-004",
      date: "01/04/2023",
      description: "Transporte de mercancías",
      amount: "€1,120.00",
      category: "Transporte",
      impact: "alto",
    },
  ];

  const quickActions = [
    {
      name: "Registrar gastos",
      description: "Añadir un nuevo gasto a tu registro",
      icon: "receipt",
      href: "/expenses/new",
    },
    {
      name: "Generar informe",
      description: "Crear un nuevo informe de sostenibilidad",
      icon: "chart",
      href: "/reports/new",
    },
    {
      name: "Conectar integración",
      description: "Añadir nuevas fuentes de datos a tu cuenta",
      icon: "link",
      href: "/integrations",
    },
    {
      name: "Ver análisis",
      description: "Analizar tendencias y patrones de consumo",
      icon: "graph",
      href: "/analytics",
    },
  ];

  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-deep-space min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado del dashboard */}
        <div className="mb-8 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bienvenido, {session.user.firstName}. Aquí tienes un resumen de tu
              impacto ambiental.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Nuevo gasto
            </button>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-cosmo-800 overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </dd>
                <dd
                  className={`mt-2 text-sm ${
                    stat.change.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stat.change}
                </dd>
              </div>
            </div>
          ))}
        </div>

        {/* Sección principal con múltiples columnas */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna izquierda: Perfil de empresa */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-cosmo-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Perfil de empresa
                </h2>
                <CompanyProfile />
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="mt-6 bg-white dark:bg-cosmo-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Acciones rápidas
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="p-3 flex flex-col items-center text-center rounded-md hover:bg-gray-50 dark:hover:bg-cosmo-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-eco-green bg-opacity-20 flex items-center justify-center mb-2">
                        {action.icon === "receipt" && (
                          <svg
                            className="h-6 w-6 text-eco-green"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        )}
                        {action.icon === "chart" && (
                          <svg
                            className="h-6 w-6 text-eco-green"
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
                        )}
                        {action.icon === "link" && (
                          <svg
                            className="h-6 w-6 text-eco-green"
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
                        )}
                        {action.icon === "graph" && (
                          <svg
                            className="h-6 w-6 text-eco-green"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {action.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Gastos recientes */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-cosmo-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Gastos recientes
                  </h2>
                  <Link
                    href="/expenses"
                    className="text-sm font-medium text-eco-green hover:text-lime-accent"
                  >
                    Ver todos
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-cosmo-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Fecha
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Descripción
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Categoría
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Importe
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Impacto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-cosmo-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {expense.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {expense.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {expense.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                          {expense.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              expense.impact === "bajo"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : expense.impact === "medio"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {expense.impact}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gráfico de progreso */}
            <div className="mt-6 bg-white dark:bg-cosmo-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Progreso de sostenibilidad
                </h2>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reducción de huella de carbono
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      65%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-eco-green h-2.5 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uso de energía renovable
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      42%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-eco-green h-2.5 rounded-full"
                      style={{ width: "42%" }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reducción de residuos
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      78%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-eco-green h-2.5 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uso de materiales sostenibles
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      51%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-eco-green h-2.5 rounded-full"
                      style={{ width: "51%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

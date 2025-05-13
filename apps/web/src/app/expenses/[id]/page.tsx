import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import Link from "next/link";

interface ExpensePageProps {
  params: {
    id: string;
  };
}

export default async function ExpenseDetailPage({ params }: ExpensePageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const { id } = params;

  // En una implementación real, aquí consultaríamos el gasto desde la API
  // Datos ficticios para demostración
  const expense = {
    id: id,
    date: "12/04/2023",
    description: "Servicios de consultoría para proyecto sostenibilidad",
    amount: "€1,250.00",
    category: "Servicios profesionales",
    impact: "bajo",
    status: "aprobado",
    paymentMethod: "Transferencia bancaria",
    supplier: "EcoConsult S.L.",
    notes:
      "Servicios de consultoría para el proyecto de transformación sostenible de la cadena de suministro. Factura mensual correspondiente a abril 2023.",
    tags: ["consultoría", "proyecto-sostenibilidad", "recurrente"],
    carbonFootprint: "0.12 t CO2e",
    waterUsage: "N/A",
    wasteGeneration: "N/A",
    createdBy: "Ana García",
    createdAt: "10/04/2023 09:45",
    updatedAt: "12/04/2023 14:30",
    approvedBy: "Carlos Rodríguez",
    source: "Importado desde SAP",
    historyLog: [
      {
        action: "Creación",
        timestamp: "10/04/2023 09:45",
        user: "Ana García",
      },
      {
        action: "Modificación",
        timestamp: "11/04/2023 11:20",
        user: "Ana García",
        details: "Se actualizó el importe y la descripción",
      },
      {
        action: "Aprobación",
        timestamp: "12/04/2023 14:30",
        user: "Carlos Rodríguez",
      },
    ],
  };

  // Generar colores para las etiquetas según el impacto
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "alto":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medio":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "bajo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "aprobado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rechazado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-deep-space min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Navegación y acciones */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/expenses"
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-eco-green dark:hover:text-lime-accent"
            >
              <svg
                className="mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver a gastos
            </Link>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg
                className="-ml-0.5 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Clasificar
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
              <svg
                className="-ml-0.5 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
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
              Aprobar
            </button>
          </div>
        </div>

        {/* Aviso de importación */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
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
                Información sobre este gasto
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                <p>
                  Este gasto fue importado automáticamente desde{" "}
                  {expense.source}. Los datos originales no pueden ser
                  modificados, pero puedes clasificar el gasto y ajustar su
                  impacto ambiental.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cabecera con información general */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {expense.description}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                {expense.id}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {expense.amount}
              </span>
              <div className="mt-2 flex space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(
                    expense.impact
                  )}`}
                >
                  Impacto: {expense.impact}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    expense.status
                  )}`}
                >
                  {expense.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del gasto */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Detalles del gasto
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-cosmo-700">
            <dl>
              <div className="bg-gray-50 dark:bg-cosmo-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Fecha
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.date}
                </dd>
              </div>
              <div className="bg-white dark:bg-cosmo-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Fuente
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.source}
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-cosmo-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Categoría
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.category}
                </dd>
              </div>
              <div className="bg-white dark:bg-cosmo-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Método de pago
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.paymentMethod}
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-cosmo-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Proveedor
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.supplier}
                </dd>
              </div>
              <div className="bg-white dark:bg-cosmo-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Etiquetas
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {expense.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-eco-green bg-opacity-10 text-eco-green"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-cosmo-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Notas
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.notes}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Impacto ambiental */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Impacto ambiental
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Métricas de sostenibilidad asociadas a este gasto
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-cosmo-700">
            <dl>
              <div className="bg-gray-50 dark:bg-cosmo-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Huella de carbono
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.carbonFootprint}
                </dd>
              </div>
              <div className="bg-white dark:bg-cosmo-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Uso de agua
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.waterUsage}
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-cosmo-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Generación de residuos
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {expense.wasteGeneration}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Historial de actividad */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Historial de actividad
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <ul className="space-y-4">
              {expense.historyLog.map((log, index) => (
                <li
                  key={index}
                  className="bg-gray-50 dark:bg-cosmo-700 p-3 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.action}
                      </p>
                      {log.details && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.timestamp}
                      </p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                        {log.user}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import Link from "next/link";
import { getSyncStatus } from "../../../lib/quickbooks/services/sync";
import SyncButton from "../../../components/quickbooks/SyncButton";

export default async function QuickBooksIntegrationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Verificar si hay parámetros de status o error en la URL
  const status = searchParams.status;
  const error = searchParams.error;
  const errorMessage = searchParams.message;
  const companyId = searchParams.company as string | undefined;

  // Obtener el estado actual de la sincronización
  const syncStatus = getSyncStatus();

  // Determinar si la conexión está activa
  const isConnected = !!companyId || syncStatus.companyId !== null;

  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-deep-space min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Navegación */}
        <div className="mb-6">
          <Link
            href="/integrations"
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
            Volver a integraciones
          </Link>
        </div>

        {/* Mensajes de estado */}
        {status === "success" && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
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
                  Conexión exitosa
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-200">
                  <p>
                    Tu cuenta de QuickBooks ha sido conectada exitosamente.
                    Ahora puedes comenzar a importar tus datos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error de conexión
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-200">
                  <p>
                    {errorMessage ||
                      "Ocurrió un error al conectar con QuickBooks. Por favor intenta de nuevo."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Encabezado */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-white dark:bg-cosmo-700 rounded-lg p-2 flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-400 dark:text-gray-300">
                  QB
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Integración con QuickBooks
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Conecta con QuickBooks para importar gastos y facturas
                  automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de OAuth */}
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
                Acerca de la integración con QuickBooks
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                <p>
                  Esta integración utiliza OAuth 2.0 para conectar de forma
                  segura con tu cuenta de QuickBooks Online. Necesitarás
                  autorizar a nuestra aplicación para acceder a tus datos
                  financieros.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pasos de configuración */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Pasos de configuración
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Sigue estos pasos para conectar QuickBooks con nuestra plataforma.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <nav aria-label="Progress">
              <ol className="overflow-hidden">
                <li className="relative pb-10">
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-eco-green"
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-eco-green rounded-full">
                        <svg
                          className="w-5 h-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </span>
                    <div className="ml-4 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Requisitos previos
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Asegúrate de tener:
                      </p>
                      <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400 list-disc pl-5 space-y-1">
                        <li>Una cuenta activa de QuickBooks Online</li>
                        <li>
                          Permisos de administrador en tu cuenta de QuickBooks
                        </li>
                        <li>Navegador actualizado con cookies habilitadas</li>
                      </ul>
                    </div>
                  </div>
                </li>

                <li className="relative pb-10">
                  <div
                    className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${
                      isConnected
                        ? "bg-eco-green"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span
                        className={`relative z-10 w-8 h-8 flex items-center justify-center ${
                          isConnected
                            ? "bg-eco-green"
                            : "bg-white dark:bg-cosmo-700 border-2 border-gray-300 dark:border-gray-600"
                        } rounded-full`}
                      >
                        {isConnected ? (
                          <svg
                            className="w-5 h-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                        )}
                      </span>
                    </span>
                    <div className="ml-4 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Autorizar la conexión
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Conecta tu cuenta de QuickBooks mediante OAuth:
                      </p>
                      <div className="mt-4">
                        {isConnected ? (
                          <div className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green">
                            <svg
                              className="mr-2 h-5 w-5"
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
                            Conectado con QuickBooks
                          </div>
                        ) : (
                          <Link
                            href="/api/integrations/quickbooks/auth"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2CA01C] hover:bg-[#1F8A10] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2CA01C]"
                          >
                            <svg
                              className="mr-2 h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22.09 5.78c0-.4-.13-.75-.36-1.06-.23-.28-.56-.48-.97-.55L11.97.1c-.38-.09-.75-.04-1.08.1-.37.15-.7.41-.94.77L.15 17.36c-.31.49-.37 1.08-.13 1.6.23.53.7.91 1.28 1.08l8.79 2.5c.1.03.2.04.31.04.18 0 .36-.02.53-.08.37-.13.7-.38.94-.74l9.97-15.03c.21-.31.31-.67.3-.94h-.05zm-10.39 13.8l-1.34-.39c-.01-.01-.03-.02-.04-.02l-.27-.08c-.25.36-.6.64-1 .82-.42.18-.88.2-1.32.05l-7.47-2.13 9.2-16h.01L22.05 9.7l-10.35 9.87z"></path>
                            </svg>
                            Conectar con QuickBooks
                          </Link>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Se abrirá una ventana de QuickBooks para que autorices
                        la conexión.
                      </p>
                    </div>
                  </div>
                </li>

                <li className="relative pb-10">
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300 dark:bg-gray-600"
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-cosmo-700 border-2 border-gray-300 dark:border-gray-600 rounded-full">
                        <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                      </span>
                    </span>
                    <div className="ml-4 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Configurar preferencias
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Personaliza cómo se importarán tus datos:
                      </p>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tipo de datos a importar
                          </label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                              <input
                                id="expenses"
                                name="data_type"
                                type="checkbox"
                                defaultChecked
                                className="h-4 w-4 text-eco-green focus:ring-eco-green border-gray-300 rounded dark:bg-cosmo-700 dark:border-cosmo-600"
                              />
                              <label
                                htmlFor="expenses"
                                className="ml-3 text-sm text-gray-500 dark:text-gray-400"
                              >
                                Gastos y compras
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="invoices"
                                name="data_type"
                                type="checkbox"
                                className="h-4 w-4 text-eco-green focus:ring-eco-green border-gray-300 rounded dark:bg-cosmo-700 dark:border-cosmo-600"
                              />
                              <label
                                htmlFor="invoices"
                                className="ml-3 text-sm text-gray-500 dark:text-gray-400"
                              >
                                Facturas
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="vendors"
                                name="data_type"
                                type="checkbox"
                                className="h-4 w-4 text-eco-green focus:ring-eco-green border-gray-300 rounded dark:bg-cosmo-700 dark:border-cosmo-600"
                              />
                              <label
                                htmlFor="vendors"
                                className="ml-3 text-sm text-gray-500 dark:text-gray-400"
                              >
                                Proveedores
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Frecuencia de sincronización
                          </label>
                          <select
                            id="sync_frequency"
                            name="sync_frequency"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                          >
                            <option>Diaria</option>
                            <option>Cada 12 horas</option>
                            <option>Cada 6 horas</option>
                            <option>Cada hora</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Periodo de importación inicial
                          </label>
                          <select
                            id="import_period"
                            name="import_period"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                          >
                            <option>Último mes</option>
                            <option>Últimos 3 meses</option>
                            <option>Últimos 6 meses</option>
                            <option>Último año</option>
                            <option>Todo el historial</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="relative">
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-cosmo-700 border-2 border-gray-300 dark:border-gray-600 rounded-full">
                        <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                      </span>
                    </span>
                    <div className="ml-4 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Finalizar configuración
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Una vez autorizada la conexión y configuradas las
                        preferencias, podrás comenzar a importar datos.
                      </p>
                      <div className="mt-4 bg-gray-50 dark:bg-cosmo-700 p-4 rounded-md">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Qué sucederá después:
                        </h5>
                        <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc pl-5 space-y-1">
                          <li>
                            Importaremos tus datos según la configuración
                            seleccionada
                          </li>
                          <li>
                            Clasificaremos automáticamente los gastos según
                            nuestra base de conocimientos
                          </li>
                          <li>
                            Calcularemos métricas de sostenibilidad para cada
                            transacción
                          </li>
                          <li>
                            Podrás revisar y ajustar la clasificación en la
                            sección de gastos
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Estado de la conexión */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Estado de la conexión
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              {isConnected ? (
                <>
                  <svg
                    className="h-8 w-8 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    Conectado a QuickBooks
                    {companyId && ` (Empresa ID: ${companyId})`}
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="h-8 w-8 text-gray-400 dark:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.07m-1.607 1.607a2 2 0 010 2.828"
                    />
                  </svg>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    No conectado
                  </span>
                </>
              )}
            </div>

            {syncStatus.lastSyncTime && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Última sincronización:{" "}
                {new Date(syncStatus.lastSyncTime).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/integrations"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-cosmo-800 hover:bg-gray-50 dark:hover:bg-cosmo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
          >
            Cancelar
          </Link>

          {/* Usar el componente cliente para el botón de sincronización */}
          <SyncButton
            companyId={companyId || syncStatus.companyId || undefined}
            isConnected={isConnected}
            isRunning={syncStatus.isRunning}
          />
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import Link from "next/link";

export default async function SAPIntegrationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

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

        {/* Encabezado */}
        <div className="bg-white dark:bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-white dark:bg-cosmo-700 rounded-lg p-2 flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-400 dark:text-gray-300">
                  SA
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Integración con SAP
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Conecta con tu sistema SAP para importar datos de gastos
                  automáticamente.
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
              Sigue estos pasos para conectar tu sistema SAP con nuestra
              plataforma.
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
                        Antes de comenzar, asegúrate de tener disponible:
                      </p>
                      <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400 list-disc pl-5 space-y-1">
                        <li>Acceso de administrador a tu sistema SAP</li>
                        <li>Permisos para crear conexiones API</li>
                        <li>Módulo SAP FI (Finanzas) configurado</li>
                      </ul>
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
                        Configuración en SAP
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Configura el acceso a la API de SAP:
                      </p>
                      <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400 list-disc pl-5 space-y-1">
                        <li>Crea un usuario de servicio para la integración</li>
                        <li>Habilita OData o REST API en tu sistema SAP</li>
                        <li>
                          Configura los permisos adecuados para acceder a los
                          datos financieros
                        </li>
                      </ul>
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
                        Conexión con nuestra plataforma
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Introduce tus credenciales y detalles de conexión:
                      </p>
                      <form className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="sap_url"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              URL del servidor SAP
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="sap_url"
                                id="sap_url"
                                placeholder="https://sap-api.tuempresa.com"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-gray-300 rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="api_key"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              API Key
                            </label>
                            <div className="mt-1">
                              <input
                                type="password"
                                name="api_key"
                                id="api_key"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-gray-300 rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="username"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Usuario de servicio
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="username"
                                id="username"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-gray-300 rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="password"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Contraseña
                            </label>
                            <div className="mt-1">
                              <input
                                type="password"
                                name="password"
                                id="password"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-gray-300 rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label
                              htmlFor="client_id"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              ID del cliente SAP
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="client_id"
                                id="client_id"
                                placeholder="100"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-gray-300 rounded-md dark:bg-cosmo-700 dark:border-cosmo-600 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </form>
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
                        Configurar mapeo de datos
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Configura cómo se mapean los campos de SAP a nuestra
                        plataforma:
                      </p>
                      <div className="mt-4 bg-gray-50 dark:bg-cosmo-700 p-4 rounded-md">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Mapeo de campos
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Fecha de transacción (SAP)
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Fecha (Cosmo)
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Texto de posición (SAP)
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Descripción (Cosmo)
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Importe en moneda local (SAP)
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Importe (Cosmo)
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Cuenta de mayor (SAP)
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Categoría (Cosmo)
                            </div>
                          </div>
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
                        Probar conexión
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Verifica que la conexión funciona correctamente antes de
                        finalizar.
                      </p>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
                        >
                          Probar conexión
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </ol>
            </nav>
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
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
          >
            Guardar y conectar
          </button>
        </div>
      </div>
    </main>
  );
}

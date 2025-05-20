import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import Link from "next/link";
import { getSyncStatus } from "../../../lib/quickbooks/services/sync";
import { configService } from "../../../lib/quickbooks/services/config";
import SyncButton from "../../../components/quickbooks/SyncButton";
import SyncConfigForm from "../../../components/quickbooks/SyncConfigForm";
import SyncStatusInfo from "../../../components/quickbooks/SyncStatusInfo";

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

  // Obtener el estado actual de la sincronización y la configuración guardada
  const syncStatus = await getSyncStatus(companyId);
  const savedConfig = companyId
    ? await configService.getConfig(companyId)
    : null;

  // Determinar si la conexión está activa
  const isConnected = !!companyId || syncStatus.companyId !== null;

  // Obtener los valores actuales de la configuración para mostrarlos en el formulario
  const currentConfig = savedConfig?.preferences || {
    dataTypes: ["expenses"],
    syncFrequency: "daily",
    importPeriod: "1month",
  };

  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Navegación */}
        <div className="mb-6">
          <Link
            href="/integrations"
            className="flex items-center text-sm text-gray-400 hover:text-eco-green"
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
            Back to Integrations
          </Link>
        </div>

        {/* Mensajes de estado */}
        {status === "success" && (
          <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-6">
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
                <h3 className="text-sm font-medium text-green-300">
                  Successful Connection
                </h3>
                <div className="mt-2 text-sm text-green-200">
                  <p>
                    Your QuickBooks account has been successfully connected. You
                    can now start importing your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6">
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
                <h3 className="text-sm font-medium text-red-300">
                  Connection Error
                </h3>
                <div className="mt-2 text-sm text-red-200">
                  <p>
                    {errorMessage ||
                      "An error occurred while connecting to QuickBooks. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Encabezado */}
        <div className="bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8 border border-cosmo-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-cosmo-700 rounded-lg p-2 flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-300">QB</div>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-white">
                  QuickBooks Integration
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Connect with QuickBooks to automatically import expenses and
                  invoices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de OAuth */}
        {!isConnected && (
          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 mb-8">
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
                <h3 className="text-sm font-medium text-white">
                  About QuickBooks Integration
                </h3>
                <div className="mt-2 text-sm text-white">
                  <p className="text-white">
                    This integration uses OAuth 2.0 to securely connect with
                    your QuickBooks Online account. You'll need to authorize our
                    application to access your financial data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Componente para mostrar el estado de sincronización */}
        {isConnected && (
          <SyncStatusInfo
            syncStatus={syncStatus}
            savedConfig={savedConfig}
            companyId={companyId || syncStatus.companyId || ""}
          />
        )}

        {/* Pasos de configuración */}
        <div className="bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8 border border-cosmo-700">
          <div className="px-4 py-5 sm:px-6 border-b border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-white">
              Steps to Configure
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              Follow these steps to connect QuickBooks with our platform.
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
                      <h4 className="text-lg font-medium text-white">
                        Prerequisites
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Make sure you have:
                      </p>
                      <ul className="mt-2 text-sm text-gray-400 list-disc pl-5 space-y-1">
                        <li>An active QuickBooks Online account</li>
                        <li>
                          Administrator permissions in your QuickBooks account
                        </li>
                        <li>Updated browser with cookies enabled</li>
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
                      <h4 className="text-lg font-medium text-white">
                        Connect with QuickBooks
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Authorize our application to access your QuickBooks
                        data.
                      </p>
                      {!isConnected && (
                        <div className="mt-4">
                          <a
                            href="/api/integrations/quickbooks/auth"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
                          >
                            Connect with QuickBooks
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </li>

                <li className="relative pb-10">
                  <div
                    className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${
                      savedConfig
                        ? "bg-eco-green"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span
                        className={`relative z-10 w-8 h-8 flex items-center justify-center ${
                          savedConfig
                            ? "bg-eco-green"
                            : "bg-white dark:bg-cosmo-700 border-2 border-gray-300 dark:border-gray-600"
                        } rounded-full`}
                      >
                        {savedConfig ? (
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
                      <h4 className="text-lg font-medium text-white">
                        Configure Preferences
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Select the types of data you want to import and the sync
                        frequency.
                      </p>
                      {isConnected && (
                        <div className="mt-4">
                          <SyncConfigForm
                            companyId={companyId || syncStatus.companyId || ""}
                            currentConfig={currentConfig}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </li>

                <li className="relative">
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span
                        className={`relative z-10 w-8 h-8 flex items-center justify-center ${
                          syncStatus.lastSyncTime
                            ? "bg-eco-green"
                            : "bg-white dark:bg-cosmo-700 border-2 border-gray-300 dark:border-gray-600"
                        } rounded-full`}
                      >
                        {syncStatus.lastSyncTime ? (
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
                      <h4 className="text-lg font-medium text-white">
                        Complete Setup
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Once connection is authorized and preferences are
                        configured, you can start importing data.
                      </p>
                      <div className="mt-4 bg-cosmo-700 p-4 rounded-md">
                        <h5 className="text-sm font-medium text-gray-300 mb-2">
                          What happens next:
                        </h5>
                        <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                          <li>
                            We'll import your data according to the selected
                            configuration
                          </li>
                          <li>
                            We'll automatically classify expenses according to
                            our knowledge base
                          </li>
                          <li>
                            We'll calculate sustainability metrics for each
                            transaction
                          </li>
                          <li>
                            You can review and adjust the classification in the
                            expenses section
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
        <div className="bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8 border border-cosmo-700">
          <div className="px-4 py-5 sm:px-6 border-b border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-white">
              Connection Status
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
                  <span className="ml-3 text-sm font-medium text-white">
                    Connected to QuickBooks
                    {companyId && ` (Company ID: ${companyId})`}
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="h-8 w-8 text-gray-500"
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
                  <span className="ml-3 text-sm font-medium text-white">
                    Not Connected
                  </span>
                </>
              )}
            </div>

            {syncStatus.lastSyncTime && (
              <div className="mt-4 text-sm text-gray-400">
                Last sync: {new Date(syncStatus.lastSyncTime).toLocaleString()}
              </div>
            )}

            {savedConfig?.nextSyncTime && (
              <div className="mt-2 text-sm text-gray-400">
                Next sync: {new Date(savedConfig.nextSyncTime).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/integrations"
            className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-cosmo-800 hover:bg-cosmo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
          >
            Cancel
          </Link>

          {/* Usar el componente cliente para el botón de sincronización */}
          <SyncButton
            companyId={companyId || syncStatus.companyId || undefined}
            isConnected={isConnected}
            isRunning={syncStatus.isRunning}
            syncStatus={syncStatus}
          />
        </div>
      </div>
    </main>
  );
}

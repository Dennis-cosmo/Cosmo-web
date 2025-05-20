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

        {/* Encabezado */}
        <div className="bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8 border border-cosmo-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-cosmo-700 rounded-lg p-2 flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-300">SA</div>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-white">
                  SAP Integration
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Connect with your SAP system to automatically import expense
                  data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pasos de configuración */}
        <div className="bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8 border border-cosmo-700">
          <div className="px-4 py-5 sm:px-6 border-b border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-white">
              Configuration Steps
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              Follow these steps to connect your SAP system with our platform.
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
                        Before starting, make sure you have:
                      </p>
                      <ul className="mt-2 text-sm text-gray-400 list-disc pl-5 space-y-1">
                        <li>Administrator access to your SAP system</li>
                        <li>Permissions to create API connections</li>
                        <li>SAP FI (Finance) module configured</li>
                      </ul>
                    </div>
                  </div>
                </li>

                <li className="relative pb-10">
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-600"
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-cosmo-700 border-2 border-gray-600 rounded-full">
                        <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                      </span>
                    </span>
                    <div className="ml-4 min-w-0">
                      <h4 className="text-lg font-medium text-white">
                        SAP Configuration
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Configure SAP API access:
                      </p>
                      <ul className="mt-2 text-sm text-gray-400 list-disc pl-5 space-y-1">
                        <li>Create a service user for the integration</li>
                        <li>Enable OData or REST API in your SAP system</li>
                        <li>
                          Configure the appropriate permissions to access
                          financial data
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>

                <li className="relative pb-10">
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-600"
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-cosmo-700 border-2 border-gray-600 rounded-full">
                        <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                      </span>
                    </span>
                    <div className="ml-4 min-w-0">
                      <h4 className="text-lg font-medium text-white">
                        Connect with our Platform
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Enter your credentials and connection details:
                      </p>
                      <form className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="sap_url"
                              className="block text-sm font-medium text-gray-300"
                            >
                              SAP Server URL
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="sap_url"
                                id="sap_url"
                                placeholder="https://sap-api.yourcompany.com"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-cosmo-600 rounded-md bg-cosmo-700 text-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="api_key"
                              className="block text-sm font-medium text-gray-300"
                            >
                              API Key
                            </label>
                            <div className="mt-1">
                              <input
                                type="password"
                                name="api_key"
                                id="api_key"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-cosmo-600 rounded-md bg-cosmo-700 text-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="username"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Service User
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="username"
                                id="username"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-cosmo-600 rounded-md bg-cosmo-700 text-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="password"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Password
                            </label>
                            <div className="mt-1">
                              <input
                                type="password"
                                name="password"
                                id="password"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-cosmo-600 rounded-md bg-cosmo-700 text-white"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label
                              htmlFor="client_id"
                              className="block text-sm font-medium text-gray-300"
                            >
                              SAP Client ID
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="client_id"
                                id="client_id"
                                placeholder="100"
                                className="shadow-sm focus:ring-eco-green focus:border-eco-green block w-full sm:text-sm border-cosmo-600 rounded-md bg-cosmo-700 text-white"
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
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-600"
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex items-start group">
                    <span className="h-9 flex items-center">
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-cosmo-700 border-2 border-gray-600 rounded-full">
                        <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                      </span>
                    </span>
                    <div className="ml-4 min-w-0">
                      <h4 className="text-lg font-medium text-white">
                        Configure Data Mapping
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Configure how SAP fields map to our platform:
                      </p>
                      <div className="mt-4 bg-cosmo-700 p-4 rounded-md">
                        <div className="text-sm font-medium text-gray-300 mb-3">
                          Field Mapping
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-gray-400">
                              Transaction Date (SAP)
                            </div>
                            <div className="text-sm font-medium text-white">
                              Date (Cosmo)
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-gray-400">
                              Line Item Text (SAP)
                            </div>
                            <div className="text-sm font-medium text-white">
                              Description (Cosmo)
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-gray-400">
                              Amount in Local Currency (SAP)
                            </div>
                            <div className="text-sm font-medium text-white">
                              Amount (Cosmo)
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm text-gray-400">
                              G/L Account (SAP)
                            </div>
                            <div className="text-sm font-medium text-white">
                              Category (Cosmo)
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
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-cosmo-700 border-2 border-gray-600 rounded-full">
                        <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                      </span>
                    </span>
                    <div className="ml-4 min-w-0">
                      <h4 className="text-lg font-medium text-white">
                        Test Connection
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Verify that the connection works correctly before
                        finalizing.
                      </p>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
                        >
                          Test Connection
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
            className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-cosmo-800 hover:bg-cosmo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
          >
            Cancel
          </Link>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
          >
            Save and Connect
          </button>
        </div>
      </div>
    </main>
  );
}

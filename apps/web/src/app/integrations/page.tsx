import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import Link from "next/link";
import Image from "next/image";

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Datos de integraciones disponibles
  const availableIntegrations = [
    {
      id: "sap",
      name: "SAP",
      description:
        "Connect with your SAP system to automatically import expense data.",
      icon: "/images/integrations/sap-logo.svg",
      status: "pending",
      category: "ERP",
      setupTime: "30-45 min",
      popular: true,
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      description:
        "Import expenses and invoices from QuickBooks for sustainability analysis.",
      icon: "/images/integrations/quickbooks-logo.svg",
      status: "pending",
      category: "Accounting",
      setupTime: "15-20 min",
      popular: true,
    },
  ];

  // Integraciones que se añadirán próximamente
  const comingSoonIntegrations = [
    {
      id: "xero",
      name: "Xero",
      description: "Import financial data from Xero.",
      icon: "/images/integrations/xero-logo.svg",
      status: "coming soon",
      category: "Accounting",
      setupTime: "10-15 min",
    },
    {
      id: "oracle",
      name: "Oracle NetSuite",
      description:
        "Connect with Oracle NetSuite to import financial and purchasing data.",
      icon: "/images/integrations/netsuite-logo.svg",
      status: "coming soon",
      category: "ERP",
      setupTime: "30-40 min",
    },
    {
      id: "microsoft",
      name: "Microsoft Dynamics",
      description:
        "Import data from Microsoft Dynamics 365 Business Central or Finance.",
      icon: "/images/integrations/dynamics-logo.svg",
      status: "coming soon",
      category: "ERP",
      setupTime: "25-35 min",
    },
  ];

  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado de la página */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="mt-1 text-sm text-gray-400">
            Connect your business systems to automatically import data.
          </p>
        </div>

        {/* Resumen de integraciones */}
        <div className="bg-cosmo-800 shadow overflow-hidden sm:rounded-lg mb-8 border border-cosmo-700">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-white mb-4">
              Integration Status
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-800 rounded-md p-2">
                    <svg
                      className="h-6 w-6 text-green-300"
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
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-white">
                      Active Integrations
                    </h3>
                    <p className="text-3xl font-bold text-white mt-1">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-800 rounded-md p-2">
                    <svg
                      className="h-6 w-6 text-blue-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-white">
                      Available
                    </h3>
                    <p className="text-3xl font-bold text-white mt-1">
                      {availableIntegrations.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-900/30 border border-purple-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-800 rounded-md p-2">
                    <svg
                      className="h-6 w-6 text-purple-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-white">
                      Coming Soon
                    </h3>
                    <p className="text-3xl font-bold text-white mt-1">
                      {comingSoonIntegrations.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integraciones disponibles */}
        <div className="bg-cosmo-800 shadow sm:rounded-lg mb-8 border border-cosmo-700">
          <div className="px-4 py-5 sm:px-6 border-b border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-white">
              Available Integrations
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              Connect these services to start importing data automatically.
            </p>
          </div>
          <div className="divide-y divide-cosmo-700">
            {availableIntegrations.map((integration) => (
              <div key={integration.id} className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 bg-cosmo-700 rounded-lg p-2 flex items-center justify-center">
                      <div className="text-2xl font-bold text-gray-300">
                        {integration.name.substring(0, 2)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-white flex items-center">
                        {integration.name}
                        {integration.popular && (
                          <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-eco-green bg-opacity-10 text-eco-green rounded-full">
                            Popular
                          </span>
                        )}
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        {integration.description}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-400">
                        <span className="flex items-center mr-4">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4"
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
                          {integration.category}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Setup: {integration.setupTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/integrations/${integration.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-eco-green hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
                    >
                      Configure
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximamente */}
        <div className="bg-cosmo-800 shadow sm:rounded-lg border border-cosmo-700">
          <div className="px-4 py-5 sm:px-6 border-b border-cosmo-700">
            <h3 className="text-lg leading-6 font-medium text-white">
              Coming Soon
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              These integrations will be available in future updates.
            </p>
          </div>
          <div className="divide-y divide-cosmo-700">
            {comingSoonIntegrations.map((integration) => (
              <div key={integration.id} className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 bg-cosmo-700 rounded-lg p-2 flex items-center justify-center">
                      <div className="text-2xl font-bold text-gray-300">
                        {integration.name.substring(0, 2)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-white flex items-center">
                        {integration.name}
                        <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-purple-900 text-purple-200 rounded-full">
                          Coming Soon
                        </span>
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        {integration.description}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-400">
                        <span className="flex items-center mr-4">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4"
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
                          {integration.category}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="flex-shrink-0 mr-1.5 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Setup: {integration.setupTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-400 bg-gray-700 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

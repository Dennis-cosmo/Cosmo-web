import Link from "next/link";

export default function XeroIntegrationPage() {
  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-deep-space min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/integrations"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a Integraciones
          </Link>
          <div className="flex items-center">
            <span className="text-4xl mr-4 grayscale">📊</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Xero Integration
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Integración con Xero para pequeñas y medianas empresas
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Status */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Próximamente Disponible
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                <p>
                  Esta integración estará disponible en las próximas semanas.
                  ¡Suscríbete para recibir actualizaciones!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="bg-white dark:bg-cosmo-800 shadow rounded-lg mb-8 opacity-75">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Funcionalidades planificadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Datos a importar:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Facturas y gastos</li>
                  <li>• Información de contactos</li>
                  <li>• Categorías de transacciones</li>
                  <li>• Informes financieros</li>
                  <li>• Presupuestos y proyecciones</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Beneficios ESG:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Clasificación automática verde/no verde</li>
                  <li>• Reportes de sostenibilidad</li>
                  <li>• Análisis de impacto ambiental</li>
                  <li>• Métricas de transparencia fiscal</li>
                  <li>• Dashboard de cumplimiento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Signup */}
        <div className="bg-white dark:bg-cosmo-800 shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recibe notificaciones cuando esté lista
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="tu-email@empresa.com"
                className="flex-1 min-w-0 rounded-md border-gray-300 dark:border-cosmo-600 shadow-sm focus:border-eco-green focus:ring-eco-green dark:bg-cosmo-700 dark:text-white"
              />
              <button
                type="button"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-eco-green hover:bg-eco-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-5 5v-5zM4.828 10.828l9.899-9.899M9.899 2.828l9.899 9.899-9.899 9.899-9.899-9.899L9.899 2.828z"
                  />
                </svg>
                Notificarme
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link
            href="/integrations"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-cosmo-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-cosmo-800 hover:bg-gray-50 dark:hover:bg-cosmo-700"
          >
            Volver
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex items-center px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Próximamente
          </button>
        </div>
      </div>
    </main>
  );
}

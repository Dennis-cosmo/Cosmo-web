import Link from "next/link";

export default function ExcelIntegrationPage() {
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
            <span className="text-4xl mr-4">📝</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Excel/CSV Import
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Importa datos desde archivos Excel o CSV para análisis de
                sostenibilidad
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
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
                Importación Manual
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-200">
                <p>
                  Esta opción te permite subir archivos directamente para
                  análisis inmediato.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-cosmo-800 shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Subir archivo
            </h3>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-cosmo-600 border-dashed rounded-md hover:border-eco-green transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-300">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-cosmo-800 rounded-md font-medium text-eco-green hover:text-eco-green/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-eco-green"
                  >
                    <span>Subir un archivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".xlsx,.xls,.csv"
                    />
                  </label>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Excel (.xlsx, .xls) o CSV hasta 10MB
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-eco-green hover:bg-eco-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Procesar Archivo
              </button>
            </div>
          </div>
        </div>

        {/* Format Requirements */}
        <div className="bg-white dark:bg-cosmo-800 shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Formato requerido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Columnas obligatorias:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>
                    • <strong>Date</strong> - Fecha de la transacción
                  </li>
                  <li>
                    • <strong>Description</strong> - Descripción del gasto
                  </li>
                  <li>
                    • <strong>Amount</strong> - Monto (numérico)
                  </li>
                  <li>
                    • <strong>Currency</strong> - Moneda (EUR, USD, etc.)
                  </li>
                  <li>
                    • <strong>Category</strong> - Categoría del gasto
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Columnas opcionales:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>
                    • <strong>Vendor</strong> - Proveedor
                  </li>
                  <li>
                    • <strong>Location</strong> - Ubicación
                  </li>
                  <li>
                    • <strong>Project</strong> - Proyecto
                  </li>
                  <li>
                    • <strong>Tax</strong> - Impuestos
                  </li>
                  <li>
                    • <strong>Notes</strong> - Notas adicionales
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/templates/expenses-template.xlsx"
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-cosmo-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-cosmo-700 hover:bg-gray-50 dark:hover:bg-cosmo-600"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Descargar plantilla
              </Link>
            </div>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="bg-white dark:bg-cosmo-800 shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Proceso de análisis
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-6 h-6 bg-eco-green rounded-full">
                    <span className="text-xs font-medium text-cosmo-500">
                      1
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Validación de datos
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Verificamos que el archivo tenga el formato correcto y las
                    columnas necesarias
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-6 h-6 bg-eco-green rounded-full">
                    <span className="text-xs font-medium text-cosmo-500">
                      2
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Clasificación automática
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Nuestro AI clasifica cada gasto como verde o no verde según
                    la taxonomía EU
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-6 h-6 bg-eco-green rounded-full">
                    <span className="text-xs font-medium text-cosmo-500">
                      3
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Generación de reportes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Creamos automáticamente los reportes ESG y dashboard de
                    sostenibilidad
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link
            href="/integrations"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-cosmo-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-cosmo-800 hover:bg-gray-50 dark:hover:bg-cosmo-700"
          >
            Cancelar
          </Link>
          <Link
            href="/expenses"
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Ver Datos Importados
          </Link>
        </div>
      </div>
    </main>
  );
}

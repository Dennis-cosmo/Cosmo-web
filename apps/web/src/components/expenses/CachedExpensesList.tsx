"use client";

import { useState, useEffect } from "react";
import { QuickBooksExpense } from "../../lib/quickbooks/types";

interface CachedExpensesListProps {
  initialExpenses: QuickBooksExpense[];
  isRealData: boolean;
}

export default function CachedExpensesList({
  initialExpenses,
  isRealData,
}: CachedExpensesListProps) {
  const [expenses, setExpenses] =
    useState<QuickBooksExpense[]>(initialExpenses);
  const [filteredExpenses, setFilteredExpenses] =
    useState<QuickBooksExpense[]>(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  // Extraer categorías y proveedores únicos
  const categories = Array.from(
    new Set(
      expenses
        .map((expense) => expense.category)
        .filter((category): category is string => Boolean(category))
    )
  );

  const vendors = Array.from(
    new Set(
      expenses
        .map((expense) => expense.vendor)
        .filter((vendor): vendor is string => Boolean(vendor))
    )
  );

  // Aplicar filtros cuando cambien
  useEffect(() => {
    let result = [...expenses];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(
        (expense) =>
          expense.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (categoryFilter !== "all") {
      result = result.filter((expense) => expense.category === categoryFilter);
    }

    // Filtrar por proveedor
    if (vendorFilter !== "all") {
      result = result.filter((expense) => expense.vendor === vendorFilter);
    }

    setFilteredExpenses(result);
  }, [expenses, searchTerm, categoryFilter, vendorFilter]);

  return (
    <div>
      {/* Aviso de fuente de datos */}
      {isRealData ? (
        <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-8">
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
                Datos sincronizados en memoria
              </h3>
              <div className="mt-2 text-sm text-green-200">
                <p>
                  Mostrando datos cacheados desde QuickBooks. Estos datos se
                  mantienen en memoria mientras navegas por la aplicación, sin
                  almacenarse en la base de datos.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
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
              <h3 className="text-sm font-medium text-yellow-300">
                Datos de ejemplo
              </h3>
              <div className="mt-2 text-sm text-yellow-200">
                <p>
                  No se encontraron gastos en la memoria caché. Mostrando datos
                  de ejemplo para visualización.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-8 bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-300"
              >
                Buscar
              </label>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-eco-green focus:border-eco-green bg-gray-700 text-white"
                placeholder="Buscar por descripción, proveedor..."
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-300"
              >
                Categoría
              </label>
              <select
                id="category"
                name="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-eco-green focus:border-eco-green bg-gray-700 text-white"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="vendor"
                className="block text-sm font-medium text-gray-300"
              >
                Proveedor
              </label>
              <select
                id="vendor"
                name="vendor"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-eco-green focus:border-eco-green bg-gray-700 text-white"
              >
                <option value="all">Todos los proveedores</option>
                {vendors.map((vendor, index) => (
                  <option key={index} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de gastos */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-700 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Fecha
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Descripción
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Importe
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Categoría
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Proveedor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center"
                      >
                        No se encontraron gastos con los filtros aplicados
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {expense.currency} {expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {expense.category || "Sin categoría"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {expense.vendor || "No especificado"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

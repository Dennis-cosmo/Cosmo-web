"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useTaxonomySectors,
  useAllTaxonomyActivities,
  useSearchTaxonomyActivities,
  TaxonomySector,
  TaxonomyActivity,
} from "../../hooks/useTaxonomy";

interface EUTaxonomyActivityProps {
  activity: TaxonomyActivity;
  selected: boolean;
  onSelect: (activity: TaxonomyActivity, selected: boolean) => void;
  disabled?: boolean;
}

// Componente para mostrar un sector con checkbox
const SectorCheckbox = ({
  sector,
  checked,
  onChange,
  disabled,
}: {
  sector: TaxonomySector;
  checked: boolean;
  onChange: (sectorId: number, checked: boolean, sectorName: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex items-center px-3 sm:px-4 py-2 hover:bg-gray-50 rounded-md transition-colors">
      <input
        type="checkbox"
        id={`sector-${sector.id}`}
        checked={checked}
        onChange={(e) => onChange(sector.id, e.target.checked, sector.name)}
        className="h-4 w-4 text-eco-green focus:ring-eco-green rounded"
        disabled={disabled}
      />
      <label
        htmlFor={`sector-${sector.id}`}
        className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer flex-1 truncate"
      >
        {sector.name}
      </label>
    </div>
  );
};

// Componente para mostrar una actividad económica con checkbox
const EUTaxonomyActivityItem = ({
  activity,
  selected,
  onSelect,
  disabled,
}: EUTaxonomyActivityProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(activity, e.target.checked);
  };

  // Formatear códigos NACE para mostrarlos
  const naceCodesText =
    activity.naceCodes && activity.naceCodes.length > 0
      ? `Códigos NACE: ${activity.naceCodes.join(", ")}`
      : "Sin códigos NACE";

  return (
    <div className="flex items-center px-3 sm:px-4 py-2 hover:bg-gray-50 rounded-md transition-colors">
      <input
        type="checkbox"
        className="h-4 w-4 text-eco-green border-gray-300 rounded focus:ring-eco-green"
        checked={selected}
        onChange={handleChange}
        id={`activity-${activity.id}`}
        disabled={disabled}
      />
      <label
        htmlFor={`activity-${activity.id}`}
        className={`ml-3 block text-sm ${
          disabled && !selected ? "text-gray-400" : "text-gray-700"
        } ${selected ? "font-medium" : ""}`}
      >
        <div className="flex flex-col">
          <span className="block">{activity.name}</span>
          <span className="text-xs text-gray-500 mt-1">{naceCodesText}</span>
          {activity.sectorName && (
            <span className="text-xs text-gray-500">
              Sector: {activity.sectorName}
            </span>
          )}
        </div>
      </label>
    </div>
  );
};

interface EUTaxonomySelectorProps {
  selectedSectorIds?: number[];
  selectedActivities: TaxonomyActivity[];
  onSectorsChange: (sectorIds: number[], sectorNames: string[]) => void;
  onActivitiesChange: (activities: TaxonomyActivity[]) => void;
  maxActivities?: number;
  disabled?: boolean;
}

export default function EUTaxonomySelector({
  selectedSectorIds = [],
  selectedActivities = [],
  onSectorsChange,
  onActivitiesChange,
  maxActivities = 3,
  disabled = false,
}: EUTaxonomySelectorProps) {
  const { sectors, loading: loadingSectors } = useTaxonomySectors();
  const {
    allActivities,
    getActivitiesBySectors,
    loading: loadingActivities,
  } = useAllTaxonomyActivities();
  const {
    searchActivities,
    searchResults,
    loading: loadingSearch,
  } = useSearchTaxonomyActivities();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Obtener nombres de sectores seleccionados
  const selectedSectorNames = useMemo(() => {
    if (!sectors.length || !selectedSectorIds.length) return [];

    return selectedSectorIds
      .map((id) => {
        const sector = sectors.find((s) => s.id === id);
        return sector ? sector.name : "";
      })
      .filter((name) => name !== "");
  }, [sectors, selectedSectorIds]);

  // Obtener actividades filtradas por los sectores seleccionados
  const filteredActivitiesBySector = useMemo(() => {
    const activities = getActivitiesBySectors(selectedSectorIds);

    // Añadir nombre del sector a cada actividad si no lo tiene
    return activities.map((activity) => {
      if (activity.sectorName) return activity;

      const sector = sectors.find((s) => s.id === activity.sectorId);
      return {
        ...activity,
        sectorName: sector ? sector.name : `Sector ${activity.sectorId}`,
      };
    });
  }, [getActivitiesBySectors, selectedSectorIds, sectors]);

  // Realizar búsqueda cuando el query tiene al menos 3 caracteres
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      searchActivities(searchQuery);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, searchActivities]);

  // Filtrar actividades basado en la búsqueda en los sectores seleccionados
  const filteredActivities = useMemo(() => {
    if (searchQuery.trim().length > 0 && !showSearchResults) {
      return filteredActivitiesBySector.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.naceCodes &&
            a.naceCodes.some((code) =>
              code.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }
    return filteredActivitiesBySector;
  }, [filteredActivitiesBySector, searchQuery, showSearchResults]);

  // Manejar cambio en la selección de sector
  const handleSectorChange = (
    sectorId: number,
    isChecked: boolean,
    sectorName: string
  ) => {
    let newSelectedIds: number[];
    let newSelectedNames: string[];

    if (isChecked) {
      // Añadir sector
      newSelectedIds = [...selectedSectorIds, sectorId];
      newSelectedNames = [...selectedSectorNames, sectorName];
    } else {
      // Quitar sector
      newSelectedIds = selectedSectorIds.filter((id) => id !== sectorId);
      newSelectedNames = selectedSectorNames.filter(
        (name) => name !== sectorName
      );

      // Opcional: quitar actividades de este sector
      const sectorActivities = selectedActivities.filter(
        (a) => a.sectorId === sectorId
      );
      if (sectorActivities.length > 0) {
        const remainingActivities = selectedActivities.filter(
          (a) => a.sectorId !== sectorId
        );
        onActivitiesChange(remainingActivities);
      }
    }

    // Notificar al componente padre sobre el cambio
    onSectorsChange(newSelectedIds, newSelectedNames);

    // Resetear búsqueda
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Manejar selección de actividades
  const handleActivitySelect = (
    activity: TaxonomyActivity,
    isSelected: boolean
  ) => {
    if (isSelected) {
      // Verificar si ya tenemos el máximo de actividades
      if (selectedActivities.length >= maxActivities) {
        // Mostrar mensaje más visible y descriptivo
        alert(
          `Ya has seleccionado el número máximo de ${maxActivities} actividades. Por favor, deselecciona una actividad existente antes de seleccionar una nueva.`
        );
        return;
      }

      // Añadir actividad
      onActivitiesChange([...selectedActivities, activity]);
    } else {
      // Quitar actividad
      onActivitiesChange(
        selectedActivities.filter((a) => a.id !== activity.id)
      );
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const resetSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <div className="w-full">
      {/* Título principal */}
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
        Actividades Económicas según Taxonomía UE
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Columna de sectores */}
        <div className="md:col-span-1">
          <div className="sticky top-4">
            <div className="mb-2 sm:mb-3 flex justify-between items-center">
              <h4 className="font-medium text-sm text-gray-700">
                Sectores económicos
              </h4>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {selectedSectorIds.length} seleccionados
              </span>
            </div>

            {loadingSectors ? (
              <div className="h-[180px] sm:h-[250px] md:h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 flex flex-col items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-eco-green mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-xs sm:text-sm">
                    Cargando sectores...
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-[180px] sm:h-[250px] md:h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
                {sectors.map((sector) => (
                  <SectorCheckbox
                    key={sector.id}
                    sector={sector}
                    checked={selectedSectorIds.includes(sector.id)}
                    onChange={handleSectorChange}
                    disabled={disabled}
                  />
                ))}
              </div>
            )}

            <p className="text-xs mt-2 text-gray-500">
              Selecciona los sectores económicos que aplican a tu empresa según
              la Taxonomía de Finanzas Sostenibles de la UE.
            </p>
          </div>
        </div>

        {/* Columna de actividades */}
        <div className="md:col-span-2">
          {selectedSectorIds.length > 0 ? (
            <>
              <div className="mb-2 sm:mb-3 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-gray-700">
                    Actividades económicas
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona hasta 3 actividades de los sectores elegidos
                  </p>
                  {selectedSectorNames.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sectores: {selectedSectorNames.join(", ")}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${selectedActivities.length >= maxActivities ? "bg-amber-100 text-amber-700" : "bg-eco-green/10 text-eco-green"}`}
                >
                  {selectedActivities.length}/{maxActivities} seleccionadas
                </span>
              </div>

              <div className="relative mb-3 sm:mb-4">
                <input
                  type="text"
                  placeholder="Buscar actividades económicas..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-11 rounded-lg border border-gray-300 focus:border-eco-green focus:ring focus:ring-eco-green/20 focus:ring-opacity-50 text-sm text-gray-900"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  disabled={disabled || loadingActivities}
                />
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={resetSearch}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
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
                  </button>
                )}
              </div>

              <div className="h-[200px] sm:h-[250px] md:h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                {loadingActivities ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-gray-500 flex flex-col items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-eco-green mb-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-xs sm:text-sm">
                        Cargando actividades...
                      </span>
                    </div>
                  </div>
                ) : showSearchResults ? (
                  // Mostrar resultados de búsqueda global
                  loadingSearch ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-gray-500 flex flex-col items-center">
                        <svg
                          className="animate-spin h-5 w-5 text-eco-green mb-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-xs sm:text-sm">
                          Buscando actividades...
                        </span>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <div className="mb-2 sm:mb-3 pb-2 border-b text-xs sm:text-sm text-gray-500">
                        {searchResults.length} resultados encontrados
                      </div>
                      {searchResults.map((activity) => (
                        <EUTaxonomyActivityItem
                          key={activity.id}
                          activity={activity}
                          selected={selectedActivities.some(
                            (a) => a.id === activity.id
                          )}
                          onSelect={handleActivitySelect}
                          disabled={
                            disabled ||
                            (selectedActivities.length >= maxActivities &&
                              !selectedActivities.some(
                                (a) => a.id === activity.id
                              ))
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <svg
                          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <p className="mt-2 text-xs sm:text-sm">
                          No se encontraron actividades con esta búsqueda.
                        </p>
                      </div>
                    </div>
                  )
                ) : filteredActivities.length > 0 ? (
                  // Mostrar actividades de los sectores seleccionados
                  <>
                    {searchQuery.trim().length > 0 && (
                      <div className="mb-2 sm:mb-3 pb-2 border-b text-xs sm:text-sm text-gray-500">
                        {filteredActivities.length} resultados en sectores
                        seleccionados
                      </div>
                    )}
                    {filteredActivities.map((activity) => {
                      const isSelected = selectedActivities.some(
                        (a) => a.id === activity.id
                      );
                      const maxReached =
                        selectedActivities.length >= maxActivities;

                      return (
                        <EUTaxonomyActivityItem
                          key={activity.id}
                          activity={activity}
                          selected={isSelected}
                          onSelect={handleActivitySelect}
                          disabled={disabled || (maxReached && !isSelected)}
                        />
                      );
                    })}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-gray-500 text-center">
                      <svg
                        className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <p className="mt-2 text-xs sm:text-sm">
                        {searchQuery.trim().length > 0
                          ? "No se encontraron actividades con esta búsqueda."
                          : selectedSectorIds.length > 0
                            ? "No hay actividades disponibles para los sectores seleccionados."
                            : "Selecciona al menos un sector para ver actividades."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs mt-2 text-gray-500">
                Selecciona hasta {maxActivities} actividades económicas que
                mejor representan a tu empresa.
              </p>
            </>
          ) : (
            <div className="h-[200px] sm:h-[250px] md:h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-8">
              <div className="text-center max-w-sm">
                <svg
                  className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <h3 className="mt-3 text-sm font-medium text-gray-900">
                  No hay sectores seleccionados
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  Selecciona uno o más sectores económicos para ver las
                  actividades disponibles.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Categorías de taxonomía de sostenibilidad de la UE
export const EU_TAXONOMY_CATEGORIES = {
  CLIMATE_CHANGE_MITIGATION: 'climate_change_mitigation',
  CLIMATE_CHANGE_ADAPTATION: 'climate_change_adaptation',
  WATER_RESOURCES: 'water_resources',
  CIRCULAR_ECONOMY: 'circular_economy',
  POLLUTION_PREVENTION: 'pollution_prevention',
  BIODIVERSITY: 'biodiversity',
};

// Subcategorías de la taxonomía climática
export const CLIMATE_SUBCATEGORIES = [
  'renewable_energy',
  'energy_efficiency',
  'clean_transportation',
  'green_buildings',
  'sustainable_agriculture',
  'waste_management',
  'carbon_capture',
  'climate_resilience',
];

// Umbrales para puntuaciones de sostenibilidad
export const SUSTAINABILITY_SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  AVERAGE: 40,
  POOR: 20,
};

// Factores de emisión para cálculos de huella de carbono (kg CO2e por euro)
export const CARBON_EMISSION_FACTORS = {
  TRANSPORTATION: 0.12,
  ELECTRICITY: 0.08,
  HEATING: 0.09,
  FOOD: 0.05,
  IT_EQUIPMENT: 0.04,
  OFFICE_SUPPLIES: 0.03,
  CONSULTANCY: 0.01,
  DEFAULT: 0.06,
}; 
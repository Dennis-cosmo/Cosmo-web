import { CARBON_EMISSION_FACTORS } from '../constants/sustainable.constants';

/**
 * Calcula el porcentaje de gastos verdes
 */
export const calculateGreenPercentage = (
  greenExpenses: number,
  totalExpenses: number
): number => {
  if (totalExpenses === 0) return 0;
  return (greenExpenses / totalExpenses) * 100;
};

/**
 * Calcula la puntuación de sostenibilidad basada en el porcentaje de gastos verdes
 * y otros factores
 */
export const calculateSustainabilityScore = (
  greenPercentage: number,
  carbonFootprint: number,
  baselineFootprint: number
): number => {
  // 70% del score basado en porcentaje de gastos verdes
  const greenScore = greenPercentage * 0.7;
  
  // 30% basado en reducción de huella de carbono respecto a la línea base
  let carbonScore = 0;
  if (baselineFootprint > 0) {
    const reduction = Math.max(0, (baselineFootprint - carbonFootprint) / baselineFootprint);
    carbonScore = reduction * 30;
  }
  
  return Math.min(100, greenScore + carbonScore);
};

/**
 * Estima la huella de carbono basada en los gastos y su categoría
 */
export const estimateCarbonFootprint = (
  expenses: Array<{amount: number; category?: string}>
): number => {
  return expenses.reduce((total, expense) => {
    const category = expense.category?.toUpperCase() as keyof typeof CARBON_EMISSION_FACTORS || 'DEFAULT';
    const emissionFactor = CARBON_EMISSION_FACTORS[category] || CARBON_EMISSION_FACTORS.DEFAULT;
    
    return total + (expense.amount * emissionFactor);
  }, 0);
};

/**
 * Agrupa gastos por categoría
 */
export const groupExpensesByCategory = (
  expenses: Array<{amount: number; category?: string}>
): Record<string, number> => {
  return expenses.reduce<Record<string, number>>((grouped, expense) => {
    const category = expense.category || 'Uncategorized';
    
    if (!grouped[category]) {
      grouped[category] = 0;
    }
    
    grouped[category] += expense.amount;
    return grouped;
  }, {});
}; 
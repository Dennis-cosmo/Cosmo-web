/**
 * Formatea una fecha en formato ISO
 */
export const formatISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formatea una fecha en formato local
 */
export const formatLocalDate = (date: Date): string => {
  return date.toLocaleDateString();
};

/**
 * Calcula el número de días entre dos fechas
 */
export const daysBetween = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Resetear las horas para comparar solo fechas
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Obtiene el primer día del mes actual
 */
export const getFirstDayOfMonth = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtiene el último día del mes actual
 */
export const getLastDayOfMonth = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Verifica si una fecha está en el rango dado
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Resetear las horas para comparar solo fechas
  d.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return d >= start && d <= end;
}; 
import { EnrichedChartResult } from './planetLayer';
import { AspectResult } from './aspectEngine';

/**
 * Shestopalov Mode status and base calculation payload interface.
 * Strictly decoupled from Bindhu and uses exclusively Koch house system.
 */
export interface ShestopalovData {
  enabled: boolean;
  isKoch: boolean;
  houseSystem: string;
  calculatedAt: string;
  baseChartId: string;
  // Prepared foundation fields for future Shestopalov tables, formulas and predictive methods
  notes: string;
}

export interface ShestopalovStateResult {
  available: boolean;
  message?: string;
  data?: ShestopalovData;
}

/**
 * Validates whether Shestopalov mode can be activated based on house system.
 * Rule: Shestopalov uses ONLY the Koch house system.
 */
export function validateShestopalovKoch(houseSystem?: string): { isKoch: boolean; message?: string } {
  const system = (houseSystem || 'Placidus').trim();
  const isKoch = system.toLowerCase() === 'koch';
  
  if (isKoch) {
    return { isKoch: true };
  } else {
    return {
      isKoch: false,
      message: 'Метод Шестопалова доступен только при выборе системы домов Кох. Измените систему домов.'
    };
  }
}

/**
 * Creates the base Shestopalov calculation state/data container from natal chart results.
 * Preserves original natal data, planets, and astronomical calculations without modification.
 */
export function createShestopalovBaseData(
  chart: EnrichedChartResult,
  houseSystem?: string,
  enabled: boolean = false
): ShestopalovData {
  const validation = validateShestopalovKoch(houseSystem);

  return {
    enabled: enabled && validation.isKoch,
    isKoch: validation.isKoch,
    houseSystem: houseSystem || chart.houses.system || 'Placidus',
    calculatedAt: new Date().toISOString(),
    baseChartId: chart.utc || 'natal_chart',
    notes: validation.isKoch
      ? 'Базовая архитектура Шестопалова инициализирована для системы Кох. Данные доступны для прогнозных методов (прогрессии, соляр, локал, транзиты, дирекции).'
      : 'Метод Шестопалова неактивен (требуется система домов Кох).'
  };
}

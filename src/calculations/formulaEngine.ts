import { EnrichedChartResult } from './planetLayer';
import { AspectResult, calculateChartAspects } from './aspectEngine';

/**
 * Source types for formula input data mapping.
 */
export type DataSourceType = 
  | 'planet_position' 
  | 'house_cusp' 
  | 'chart_angle' 
  | 'rulership' 
  | 'dignity' 
  | 'aspect';

/**
 * Describes the origin/source of each value used or evaluated in a formula.
 */
export interface ValueSourceReference {
  sourceType: DataSourceType;
  entityId: string; // e.g. 'sun', 'house_1', 'ascendant', etc.
  descriptionRu: string;
  rawRecord: unknown;
}

/**
 * Definition of a condition evaluated within a formula.
 */
export interface FormulaCondition {
  id: string;
  descriptionRu: string;
  satisfied: boolean;
  actualValue?: unknown;
  expectedValue?: unknown;
  source: ValueSourceReference;
}

/**
 * Definition of an individual formula rule.
 */
export interface FormulaDefinition {
  id: string;
  code: string;
  nameRu: string;
  descriptionRu: string;
  category: 'general' | 'bindhu' | 'shestopalov' | 'custom';
  // A function or spec to evaluate the formula against an EnrichedChartResult and pre-calculated aspects
  evaluate: (chart: EnrichedChartResult, aspects: AspectResult[]) => FormulaResult;
}

/**
 * Result of applying a formula to a specific chart.
 */
export interface FormulaResult {
  formulaId: string;
  formulaCode: string;
  formulaNameRu: string;
  isFulfilled: boolean;
  score?: number; // Optional quantitative weight/score (e.g. for Bindhu/Shestopalov)
  participatingObjects: {
    planetIds: string[];
    houseNumbers: number[];
    rulers: string[];
    aspectIds: string[];
  };
  conditionsMet: FormulaCondition[];
  conditionsUnmet: FormulaCondition[];
  sourcesUsed: ValueSourceReference[];
}

/**
 * Container result for the Formula Engine execution over a chart.
 */
export interface FormulaEngineExecutionResult {
  timestamp: string;
  houseSystem: string;
  totalFormulasEvaluated: number;
  results: FormulaResult[];
}

/**
 * Registry of formula definitions supporting multiple formulas.
 */
export const REGISTERED_FORMULAS: FormulaDefinition[] = [
  {
    id: 'arch_stub_formula_1',
    code: 'STUB_01',
    nameRu: 'Архитектурная заглушка №1 (Базовая проверка присутствия)',
    descriptionRu: 'Тестовая архитектурная формула для проверки контракта (всегда выполняется при наличии Солнца).',
    category: 'general',
    evaluate: (chart: EnrichedChartResult, aspects: AspectResult[]): FormulaResult => {
      const sunPos = chart.positions.find(p => p.id === 'sun');
      const sunSource: ValueSourceReference = {
        sourceType: 'planet_position',
        entityId: 'sun',
        descriptionRu: 'Позиция Солнца в натальной карте',
        rawRecord: sunPos
      };

      const conditionMet = !!sunPos;
      const condition: FormulaCondition = {
        id: 'cond_sun_exists',
        descriptionRu: 'Наличие рассчитанной позиции Солнца в карте',
        satisfied: conditionMet,
        actualValue: sunPos ? `${sunPos.sign} ${sunPos.degree.toFixed(2)}°` : 'отсутствует',
        expectedValue: 'существует',
        source: sunSource
      };

      return {
        formulaId: 'arch_stub_formula_1',
        formulaCode: 'STUB_01',
        formulaNameRu: 'Архитектурная заглушка №1 (Базовая проверка присутствия)',
        isFulfilled: conditionMet,
        score: conditionMet ? 1 : 0,
        participatingObjects: {
          planetIds: sunPos ? [sunPos.id] : [],
          houseNumbers: [],
          rulers: sunPos ? [sunPos.ruler] : [],
          aspectIds: []
        },
        conditionsMet: conditionMet ? [condition] : [],
        conditionsUnmet: conditionMet ? [] : [condition],
        sourcesUsed: [sunSource]
      };
    }
  },
  {
    id: 'arch_stub_formula_2',
    code: 'STUB_02',
    nameRu: 'Архитектурная заглушка №2 (Проверка аспектов и домов)',
    descriptionRu: 'Тестовая архитектурная формула для проверки работы с аспектами и куспидами домов.',
    category: 'general',
    evaluate: (chart: EnrichedChartResult, aspects: AspectResult[]): FormulaResult => {
      const ascLon = chart.houses.angles.ascendant.longitude;
      const ascSource: ValueSourceReference = {
        sourceType: 'chart_angle',
        entityId: 'ascendant',
        descriptionRu: 'Асцендент натальной карты',
        rawRecord: chart.houses.angles.ascendant
      };

      const hasAspects = aspects.length >= 0;
      const aspectSource: ValueSourceReference = {
        sourceType: 'aspect',
        entityId: 'all_aspects',
        descriptionRu: 'Список аспектов из Aspect Engine',
        rawRecord: { totalAspects: aspects.length }
      };

      const cond1: FormulaCondition = {
        id: 'cond_asc_present',
        descriptionRu: 'Наличие рассчитанного ASC',
        satisfied: true,
        actualValue: `${chart.houses.angles.ascendant.sign} ${chart.houses.angles.ascendant.degree.toFixed(2)}°`,
        expectedValue: 'рассчитан',
        source: ascSource
      };

      const cond2: FormulaCondition = {
        id: 'cond_aspects_engine_linked',
        descriptionRu: 'Успешное подключение результатов Aspect Engine',
        satisfied: hasAspects,
        actualCount: aspects.length,
        source: aspectSource
      } as any;

      return {
        formulaId: 'arch_stub_formula_2',
        formulaCode: 'STUB_02',
        formulaNameRu: 'Архитектурная заглушка №2 (Проверка аспектов и домов)',
        isFulfilled: true,
        score: 10,
        participatingObjects: {
          planetIds: [],
          houseNumbers: [1],
          rulers: [],
          aspectIds: aspects.slice(0, 3).map(a => a.id)
        },
        conditionsMet: [cond1, cond2],
        conditionsUnmet: [],
        sourcesUsed: [ascSource, aspectSource]
      };
    }
  }
];

/**
 * Main Formula Engine executor.
 * Takes an EnrichedChartResult and optional custom list of formula definitions.
 * Is strictly deterministic, uses existing Aspect Engine, and does no astronomical calculations.
 */
export function executeFormulaEngine(
  chart: EnrichedChartResult,
  customDefinitions?: FormulaDefinition[]
): FormulaEngineExecutionResult {
  if (!chart || !chart.positions || !chart.houses) {
    throw new Error('FormulaEngine: Invalid or empty EnrichedChartResult provided.');
  }

  // Use Aspect Engine for aspect calculations as required
  const aspects = calculateChartAspects(chart);
  const definitions = customDefinitions || REGISTERED_FORMULAS;

  const results: FormulaResult[] = definitions.map(def => {
    try {
      return def.evaluate(chart, aspects);
    } catch (err) {
      console.error(`Error evaluating formula ${def.code}:`, err);
      // Return unfulfilled result on evaluation error rather than crashing the engine
      return {
        formulaId: def.id,
        formulaCode: def.code,
        formulaNameRu: def.nameRu,
        isFulfilled: false,
        score: 0,
        participatingObjects: { planetIds: [], houseNumbers: [], rulers: [], aspectIds: [] },
        conditionsMet: [],
        conditionsUnmet: [
          {
            id: 'error_evaluation',
            descriptionRu: `Ошибка вычисления формулы: ${err instanceof Error ? err.message : String(err)}`,
            satisfied: false,
            source: {
              sourceType: 'planet_position',
              entityId: 'system',
              descriptionRu: 'Системная ошибка выполнения',
              rawRecord: err
            }
          }
        ],
        sourcesUsed: []
      };
    }
  });

  return {
    timestamp: new Date().toISOString(),
    houseSystem: chart.houses.system || 'Placidus',
    totalFormulasEvaluated: results.length,
    results
  };
}

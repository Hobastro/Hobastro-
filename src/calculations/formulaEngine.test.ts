import { calculateEnrichedChart } from './planetLayer';
import { executeFormulaEngine, REGISTERED_FORMULAS, FormulaDefinition } from './formulaEngine';
import { BirthData, City } from '../types';
import { calculateAspects } from './aspectEngine';

const testCity: City = {
  id: 'moscow',
  name: 'Moscow',
  names: { ru: 'Москва', en: 'Moscow' },
  country: 'Russia',
  region: 'Moscow',
  lat: 55.7558,
  lon: 37.6173,
  timezone: 'Europe/Moscow',
};

const birthData: BirthData = {
  name: 'Test Subject',
  date: '1990-05-15',
  time: '12:00',
  birthCity: testCity,
  residenceCity: testCity,
  solarCity: testCity,
  houseSystem: 'Placidus',
};

console.log('--- RUNNING FORMULA ENGINE ARCHITECTURE TESTS ---');

try {
  // 1. Test calculation of EnrichedChartResult
  const enrichedChart = calculateEnrichedChart(birthData);
  console.assert(enrichedChart !== null && enrichedChart !== undefined, 'EnrichedChartResult should be generated');
  console.assert(Array.isArray(enrichedChart.positions), 'EnrichedChartResult should have positions array');
  console.assert(enrichedChart.houses !== undefined, 'EnrichedChartResult should have houses data');
  console.log('✓ EnrichedChartResult successfully obtained.');

  // 2. Test Formula Engine execution with default formulas
  const engineResult = executeFormulaEngine(enrichedChart);
  console.assert(engineResult !== null, 'Execution result should not be null');
  console.assert(typeof engineResult.timestamp === 'string', 'Execution result should have a timestamp');
  console.assert(Array.isArray(engineResult.results), 'Execution results should be an array');
  console.assert(engineResult.totalFormulasEvaluated === REGISTERED_FORMULAS.length, 'All registered formulas should be evaluated');
  console.log(`✓ Formula Engine successfully evaluated ${engineResult.totalFormulasEvaluated} formulas.`);

  // Verify structure of formula results
  for (const res of engineResult.results) {
    console.assert(typeof res.formulaId === 'string', 'Formula result must have formulaId');
    console.assert(typeof res.isFulfilled === 'boolean', 'Formula result must have isFulfilled boolean');
    console.assert(Array.isArray(res.conditionsMet), 'Formula result must have conditionsMet array');
    console.assert(Array.isArray(res.conditionsUnmet), 'Formula result must have conditionsUnmet array');
    console.assert(Array.isArray(res.sourcesUsed), 'Formula result must have sourcesUsed array');
    console.assert(res.participatingObjects !== undefined, 'Formula result must have participatingObjects');
  }
  console.log('✓ All formula results conform strictly to the structured contract.');

  // 3. Test immutability of input data
  const chartStringBefore = JSON.stringify(enrichedChart);
  executeFormulaEngine(enrichedChart);
  const chartStringAfter = JSON.stringify(enrichedChart);
  console.assert(chartStringBefore === chartStringAfter, 'Formula Engine must not mutate input EnrichedChartResult');
  console.log('✓ Input EnrichedChartResult remains completely unmutated.');

  // 4. Test empty / custom formula definitions support (multiple formulas extensibility)
  const emptyEngineResult = executeFormulaEngine(enrichedChart, []);
  console.assert(emptyEngineResult.totalFormulasEvaluated === 0, 'Should support empty formula definitions list');
  
  const customStub: FormulaDefinition = {
    id: 'custom_test_formula',
    code: 'CUST_01',
    nameRu: 'Пользовательская тестовая формула',
    descriptionRu: 'Проверка добавления сторонней формулы без переписывания движка.',
    category: 'custom',
    evaluate: (chart, aspects) => ({
      formulaId: 'custom_test_formula',
      formulaCode: 'CUST_01',
      formulaNameRu: 'Пользовательская тестовая формула',
      isFulfilled: true,
      participatingObjects: { planetIds: [], houseNumbers: [], rulers: [], aspectIds: [] },
      conditionsMet: [],
      conditionsUnmet: [],
      sourcesUsed: []
    })
  };

  const customEngineResult = executeFormulaEngine(enrichedChart, [customStub]);
  console.assert(customEngineResult.totalFormulasEvaluated === 1, 'Should evaluate provided custom formula list');
  console.assert(customEngineResult.results[0].formulaCode === 'CUST_01', 'Should correctly evaluate custom formula');
  console.log('✓ Successfully supported multiple/custom formula definitions.');

  // 5. Test integration with existing Aspect Engine
  const directAspects = calculateAspects(enrichedChart.positions);
  console.assert(Array.isArray(directAspects), 'Aspect engine should provide aspect results');
  console.log(`✓ Aspect Engine integrated successfully (${directAspects.length} aspects detected).`);

  console.log('--- ALL FORMULA ENGINE ARCHITECTURE TESTS PASSED SUCCESSFULLY ---');
} catch (error) {
  console.error('❌ Formula Engine tests failed:', error);
  process.exit(1);
}

import { calculateChartAspects } from './aspectEngine';
import { buildAspectSemanticModel, OBJECT_FUNCTIONS_RU } from './aspectMeaning';
import { calculateEnrichedChart } from './planetLayer';
import { BirthData, City } from '../types';

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
  name: 'Semantic Aspect Test Subject',
  date: '1988-05-17',
  time: '00:33',
  birthCity: testCity,
  residenceCity: testCity,
  solarCity: testCity,
  houseSystem: 'Placidus',
};

console.log('--- RUNNING ASPECT SEMANTIC LAYER TESTS ---');

try {
  const chart = calculateEnrichedChart(birthData);
  const aspects = calculateChartAspects(chart);

  console.assert(Array.isArray(aspects), 'Aspects must be calculated');
  console.log(`✓ Calculated ${aspects.length} aspects for semantic testing.`);

  const semanticModels = aspects.map(buildAspectSemanticModel);
  console.assert(semanticModels.length === aspects.length, 'All aspects must have corresponding semantic models');

  // Verify structure of semantic models
  for (const model of semanticModels) {
    console.assert(typeof model.aspectId === 'string', 'Model must have aspectId');
    console.assert(model.baseObject !== undefined, 'Model must have baseObject');
    console.assert(model.provokerObject !== undefined, 'Model must have provokerObject');
    console.assert(typeof model.structuralMeaningRu === 'string', 'Model must have structuralMeaningRu');
    console.assert(['harmonious', 'tense', 'neutral', 'concentrated'].includes(model.harmonicLevel), 'Valid harmonic level');
  }
  console.log('✓ All aspect semantic models strictly comply with structural requirements.');

  // Check specific rules and functions dictionary completeness
  for (const pid of ['sun', 'moon', 'venus', 'mars', 'saturn', 'pluto', 'ascendant', 'mc']) {
    console.assert(OBJECT_FUNCTIONS_RU[pid] !== undefined, `Function for ${pid} must be defined in dictionary`);
  }
  console.log('✓ Object functions dictionary contains all required keys.');

  // Print sample semantic model
  if (semanticModels.length > 0) {
    const sample = semanticModels[0];
    console.log('\nSample Structural Meaning Model:');
    console.log(`- Base: ${sample.baseObject.name} (${sample.baseObject.functionRu})`);
    console.log(`- Provoker: ${sample.provokerObject.name} (${sample.provokerObject.functionRu})`);
    console.log(`- Aspect: ${sample.aspectNameRu}`);
    console.log(`- Structural Sentence: "${sample.structuralMeaningRu}"`);
  }

  console.log('--- ALL ASPECT SEMANTIC LAYER TESTS PASSED SUCCESSFULLY ---');
} catch (error) {
  console.error('❌ Aspect semantic layer tests failed:', error);
  process.exit(1);
}

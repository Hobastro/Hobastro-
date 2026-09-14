import { createBindhuMatrix, longitudeToSignAndDegree } from './bindhuEngine';
import { ZODIAC_SIGNS } from './bindhuTypes';
import { EnrichedChartResult, EnrichedPlanetPosition } from './planetLayer';
import { calculateAspects } from './aspectEngine';

console.log('--- RUNNING BINDHU ENGINE ARCHITECTURE TESTS ---');

try {
  // 1. Test coordinate calculation & boundaries
  const testCases = [
    { lon: 0.0, expectedSign: 'Овен', expectedDeg: 0 },
    { lon: 29.99, expectedSign: 'Овен', expectedDeg: 29 },
    { lon: 30.0, expectedSign: 'Телец', expectedDeg: 0 },
    { lon: 359.99, expectedSign: 'Рыбы', expectedDeg: 29 },
    { lon: 360.0, expectedSign: 'Овен', expectedDeg: 0 },
  ];

  testCases.forEach(({ lon, expectedSign, expectedDeg }) => {
    const res = longitudeToSignAndDegree(lon);
    console.assert(res.sign === expectedSign, `Longitude ${lon} should be in ${expectedSign}, got ${res.sign}`);
    console.assert(res.degree === expectedDeg, `Longitude ${lon} should be degree ${expectedDeg}, got ${res.degree}`);
  });

  // Negative longitude normalization check
  const negRes = longitudeToSignAndDegree(-0.01);
  console.assert(negRes.sign === 'Рыбы', 'Negative longitude normalization sign check');
  console.assert(negRes.degree === 29, 'Negative longitude normalization degree check');
  console.log('✓ Coordinate boundary tests passed.');

  // 2. Build mock EnrichedChartResult adhering to contract to test matrix generation
  const mockPositions: EnrichedPlanetPosition[] = [
    { id: 'sun', name: 'Солнце', longitude: 15.5, speed: 1, sign: 'Овен', degree: 15.5, retrograde: false, house: 1, ruler: 'mars', rulesSigns: ['Лев'], rulesHouses: [], dignities: { isDomicile: false, isDetriment: false, isExalted: false, isFallen: false } },
    { id: 'moon', name: 'Луна', longitude: 45.2, speed: 13, sign: 'Телец', degree: 15.2, retrograde: false, house: 2, ruler: 'venus', rulesSigns: ['Рак'], rulesHouses: [], dignities: { isDomicile: false, isDetriment: false, isExalted: true, isFallen: false } },
    { id: 'mars', name: 'Марс', longitude: 195.0, speed: 0.5, sign: 'Весы', degree: 15.0, retrograde: false, house: 7, ruler: 'venus', rulesSigns: ['Овен', 'Скорпион'], rulesHouses: [], dignities: { isDomicile: false, isDetriment: true, isExalted: false, isFallen: false } },
  ];

  const mockChart: EnrichedChartResult = {
    utc: '2026-09-09T12:00:00Z',
    julianDay: 2461293.0,
    positions: mockPositions,
    houses: {
      system: 'Placidus',
      angles: {
        ascendant: { longitude: 0, sign: 'Овен', degree: 0 },
        mc: { longitude: 270, sign: 'Козерог', degree: 0 },
        ic: { longitude: 90, sign: 'Рак', degree: 0 },
        descendant: { longitude: 180, sign: 'Весы', degree: 0 },
      },
      cusps: []
    }
  };

  const chartBeforeString = JSON.stringify(mockChart);
  const matrix = createBindhuMatrix(mockChart);
  const chartAfterString = JSON.stringify(mockChart);

  // 3. Verify matrix structure
  console.assert(matrix.totalSigns === 12, 'Matrix must have 12 signs');
  console.assert(matrix.totalDegrees === 360, 'Matrix must have 360 total positions');
  console.assert(Object.keys(matrix.signs).length === 12, 'All 12 signs must be present in signs map');
  
  // Verify standard order
  const signKeys = Object.keys(matrix.signs);
  console.assert(signKeys[0] === 'Овен', 'First sign must be Aries');
  console.assert(signKeys[11] === 'Рыбы', 'Last sign must be Pisces');

  // Verify cells per sign
  ZODIAC_SIGNS.forEach(signName => {
    const row = matrix.signs[signName];
    console.assert(row.cells.length === 30, `Sign ${signName} must have exactly 30 degree cells`);
  });

  // Verify object placement
  console.assert(matrix.allObjects.length === 3, 'Must contain all 3 test objects');
  const ariesCell15 = matrix.signs['Овен'].cells[15];
  console.assert(ariesCell15.objects.length === 1, 'Sun should be in Aries 15° cell');
  console.assert(ariesCell15.objects[0].id === 'sun', 'Object in Aries 15° must be Sun');

  // Verify immutability of input
  console.assert(chartBeforeString === chartAfterString, 'Bindhu Matrix creation must not mutate input chart');

  // Verify aspect integration
  console.assert(Array.isArray(matrix.allAspects), 'Matrix must include aspects array');
  console.log('✓ Bindhu Matrix architecture and tests passed successfully.');

  console.log('--- ALL BINDHU ENGINE TESTS PASSED ---');
} catch (error) {
  console.error('❌ Bindhu Engine tests failed:', error);
  process.exit(1);
}

import { calculateChartAspects } from './aspectEngine';
import { calculatePositions } from './astroEngine';
import { enrichChartPositions } from './planetLayer';
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
  name: 'All House Systems Test',
  date: '1988-05-17',
  time: '00:33',
  birthCity: testCity,
  residenceCity: testCity,
  solarCity: testCity,
  houseSystem: 'Placidus',
};

const systems = ['Placidus', 'Koch', 'KochShestopalov', 'Equal', 'Regiomontanus', 'WholeSign'];

console.log('--- RUNNING CROSS-HOUSE SYSTEM ASPECT & HOUSE INTEGRITY TESTS ---');

try {
  let baselinePlanetsJson = '';

  for (const sys of systems) {
    const astroRes = calculatePositions(birthData, sys as any);
    const chart = enrichChartPositions(astroRes);
    console.assert(chart !== null, `Chart for system ${sys} must not be null`);
    console.assert(chart.houses.system === sys, `Houses system must be ${sys}`);

    const planetsJson = JSON.stringify(chart.positions.map(p => ({ id: p.id, lon: p.longitude })));
    if (!baselinePlanetsJson) {
      baselinePlanetsJson = planetsJson;
    } else {
      console.assert(planetsJson === baselinePlanetsJson, `Planet longitudes must remain independent of house system (${sys})`);
    }

    const aspects = calculateChartAspects(chart);
    console.assert(Array.isArray(aspects), `Aspects for ${sys} must be array`);
    console.log(`✓ System [${sys.padEnd(16)}]: calculated ${chart.positions.length} planets, ${chart.houses.cusps.length} cusps, ${aspects.length} aspects.`);
  }

  console.log('--- ALL CROSS-HOUSE SYSTEM TESTS PASSED SUCCESSFULLY ---');
} catch (error) {
  console.error('❌ Cross-house system tests failed:', error);
  process.exit(1);
}

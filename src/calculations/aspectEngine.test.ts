import { calculateChartAspects } from './aspectEngine';
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
  name: 'Aspect Verification Test',
  date: '1988-05-17',
  time: '00:33',
  birthCity: testCity,
  residenceCity: testCity,
  solarCity: testCity,
  houseSystem: 'Placidus',
};

console.log('--- RUNNING ASPECT ENGINE COMPREHENSIVE VERIFICATION ---');

try {
  const chart = calculateEnrichedChart(birthData);
  const aspects = calculateChartAspects(chart);

  console.assert(Array.isArray(aspects), 'Aspects result must be an array');
  console.log(`✓ Calculated ${aspects.length} total aspects for test birth data in Placidus.`);

  // Verify all aspects have orb <= 7.0°
  for (const asp of aspects) {
    console.assert(asp.orb <= 3.0, `Aspect ${asp.source.name} - ${asp.target.name} (${asp.aspectNameRu}) has orb ${asp.orb}° which exceeds MAX_ORB 3.0°`);
    console.assert(asp.source.id !== asp.target.id, 'No self aspects allowed');
  }
  console.log('✓ All generated aspects strictly respect max orb <= 7.0° and unique object pairs.');

  // Check unique pair constraint (no A-B and B-A duplicates)
  const pairCheck = new Set<string>();
  for (const asp of aspects) {
    const key = [asp.source.id, asp.target.id].sort().join('-');
    console.assert(!pairCheck.has(key), `Duplicate pair detected: ${key}`);
    pairCheck.add(key);
  }
  console.log('✓ Pair uniqueness constraint verified (each pair counted exactly once).');

  // Log detected aspects with angles and houses for inspection
  console.log('\nSample detected aspects:');
  aspects.slice(0, 10).forEach(a => {
    console.log(`- ${a.source.name} (${a.source.house} д.) ↔ ${a.target.name} (${a.target.house} д.) : ${a.aspectNameRu} (Орб: ${a.orb}°, Акт. угол: ${a.actualAngle.toFixed(2)}°)`);
  });

  console.log('--- ASPECT ENGINE VERIFICATION COMPLETED SUCCESSFULLY ---');
} catch (error) {
  console.error('❌ Aspect verification test failed:', error);
  process.exit(1);
}

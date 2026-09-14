import { calculatePositions } from './src/calculations/astroEngine';

const chart = calculatePositions({
  name: 'Test',
  date: '2017-06-19',
  time: '17:28',
  birthCity: {
    id: 'rheine',
    name: 'Rheine',
    names: { ru: 'Райне', en: 'Rheine' },
    country: 'Germany',
    region: 'North Rhine-Westphalia',
    lat: 52.2833,
    lon: 7.4333,
    timezone: 'UTC'
  },
  residenceCity: {
    id: 'rheine',
    name: 'Rheine',
    names: { ru: 'Райне', en: 'Rheine' },
    country: 'Germany',
    region: 'North Rhine-Westphalia',
    lat: 52.2833,
    lon: 7.4333,
    timezone: 'UTC'
  },
  solarCity: {
    id: 'rheine',
    name: 'Rheine',
    names: { ru: 'Райне', en: 'Rheine' },
    country: 'Germany',
    region: 'North Rhine-Westphalia',
    lat: 52.2833,
    lon: 7.4333,
    timezone: 'UTC'
  },
  houseSystem: 'Placidus'
});

console.log(JSON.stringify(chart, null, 2));

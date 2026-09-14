import { enrichChartPositions, EnrichedChartResult, EnrichedPlanetPosition } from './planetLayer';
import { PlanetId } from './rulerships';

console.log('--- RUNNING RULES HOUSES TESTS ---');

const mockAstroResult: any = {
  utc: '2026-01-01T00:00:00Z',
  julianDay: 2460000.5,
  positions: [
    { id: 'venus', name: 'Венера', longitude: 15, speed: 1, sign: 'Овен', degree: 15, retrograde: false },
    { id: 'mars', name: 'Марс', longitude: 45, speed: 1, sign: 'Телец', degree: 15, retrograde: false },
    { id: 'mercury', name: 'Меркурий', longitude: 75, speed: 1, sign: 'Близнецы', degree: 15, retrograde: false },
    { id: 'jupiter', name: 'Юпитер', longitude: 105, speed: 1, sign: 'Рак', degree: 15, retrograde: false },
    { id: 'saturn', name: 'Сатурн', longitude: 135, speed: 1, sign: 'Лев', degree: 15, retrograde: false },
    { id: 'sun', name: 'Солнце', longitude: 165, speed: 1, sign: 'Дева', degree: 15, retrograde: false },
    { id: 'moon', name: 'Луна', longitude: 195, speed: 1, sign: 'Весы', degree: 15, retrograde: false },
    { id: 'uranus', name: 'Уран', longitude: 225, speed: 1, sign: 'Скорпион', degree: 15, retrograde: false },
    { id: 'neptune', name: 'Нептун', longitude: 255, speed: 1, sign: 'Стрелец', degree: 15, retrograde: false },
    { id: 'pluto', name: 'Плутон', longitude: 285, speed: 1, sign: 'Козерог', degree: 15, retrograde: false },
    { id: 'north_node', name: 'Северный узел', longitude: 315, speed: 1, sign: 'Водолей', degree: 15, retrograde: false },
    { id: 'lilith', name: 'Лилит', longitude: 345, speed: 1, sign: 'Рыбы', degree: 15, retrograde: false }
  ],
  houses: {
    system: 'Placidus',
    angles: {
      ascendant: { longitude: 0, sign: 'Овен', degree: 0 },
      mc: { longitude: 270, sign: 'Козерог', degree: 0 },
      ic: { longitude: 90, sign: 'Рак', degree: 0 },
      descendant: { longitude: 180, sign: 'Весы', degree: 0 }
    },
    cusps: [
      { id: 'house_1', name: '1 дом', number: 1, longitude: 0, sign: 'Телец', degree: 0 },      // ruler: venus
      { id: 'house_2', name: '2 дом', number: 2, longitude: 30, sign: 'Близнецы', degree: 0 },  // ruler: mercury
      { id: 'house_3', name: '3 дом', number: 3, longitude: 60, sign: 'Рак', degree: 0 },      // ruler: moon
      { id: 'house_4', name: '4 дом', number: 4, longitude: 90, sign: 'Лев', degree: 0 },      // ruler: sun
      { id: 'house_5', name: '5 дом', number: 5, longitude: 120, sign: 'Дева', degree: 0 },    // ruler: mercury
      { id: 'house_6', name: '6 дом', number: 6, longitude: 150, sign: 'Весы', degree: 0 },    // ruler: venus
      { id: 'house_7', name: '7 дом', number: 7, longitude: 180, sign: 'Скорпион', degree: 0 },// ruler: mars
      { id: 'house_8', name: '8 дом', number: 8, longitude: 210, sign: 'Стрелец', degree: 0 },// ruler: jupiter
      { id: 'house_9', name: '9 дом', number: 9, longitude: 240, sign: 'Козерог', degree: 0 },// ruler: saturn
      { id: 'house_10', name: '10 дом', number: 10, longitude: 270, sign: 'Водолей', degree: 0 }, // ruler: saturn
      { id: 'house_11', name: '11 дом', number: 11, longitude: 300, sign: 'Рыбы', degree: 0 },    // ruler: jupiter
      { id: 'house_12', name: '12 дом', number: 12, longitude: 330, sign: 'Овен', degree: 0 }     // ruler: mars
    ]
  }
};

const enriched = enrichChartPositions(mockAstroResult);
const posMap = new Map<PlanetId, EnrichedPlanetPosition>(enriched.positions.map(p => [p.id, p]));

// 1. Venus gets houses whose cusps are in Taurus or Libra (cusp 1 is Taurus, cusp 6 is Libra -> [1, 6])
const venus = posMap.get('venus')!;
if (JSON.stringify(venus.rulesHouses) === JSON.stringify([1, 6])) {
  console.log('✓ Venus rulesHouses [1, 6] passed.');
} else {
  throw new Error(`Expected Venus rulesHouses [1, 6], got ${JSON.stringify(venus.rulesHouses)}`);
}

// 2. Mars gets houses in Aries and Scorpio (cusp 12 is Aries, cusp 7 is Scorpio -> sorted numerically: [7, 12])
const mars = posMap.get('mars')!;
if (JSON.stringify(mars.rulesHouses) === JSON.stringify([7, 12])) {
  console.log('✓ Mars rulesHouses [7, 12] passed.');
} else {
  throw new Error(`Expected Mars rulesHouses [7, 12], got ${JSON.stringify(mars.rulesHouses)}`);
}

// 3. Mercury gets houses in Gemini and Virgo (cusp 2 is Gemini, cusp 5 is Virgo -> [2, 5])
const mercury = posMap.get('mercury')!;
if (JSON.stringify(mercury.rulesHouses) === JSON.stringify([2, 5])) {
  console.log('✓ Mercury rulesHouses [2, 5] passed.');
} else {
  throw new Error(`Expected Mercury rulesHouses [2, 5], got ${JSON.stringify(mercury.rulesHouses)}`);
}

// 4. Jupiter gets houses in Sagittarius and Pisces (cusp 8 is Sagittarius, cusp 11 is Pisces -> [8, 11])
const jupiter = posMap.get('jupiter')!;
if (JSON.stringify(jupiter.rulesHouses) === JSON.stringify([8, 11])) {
  console.log('✓ Jupiter rulesHouses [8, 11] passed.');
} else {
  throw new Error(`Expected Jupiter rulesHouses [8, 11], got ${JSON.stringify(jupiter.rulesHouses)}`);
}

// 5. Saturn gets houses in Capricorn and Aquarius (cusp 9 is Capricorn, cusp 10 is Aquarius -> [9, 10])
const saturn = posMap.get('saturn')!;
if (JSON.stringify(saturn.rulesHouses) === JSON.stringify([9, 10])) {
  console.log('✓ Saturn rulesHouses [9, 10] passed.');
} else {
  throw new Error(`Expected Saturn rulesHouses [9, 10], got ${JSON.stringify(saturn.rulesHouses)}`);
}

// 6. Sun gets houses in Leo (cusp 4 is Leo -> [4])
const sun = posMap.get('sun')!;
if (JSON.stringify(sun.rulesHouses) === JSON.stringify([4])) {
  console.log('✓ Sun rulesHouses [4] passed.');
} else {
  throw new Error(`Expected Sun rulesHouses [4], got ${JSON.stringify(sun.rulesHouses)}`);
}

// 7. Moon gets houses in Cancer (cusp 3 is Cancer -> [3])
const moon = posMap.get('moon')!;
if (JSON.stringify(moon.rulesHouses) === JSON.stringify([3])) {
  console.log('✓ Moon rulesHouses [3] passed.');
} else {
  throw new Error(`Expected Moon rulesHouses [3], got ${JSON.stringify(moon.rulesHouses)}`);
}

// 8. Uranus/Neptune/Pluto/nodes/Lilith get []
const nonClassical: PlanetId[] = ['uranus', 'neptune', 'pluto', 'north_node', 'lilith'];
for (const pId of nonClassical) {
  const p = posMap.get(pId)!;
  if (Array.isArray(p.rulesHouses) && p.rulesHouses.length === 0) {
    console.log(`✓ Planet ${pId} rulesHouses [] passed.`);
  } else {
    throw new Error(`Expected ${pId} rulesHouses [], got ${JSON.stringify(p.rulesHouses)}`);
  }
}

// 9. Numeric sorting check (e.g. [7, 12])
if (Array.isArray(mars.rulesHouses) && mars.rulesHouses[0] < mars.rulesHouses[1]) {
  console.log('✓ RulesHouses numeric sorting passed.');
} else {
  throw new Error(`RulesHouses not sorted numerically: ${JSON.stringify(mars.rulesHouses)}`);
}

// 10. Modern rulesHouses tests for Uranus, Neptune, Pluto
const uranus = posMap.get('uranus')!;
const neptune = posMap.get('neptune')!;
const pluto = posMap.get('pluto')!;

// In mockAstroResult:
// cusp 7 is Scorpio (Pluto -> modernRulesHouses = [8])
// cusp 10 is Aquarius (Uranus -> modernRulesHouses = [11])
// cusp 11 is Pisces (Neptune -> modernRulesHouses = [12])
if (JSON.stringify(pluto.rulesHouses) === '[]' && JSON.stringify(pluto.modernRulesHouses) === JSON.stringify([8])) {
  console.log('✓ Pluto modernRulesHouses [8] passed, rulesHouses remains [].');
} else {
  throw new Error(`Expected Pluto modernRulesHouses [8] and empty rulesHouses, got rulesHouses: ${JSON.stringify(pluto.rulesHouses)}, modern: ${JSON.stringify(pluto.modernRulesHouses)}`);
}

if (JSON.stringify(uranus.rulesHouses) === '[]' && JSON.stringify(uranus.modernRulesHouses) === JSON.stringify([11])) {
  console.log('✓ Uranus modernRulesHouses [11] passed, rulesHouses remains [].');
} else {
  throw new Error(`Expected Uranus modernRulesHouses [11] and empty rulesHouses, got rulesHouses: ${JSON.stringify(uranus.rulesHouses)}, modern: ${JSON.stringify(uranus.modernRulesHouses)}`);
}

if (JSON.stringify(neptune.rulesHouses) === '[]' && JSON.stringify(neptune.modernRulesHouses) === JSON.stringify([12])) {
  console.log('✓ Neptune modernRulesHouses [12] passed, rulesHouses remains [].');
} else {
  throw new Error(`Expected Neptune modernRulesHouses [12] and empty rulesHouses, got rulesHouses: ${JSON.stringify(neptune.rulesHouses)}, modern: ${JSON.stringify(neptune.modernRulesHouses)}`);
}

console.log('ALL RULES HOUSES TESTS PASSED SUCCESSFULLY.');

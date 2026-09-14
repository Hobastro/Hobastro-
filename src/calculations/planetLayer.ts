import type { AstroCalculationResult } from './astroEngine';
import { TRADITIONAL_RULERSHIPS, ZodiacSignName, PlanetId, getSignRuler, getPlanetSignsRuled, getPlanetDignities } from './rulerships';
import { City, BirthData } from '../types';

export interface EnrichedPlanetPosition {
  id: PlanetId;
  name: string;
  longitude: number;
  speed: number;
  sign: ZodiacSignName;
  degree: number;
  retrograde: boolean;
  house: number;
  ruler: PlanetId;
  rulesSigns: ZodiacSignName[];
  rulesHouses: number[];
  modernRulesHouses?: number[];
  dignities: {
    isDomicile: boolean;
    isDetriment: boolean;
    isExalted: boolean;
    isFallen: boolean;
  };
}

export interface EnrichedChartResult extends Omit<AstroCalculationResult, 'positions'> {
  positions: EnrichedPlanetPosition[];
}

export function getHouseForLongitude(longitude: number, cusps: AstroCalculationResult['houses']['cusps']): number {
  const normLon = (longitude % 360 + 360) % 360;

  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];

    const start = currentCusp.longitude;
    const end = nextCusp.longitude;

    if (end < start) {
      if (normLon >= start || normLon < end) {
        return i + 1;
      }
    } else {
      if (normLon >= start && normLon < end) {
        return i + 1;
      }
    }
  }
  return 1;
}

export function enrichChartPositions(astronomyResult: AstroCalculationResult): EnrichedChartResult {
  const cusps = astronomyResult.houses.cusps;

  const enrichedPositions: EnrichedPlanetPosition[] = astronomyResult.positions.map(pos => {
    const sign = pos.sign as ZodiacSignName;
    const planetId = pos.id as PlanetId;
    const ruler = getSignRuler(sign);
    const rulesSigns = getPlanetSignsRuled(planetId);
    const dignities = getPlanetDignities(planetId);
    const house = getHouseForLongitude(pos.longitude, cusps);

    const rulesHouses: number[] = [];
    for (let i = 0; i < 12; i++) {
      const cusp = cusps[i];
      const cuspSign = cusp.sign as ZodiacSignName;
      if (getSignRuler(cuspSign) === planetId) {
        rulesHouses.push(i + 1);
      }
    }

    const modernRulesHouses: number[] = [];
    if (planetId === 'uranus' || planetId === 'neptune' || planetId === 'pluto') {
      const modernSignMap: Record<string, ZodiacSignName> = {
        uranus: 'Водолей',
        neptune: 'Рыбы',
        pluto: 'Скорпион',
      };
      const targetSign = modernSignMap[planetId];
      if (targetSign) {
        const signs = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'] as const;
        for (let i = 0; i < 12; i++) {
          const start = cusps[i].longitude;
          const end = cusps[(i + 1) % 12].longitude;
          let span = end < start ? end + 360 - start : end - start;
          let found = false;
          for (let d = 0; d <= span; d += 0.2) {
            let lon = (start + d) % 360;
            if (signs[Math.floor(lon / 30)] === targetSign) {
              found = true;
              break;
            }
          }
          if (found && !modernRulesHouses.includes(i + 1)) {
            modernRulesHouses.push(i + 1);
          }
        }
      }
    }

    return {
      ...pos,
      id: planetId,
      sign,
      house,
      ruler,
      rulesSigns,
      rulesHouses,
      modernRulesHouses,
      dignities: {
        isDomicile: dignities.domicile.includes(sign),
        isDetriment: dignities.detriment.includes(sign),
        isExalted: dignities.exaltation === sign,
        isFallen: dignities.fall === sign,
      }
    };
  });

  return {
    ...astronomyResult,
    positions: enrichedPositions
  };
}

export function calculateEnrichedChart(birthData: BirthData, houseSystem?: any): EnrichedChartResult {
  throw new Error('calculateEnrichedChart must not be called on the client side');
}

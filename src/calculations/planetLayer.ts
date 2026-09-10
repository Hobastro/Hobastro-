import { calculatePositions, AstroCalculationResult } from './astroEngine';
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
  ruler: PlanetId;
  rulesSigns: ZodiacSignName[];
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

export function enrichChartPositions(astronomyResult: AstroCalculationResult): EnrichedChartResult {
  const enrichedPositions: EnrichedPlanetPosition[] = astronomyResult.positions.map(pos => {
    const sign = pos.sign as ZodiacSignName;
    const planetId = pos.id as PlanetId;
    const ruler = getSignRuler(sign);
    const rulesSigns = getPlanetSignsRuled(planetId);
    const dignities = getPlanetDignities(planetId);

    return {
      ...pos,
      id: planetId,
      sign,
      ruler,
      rulesSigns,
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
  const astroResult = calculatePositions(birthData, houseSystem);
  return enrichChartPositions(astroResult);
}

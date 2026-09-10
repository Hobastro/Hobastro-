import { EnrichedPlanetPosition } from './planetLayer';

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface AspectDefinition {
  type: AspectType;
  nameRu: string;
  angle: number;
}

export const SUPPORTED_ASPECTS: AspectDefinition[] = [
  { type: 'conjunction', nameRu: 'Соединение', angle: 0 },
  { type: 'sextile', nameRu: 'Секстиль', angle: 60 },
  { type: 'square', nameRu: 'Квадратура', angle: 90 },
  { type: 'trine', nameRu: 'Трин', angle: 120 },
  { type: 'opposition', nameRu: 'Оппозиция', angle: 180 },
];

export const MAX_ORB = 3.0;

export interface AspectResult {
  id: string;
  source: {
    id: string;
    name: string;
    longitude: number;
  };
  target: {
    id: string;
    name: string;
    longitude: number;
  };
  aspectType: AspectType;
  aspectNameRu: string;
  exactAngle: number;
  actualAngle: number;
  orb: number;
  // Role preparation for Interpretation Engine later
  interpretationRoles: {
    basePlanet: { id: string; name: string };
    provokerPlanet: { id: string; name: string };
    aspectType: AspectType;
    interactionCharacter: string;
  };
}

export function calculateAngularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function calculateAspects(positions: EnrichedPlanetPosition[]): AspectResult[] {
  const aspects: AspectResult[] = [];
  const seenPairs = new Set<string>();

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];

      // Ensure stable pair ordering or unique key to prevent duplicates
      const pairKey = [p1.id, p2.id].sort().join('-');
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const distance = calculateAngularDistance(p1.longitude, p2.longitude);

      for (const def of SUPPORTED_ASPECTS) {
        const orb = Math.abs(distance - def.angle);
        if (orb <= MAX_ORB) {
          aspects.push({
            id: `${p1.id}-${def.type}-${p2.id}`,
            source: {
              id: p1.id,
              name: p1.name,
              longitude: p1.longitude,
            },
            target: {
              id: p2.id,
              name: p2.name,
              longitude: p2.longitude,
            },
            aspectType: def.type,
            aspectNameRu: def.nameRu,
            exactAngle: def.angle,
            actualAngle: distance,
            orb: parseFloat(orb.toFixed(4)),
            interpretationRoles: {
              basePlanet: { id: p1.id, name: p1.name },
              provokerPlanet: { id: p2.id, name: p2.name },
              aspectType: def.type,
              interactionCharacter: getInteractionCharacter(def.type)
            }
          });
          // Only one major aspect per pair that fits within orb
          break;
        }
      }
    }
  }

  return aspects;
}

function getInteractionCharacter(type: AspectType): string {
  switch (type) {
    case 'conjunction': return 'слияние / концентрация';
    case 'sextile': return 'возможность / гармоничное содействие';
    case 'square': return 'напряжение / вызов / преодоление';
    case 'trine': return 'гармония / поток / талант';
    case 'opposition': return 'полярность / баланс / противостояние';
  }
}

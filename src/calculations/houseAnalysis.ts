import { EnrichedChartResult, EnrichedPlanetPosition, getHouseForLongitude } from './planetLayer';
import { ZodiacSignName, PlanetId, getSignRuler } from './rulerships';
import { calculateChartAspects, AspectResult } from './aspectEngine';

export type HouseConnectionDataType = 'ruler_position' | 'planet_position' | 'planet_rulership' | 'planet_aspect' | 'cusp_aspect';

export interface HouseAnalysisConnection {
  sourceHouse: number;
  targetHouse: number;
  type: HouseConnectionDataType;
  planet: string;
  secondaryPlanet?: string;
  aspectName?: string;
  detailText: string;
}

export interface HouseAnalysisItem {
  houseNumber: number;
  name: string;
  cuspSign: ZodiacSignName;
  ruler: PlanetId;
  modernCoRuler?: PlanetId;
  rulerHouse: number;
  planetsInHouse: EnrichedPlanetPosition[];
  anglesInHouse: string[];
  connections: HouseAnalysisConnection[];
}

export interface HouseAnalysisResult {
  houses: HouseAnalysisItem[];
  connections: HouseAnalysisConnection[];
}

const PLANET_NAMES_RU_MAP: Record<string, string> = {
  sun: 'Солнце',
  moon: 'Луна',
  mercury: 'Меркурий',
  venus: 'Венера',
  mars: 'Марс',
  jupiter: 'Юпитер',
  saturn: 'Сатурн',
  uranus: 'Уран',
  neptune: 'Нептун',
  pluto: 'Плутон',
  north_node: 'Северный узел',
  south_node: 'Южный узел',
  lilith: 'Лилит',
  ascendant: 'ASC',
  descendant: 'DSC',
  mc: 'MC',
  ic: 'IC'
};

export function getPlanetRuName(id: string): string {
  return PLANET_NAMES_RU_MAP[id] || id;
}

export function calculateHouseAnalysis(chart: EnrichedChartResult): HouseAnalysisResult {
  const cusps = chart.houses.cusps;
  const positions = chart.positions;
  const angles = chart.houses.angles;

  // Calculate aspects using the existing engine (maxOrb 3.0 or standard)
  const aspects = calculateChartAspects(chart);

  // Helper to get house for any longitude or planet/angle
  const getHouseForPoint = (lon: number, pointId?: string): number => {
    if (pointId === 'ascendant') return 1;
    if (pointId === 'descendant') {
      const dsc = angles?.descendant;
      if (dsc) return getHouseForLongitude(dsc.longitude, cusps);
      return 7;
    }
    if (pointId === 'mc') {
      const mc = angles?.mc;
      if (mc) return cusps.find(c => c.number === 10)?.number || getHouseForLongitude(mc.longitude, cusps);
      return 10;
    }
    if (pointId === 'ic') {
      const ic = angles?.ic;
      if (ic) return cusps.find(c => c.number === 4)?.number || getHouseForLongitude(ic.longitude, cusps);
      return 4;
    }
    const pos = positions.find(p => p.id === pointId);
    if (pos && typeof pos.house === 'number') return pos.house;
    return getHouseForLongitude(lon, cusps);
  };

  const houses: HouseAnalysisItem[] = [];
  const allConnections: HouseAnalysisConnection[] = [];

  for (let i = 1; i <= 12; i++) {
    const cuspObj = cusps[i - 1];
    const cuspSign = (cuspObj?.sign || 'Овен') as ZodiacSignName;
    const ruler = getSignRuler(cuspSign);

    // Modern co-ruler check if applicable (Uranus for Aquarius, Neptune for Pisces, Pluto for Scorpio)
    let modernCoRuler: PlanetId | undefined = undefined;
    if (cuspSign === 'Водолей') modernCoRuler = 'uranus';
    else if (cuspSign === 'Рыбы') modernCoRuler = 'neptune';
    else if (cuspSign === 'Скорпион') modernCoRuler = 'pluto';

    // Find house where the ruler is located
    const rulerPlanetObj = positions.find(p => p.id === ruler);
    const rulerHouse = rulerPlanetObj ? rulerPlanetObj.house : getHouseForLongitude(rulerPlanetObj?.longitude ?? 0, cusps);

    // Find planets located in this house
    const planetsInHouse = positions.filter(p => p.house === i);

    // Check angles belonging to this house
    const anglesInHouse: string[] = [];
    if (i === 1 && angles?.ascendant) anglesInHouse.push('ASC');
    if (i === 7 && angles?.descendant) anglesInHouse.push('DSC');
    if (i === 10 && angles?.mc) anglesInHouse.push('MC');
    if (i === 4 && angles?.ic) anglesInHouse.push('IC');

    const connections: HouseAnalysisConnection[] = [];

    // 1. По положению (By position):
    // - ruler position connection: "1 → 12 — Сатурн: управитель 1 дома находится в 12 доме"
    if (rulerHouse) {
      const rulerRu = getPlanetRuName(ruler);
      const detailText = `${rulerRu}: управитель ${i} дома находится в ${rulerHouse} доме`;
      const conn: HouseAnalysisConnection = {
        sourceHouse: i,
        targetHouse: rulerHouse,
        type: 'ruler_position',
        planet: ruler,
        detailText
      };
      connections.push(conn);
      allConnections.push(conn);
    }

    // - modern co-ruler position connection if present
    if (modernCoRuler) {
      const coRulerObj = positions.find(p => p.id === modernCoRuler);
      const coRulerHouse = coRulerObj ? coRulerObj.house : getHouseForLongitude(coRulerObj?.longitude ?? 0, cusps);
      if (coRulerHouse) {
        const coRulerRu = getPlanetRuName(modernCoRuler);
        const detailText = `${coRulerRu}: соправитель ${i} дома находится в ${coRulerHouse} доме`;
        const conn: HouseAnalysisConnection = {
          sourceHouse: i,
          targetHouse: coRulerHouse,
          type: 'ruler_position',
          planet: modernCoRuler,
          detailText
        };
        const isDup = connections.some(c => c.sourceHouse === conn.sourceHouse && c.targetHouse === conn.targetHouse && c.planet === conn.planet);
        if (!isDup) {
          connections.push(conn);
          allConnections.push(conn);
        }
      }
    }

    // - planets in house: "1 → 1 — Нептун: планета находится в 1 доме"
    for (const planet of planetsInHouse) {
      const planetRu = getPlanetRuName(planet.id);
      const detailText = `${planetRu}: планета находится в ${i} доме`;
      const conn: HouseAnalysisConnection = {
        sourceHouse: i,
        targetHouse: i,
        type: 'planet_position',
        planet: planet.id,
        detailText
      };
      const isDup = connections.some(c => c.sourceHouse === conn.sourceHouse && c.targetHouse === conn.targetHouse && c.planet === conn.planet && c.type === 'planet_position');
      if (!isDup) {
        connections.push(conn);
        allConnections.push(conn);
      }
    }

    // Also include planet rulerships for planets in this house ruling other houses
    for (const planet of planetsInHouse) {
      if (planet.rulesHouses && Array.isArray(planet.rulesHouses)) {
        for (const ruledHouse of planet.rulesHouses) {
          if (ruledHouse !== i) {
            const planetRu = getPlanetRuName(planet.id);
            const detailText = `${planetRu} (управитель ${ruledHouse} дома) находится в ${i} доме`;
            const conn: HouseAnalysisConnection = {
              sourceHouse: ruledHouse,
              targetHouse: i,
              type: 'planet_rulership',
              planet: planet.id,
              detailText
            };
            const isDup = connections.some(c => c.sourceHouse === conn.sourceHouse && c.targetHouse === conn.targetHouse && c.planet === conn.planet);
            if (!isDup) {
              connections.push(conn);
              allConnections.push(conn);
            }
          }
        }
      }
    }

    // 2. По аспектам между планетами (By aspects between planets)
    // For each unique planet pair involved in an aspect, assign directions from A's houses to B's houses
    // where A is the planet whose house matches i.
    for (const asp of aspects) {
      const p1Id = asp.source.id;
      const p2Id = asp.target.id;

      const p1Obj = positions.find(p => p.id === p1Id);
      const p2Obj = positions.find(p => p.id === p2Id);

      if (!p1Obj || !p2Obj) continue; // Only planet-planet aspects here

      // Collect all houses for p1 (positionHouse + rulesHouses, unique)
      const p1Houses = new Set<number>();
      if (typeof p1Obj.house === 'number') p1Houses.add(p1Obj.house);
      if (p1Obj.rulesHouses && Array.isArray(p1Obj.rulesHouses)) {
        for (const rh of p1Obj.rulesHouses) {
          p1Houses.add(rh);
        }
      }

      // Collect all houses for p2 (positionHouse + rulesHouses, unique)
      const p2Houses = new Set<number>();
      if (typeof p2Obj.house === 'number') p2Houses.add(p2Obj.house);
      if (p2Obj.rulesHouses && Array.isArray(p2Obj.rulesHouses)) {
        for (const rh of p2Obj.rulesHouses) {
          p2Houses.add(rh);
        }
      }

      // If house i is among p1Houses, the direction is from p1's houses (source: i) to p2's houses (target: targetH)
      if (p1Houses.has(i)) {
        for (const targetH of p2Houses) {
          const p1Ru = getPlanetRuName(p1Id);
          const p2Ru = getPlanetRuName(p2Id);
          const detailText = `${asp.aspectNameRu.toLowerCase()}: ${p1Ru} ↔ ${p2Ru}`;

          const conn: HouseAnalysisConnection = {
            sourceHouse: i,
            targetHouse: targetH,
            type: 'planet_aspect',
            planet: p1Id,
            secondaryPlanet: p2Id,
            aspectName: asp.aspectNameRu,
            detailText
          };

          const isDup = connections.some(c =>
            c.type === 'planet_aspect' &&
            c.sourceHouse === conn.sourceHouse &&
            c.targetHouse === conn.targetHouse &&
            c.planet === conn.planet &&
            c.secondaryPlanet === conn.secondaryPlanet &&
            c.aspectName === conn.aspectName
          );

          if (!isDup) {
            connections.push(conn);
          }

          const isGlobalDup = allConnections.some(c =>
            c.type === 'planet_aspect' &&
            c.sourceHouse === conn.sourceHouse &&
            c.targetHouse === conn.targetHouse &&
            c.planet === conn.planet &&
            c.secondaryPlanet === conn.secondaryPlanet &&
            c.aspectName === conn.aspectName
          );

          if (!isGlobalDup) {
            allConnections.push(conn);
          }
        }
      }

      // If house i is among p2Houses, the direction is from p2's houses (source: i) to p1's houses (target: targetH)
      // Note: Only add this if p1Houses does not already contain i (to prevent double application when p1 and p2 share a house in common)
      if (p2Houses.has(i) && !p1Houses.has(i)) {
        for (const targetH of p1Houses) {
          const p1Ru = getPlanetRuName(p1Id);
          const p2Ru = getPlanetRuName(p2Id);
          const detailText = `${asp.aspectNameRu.toLowerCase()}: ${p2Ru} ↔ ${p1Ru}`;

          const conn: HouseAnalysisConnection = {
            sourceHouse: i,
            targetHouse: targetH,
            type: 'planet_aspect',
            planet: p2Id,
            secondaryPlanet: p1Id,
            aspectName: asp.aspectNameRu,
            detailText
          };

          const isDup = connections.some(c =>
            c.type === 'planet_aspect' &&
            c.sourceHouse === conn.sourceHouse &&
            c.targetHouse === conn.targetHouse &&
            c.planet === conn.planet &&
            c.secondaryPlanet === conn.secondaryPlanet &&
            c.aspectName === conn.aspectName
          );

          if (!isDup) {
            connections.push(conn);
          }

          const isGlobalDup = allConnections.some(c =>
            c.type === 'planet_aspect' &&
            c.sourceHouse === conn.sourceHouse &&
            c.targetHouse === conn.targetHouse &&
            c.planet === conn.planet &&
            c.secondaryPlanet === conn.secondaryPlanet &&
            c.aspectName === conn.aspectName
          );

          if (!isGlobalDup) {
            allConnections.push(conn);
          }
        }
      }
    }

    // 3. По аспектам к куспидам / углам карты (By aspects to cusps / angles)
    for (const asp of aspects) {
      const p1Id = asp.source.id;
      const p2Id = asp.target.id;

      const isP1Angle = ['ascendant', 'descendant', 'mc', 'ic'].includes(p1Id) || p1Id.startsWith('cusp');
      const isP2Angle = ['ascendant', 'descendant', 'mc', 'ic'].includes(p2Id) || p2Id.startsWith('cusp');

      if (isP1Angle || isP2Angle) {
        // Determine which house the angle/cusp belongs to
        let targetAngleHouse = i;
        let planetId = '';
        let angleName = '';

        if (isP1Angle && !isP2Angle) {
          planetId = p2Id;
          angleName = asp.source.name;
          targetAngleHouse = getHouseForPoint(asp.source.longitude, p1Id);
        } else if (!isP1Angle && isP2Angle) {
          planetId = p1Id;
          angleName = asp.target.name;
          targetAngleHouse = getHouseForPoint(asp.target.longitude, p2Id);
        }

        if (targetAngleHouse === i && planetId) {
          const planetRu = getPlanetRuName(planetId);
          const planetObj = positions.find(p => p.id === planetId);
          const planetHouse = planetObj ? planetObj.house : i;
          
          const detailText = `${asp.aspectNameRu.toLowerCase()}: ${planetRu} ↔ ${angleName}`;
          const conn: HouseAnalysisConnection = {
            sourceHouse: i,
            targetHouse: planetHouse,
            type: 'cusp_aspect',
            planet: planetId,
            secondaryPlanet: angleName,
            aspectName: asp.aspectNameRu,
            detailText
          };

          const isDup = connections.some(c =>
            c.type === 'cusp_aspect' &&
            c.sourceHouse === conn.sourceHouse &&
            c.targetHouse === conn.targetHouse &&
            c.planet === conn.planet &&
            c.aspectName === conn.aspectName
          );

          if (!isDup) {
            connections.push(conn);
            allConnections.push(conn);
          }
        }
      }
    }

    houses.push({
      houseNumber: i,
      name: `${i} дом`,
      cuspSign,
      ruler,
      modernCoRuler,
      rulerHouse,
      planetsInHouse,
      anglesInHouse,
      connections
    });
  }

  return {
    houses,
    connections: allConnections
  };
}

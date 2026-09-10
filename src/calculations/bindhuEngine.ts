import { EnrichedChartResult, EnrichedPlanetPosition } from './planetLayer';
import { AspectResult, calculateAspects } from './aspectEngine';
import { 
  ZODIAC_SIGNS, 
  BindhuMatrix, 
  BindhuSignRow, 
  BindhuCoordinateCell, 
  BindhuObjectItem, 
  BindhuAspectRelation 
} from './bindhuTypes';
import { ZodiacSignName } from './rulerships';

/**
 * Converts absolute longitude (0 - 360) into sign and integer degree (0 to <30).
 * Handles boundary conditions precisely (e.g. 360 -> Aries 0°, 30° -> Taurus 0°).
 */
export function longitudeToSignAndDegree(longitude: number): { sign: ZodiacSignName; degree: number } {
  // Normalize longitude to [0, 360)
  let normLon = longitude % 360;
  if (normLon < 0) normLon += 360;

  const signIndex = Math.floor(normLon / 30);
  const sign = ZODIAC_SIGNS[signIndex % 12];
  
  // Degree within the sign (integer part 0 to 29)
  const remainderInSign = normLon % 30;
  let degree = Math.floor(remainderInSign);
  
  // Guard against floating point rounding issues where degree hits exactly 30
  if (degree >= 30) {
    degree = 29;
  }

  return { sign, degree };
}

/**
 * Transforms an EnrichedChartResult and optional pre-calculated aspects into the structured 12 x 30 Bindhu Matrix.
 * Strictly deterministic, immutable, and performs no astronomical calculations.
 */
export function createBindhuMatrix(
  chart: EnrichedChartResult, 
  aspectsOverride?: AspectResult[]
): BindhuMatrix {
  if (!chart || !Array.isArray(chart.positions)) {
    throw new Error('BindhuEngine: Invalid or empty EnrichedChartResult provided.');
  }

  // Use existing Aspect Engine if aspects not explicitly passed
  const aspectsList = aspectsOverride || calculateAspects(chart.positions);

  // Initialize 12 signs with 30 coordinate cells each (360 total positions)
  const signsMap = {} as Record<ZodiacSignName, BindhuSignRow>;

  ZODIAC_SIGNS.forEach((signName, signIdx) => {
    const cells: BindhuCoordinateCell[] = [];
    for (let deg = 0; deg < 30; deg++) {
      const absStart = signIdx * 30 + deg;
      cells.push({
        sign: signName,
        degree: deg,
        absoluteLongitudeStart: absStart,
        absoluteLongitudeEnd: absStart + 1,
        objects: [],
        aspects: []
      });
    }
    signsMap[signName] = {
      sign: signName,
      signIndex: signIdx,
      cells
    };
  });

  // Map all objects without mutating original chart positions
  const allObjects: BindhuObjectItem[] = chart.positions.map((p: EnrichedPlanetPosition) => {
    const { sign, degree } = longitudeToSignAndDegree(p.longitude);
    return {
      id: p.id,
      name: p.name,
      longitude: p.longitude,
      sign,
      degree,
      source: 'planet_position'
    };
  });

  // Place objects into their respective coordinate cell
  allObjects.forEach(obj => {
    const signRow = signsMap[obj.sign];
    if (signRow && signRow.cells[obj.degree]) {
      signRow.cells[obj.degree].objects.push(obj);
    }
  });

  // Map AspectResults into structured Bindhu aspect relations
  const allAspects: BindhuAspectRelation[] = aspectsList.map(a => ({
    source: {
      id: a.source.id,
      name: a.source.name,
      longitude: a.source.longitude
    },
    target: {
      id: a.target.id,
      name: a.target.name,
      longitude: a.target.longitude
    },
    aspectType: a.aspectType,
    exactAngle: a.exactAngle,
    orb: a.orb
  }));

  // Attach aspects to the coordinate cells of the source object to prevent duplicates
  allAspects.forEach(aspect => {
    const sourcePos = longitudeToSignAndDegree(aspect.source.longitude);
    const signRow = signsMap[sourcePos.sign];
    if (signRow && signRow.cells[sourcePos.degree]) {
      // Avoid duplicate aspect insertion in the same cell
      const existing = signRow.cells[sourcePos.degree].aspects.some(
        asp => asp.source.id === aspect.source.id && asp.target.id === aspect.target.id && asp.aspectType === aspect.aspectType
      );
      if (!existing) {
        signRow.cells[sourcePos.degree].aspects.push(aspect);
      }
    }
  });

  return {
    timestamp: new Date().toISOString(),
    totalSigns: 12,
    totalDegrees: 360,
    signs: signsMap,
    allObjects,
    allAspects
  };
}

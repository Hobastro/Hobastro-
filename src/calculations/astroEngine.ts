import { BirthData } from '../types';
import { execSync } from 'child_process';
import path from 'path';

export interface AstroPosition {
  id: string;
  name: string;
  longitude: number;
  speed: number;
  sign: string;
  degree: number;
  retrograde: boolean;
}

export interface HouseCusp {
  id: string;
  name: string;
  number: number;
  longitude: number;
  sign: string;
  degree: number;
}

export interface ChartAngle {
  longitude: number;
  sign: string;
  degree: number;
}

export interface HouseSystemData {
  system: string;
  angles: {
    ascendant: ChartAngle;
    mc: ChartAngle;
    ic: ChartAngle;
    descendant: ChartAngle;
  };
  cusps: HouseCusp[];
}

export interface AstroCalculationResult {
  utc: string;
  julianDay: number;
  positions: AstroPosition[];
  houses: HouseSystemData;
}

export type HouseSystemType = 'Placidus' | 'Koch' | 'KochShestopalov' | 'Equal' | 'Regiomontanus' | 'WholeSign';

export function parseTimezoneToOffset(tzStr: string): number | null {
  if (!tzStr || tzStr === 'Автоматически') return null;
  const normalized = tzStr.replace('−', '-');
  const match = normalized.match(/UT\/GMT\s*([+\-\d]+)/i);
  if (!match) return 0;
  const hours = parseFloat(match[1]);
  if (isNaN(hours)) return 0;
  return Math.round(hours * 60);
}

export interface HouseSystemContext {
  selectedHouseSystem: HouseSystemType;
  methodHouseSystem: HouseSystemType;
}

export function calculatePositions(birthData: BirthData, houseSystemOverride?: HouseSystemType): AstroCalculationResult {
  const scriptPath = path.resolve('src/calculations/swisseph_calc.py');
  const system = houseSystemOverride || (birthData.houseSystem as HouseSystemType) || 'Placidus';

  const manual = birthData.manualOverride;
  let lat = birthData.birthCity.lat;
  let lon = birthData.birthCity.lon;
  let timezone = birthData.birthCity.timezone;
  let timezoneOffsetMinutes: number | null = null;
  let dstMode = 'auto';

  if (manual && manual.enabled) {
    if (manual.lat !== undefined) {
      lat = manual.latDir === 'S' ? -Math.abs(manual.lat) : Math.abs(manual.lat);
    }
    if (manual.lon !== undefined) {
      lon = manual.lonDir === 'W' ? -Math.abs(manual.lon) : Math.abs(manual.lon);
    }
    if (manual.timezone && manual.timezone !== 'Автоматически') {
      timezoneOffsetMinutes = parseTimezoneToOffset(manual.timezone);
      timezone = 'UTC';
    }
    if (manual.dst) {
      dstMode = manual.dst;
    }
  }

  const payload = JSON.stringify({
    date: birthData.date,
    time: birthData.time,
    timezone: timezone,
    timezoneOffsetMinutes: timezoneOffsetMinutes,
    dstMode: dstMode,
    lat: lat,
    lon: lon,
    houseSystem: system
  });

  try {
    const result = execSync(`python3 "${scriptPath}"`, {
      input: payload,
      encoding: 'utf-8'
    });
    return JSON.parse(result);
  } catch (error) {
    console.error('Failed to calculate via swisseph python script:', error);
    throw error;
  }
}

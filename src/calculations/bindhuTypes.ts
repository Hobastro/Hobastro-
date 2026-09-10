import { ZodiacSignName, PlanetId } from './rulerships';
import { AspectType } from './aspectEngine';

/**
 * Standard ordered list of 12 zodiac signs in astrological order.
 */
export const ZODIAC_SIGNS: ZodiacSignName[] = [
  'Овен',
  'Телец',
  'Близнецы',
  'Рак',
  'Лев',
  'Дева',
  'Весы',
  'Скорпион',
  'Стрелец',
  'Козерог',
  'Водолей',
  'Рыбы',
];

/**
 * Object or point located in a coordinate cell.
 */
export interface BindhuObjectItem {
  id: PlanetId | string;
  name: string;
  longitude: number;
  sign: ZodiacSignName;
  degree: number; // 0 to <30 within the sign
  source: string; // origin reference e.g. 'planet_position'
}

/**
 * Aspect relation reference within Bindhu layer.
 */
export interface BindhuAspectRelation {
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
  exactAngle: number;
  orb: number;
}

/**
 * A single coordinate cell within a sign (degree from 0 to 29).
 */
export interface BindhuCoordinateCell {
  sign: ZodiacSignName;
  degree: number; // integer degree 0-29
  absoluteLongitudeStart: number;
  absoluteLongitudeEnd: number;
  objects: BindhuObjectItem[];
  aspects: BindhuAspectRelation[];
}

/**
 * Structure of a single zodiac sign containing 30 degree coordinate positions.
 */
export interface BindhuSignRow {
  sign: ZodiacSignName;
  signIndex: number; // 0 for Aries, 11 for Pisces
  cells: BindhuCoordinateCell[]; // Exactly 30 cells (degrees 0-29)
}

/**
 * Complete Bindhu Matrix structure representing 12 signs x 30 degrees = 360 coordinate positions.
 */
export interface BindhuMatrix {
  timestamp: string;
  totalSigns: number;
  totalDegrees: number; // 360
  signs: Record<ZodiacSignName, BindhuSignRow>;
  allObjects: BindhuObjectItem[];
  allAspects: BindhuAspectRelation[];
}

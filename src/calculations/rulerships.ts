export type ZodiacSignName = 
  | 'Овен' 
  | 'Телец' 
  | 'Близнецы' 
  | 'Рак' 
  | 'Лев' 
  | 'Дева' 
  | 'Весы' 
  | 'Скорпион' 
  | 'Стрелец' 
  | 'Козерог' 
  | 'Водолей' 
  | 'Рыбы';

export type PlanetId = 
  | 'sun' 
  | 'moon' 
  | 'mercury' 
  | 'venus' 
  | 'mars' 
  | 'jupiter' 
  | 'saturn' 
  | 'uranus' 
  | 'neptune' 
  | 'pluto' 
  | 'north_node' 
  | 'south_node' 
  | 'lilith';

export interface SignRulership {
  sign: ZodiacSignName;
  ruler: PlanetId;
}

export const TRADITIONAL_RULERSHIPS: Record<ZodiacSignName, PlanetId> = {
  'Овен': 'mars',
  'Телец': 'venus',
  'Близнецы': 'mercury',
  'Рак': 'moon',
  'Лев': 'sun',
  'Дева': 'mercury',
  'Весы': 'venus',
  'Скорпион': 'mars',
  'Стрелец': 'jupiter',
  'Козерог': 'saturn',
  'Водолей': 'saturn',
  'Рыбы': 'jupiter',
};

export interface EssentialDignities {
  domicile: ZodiacSignName[];
  detriment: ZodiacSignName[];
  exaltation: ZodiacSignName | null;
  fall: ZodiacSignName | null;
}

export const ESSENTIAL_DIGNITIES_MAP: Record<PlanetId, EssentialDignities> = {
  'sun': {
    domicile: ['Лев'],
    detriment: ['Водолей'],
    exaltation: 'Овен',
    fall: 'Весы',
  },
  'moon': {
    domicile: ['Рак'],
    detriment: ['Козерог'],
    exaltation: 'Телец',
    fall: 'Скорпион',
  },
  'mercury': {
    domicile: ['Близнецы', 'Дева'],
    detriment: ['Стрелец', 'Рыбы'],
    exaltation: 'Дева', // or Aquarius in some traditions, but Virgo is standard for traditional domicile/exaltation combination
    fall: 'Рыбы',
  },
  'venus': {
    domicile: ['Телец', 'Весы'],
    detriment: ['Скорпион', 'Овен'],
    exaltation: 'Рыбы',
    fall: 'Дева',
  },
  'mars': {
    domicile: ['Овен', 'Скорпион'],
    detriment: ['Весы', 'Телец'],
    exaltation: 'Козерог',
    fall: 'Рак',
  },
  'jupiter': {
    domicile: ['Стрелец', 'Рыбы'],
    detriment: ['Близнецы', 'Дева'],
    exaltation: 'Рак',
    fall: 'Козерог',
  },
  'saturn': {
    domicile: ['Козерог', 'Водолей'],
    detriment: ['Рак', 'Лев'],
    exaltation: 'Весы',
    fall: 'Овен',
  },
  'uranus': { domicile: [], detriment: [], exaltation: null, fall: null },
  'neptune': { domicile: [], detriment: [], exaltation: null, fall: null },
  'pluto': { domicile: [], detriment: [], exaltation: null, fall: null },
  'north_node': { domicile: [], detriment: [], exaltation: null, fall: null },
  'south_node': { domicile: [], detriment: [], exaltation: null, fall: null },
  'lilith': { domicile: [], detriment: [], exaltation: null, fall: null },
};

export function getSignRuler(sign: ZodiacSignName): PlanetId {
  const ruler = TRADITIONAL_RULERSHIPS[sign];
  if (!ruler) {
    throw new Error(`Unknown zodiac sign: ${sign}`);
  }
  return ruler;
}

export function getPlanetSignsRuled(planetId: PlanetId): ZodiacSignName[] {
  return (Object.keys(TRADITIONAL_RULERSHIPS) as ZodiacSignName[]).filter(
    sign => TRADITIONAL_RULERSHIPS[sign] === planetId
  );
}

export function getPlanetDignities(planetId: PlanetId): EssentialDignities {
  return ESSENTIAL_DIGNITIES_MAP[planetId] || { domicile: [], detriment: [], exaltation: null, fall: null };
}

import { TRADITIONAL_RULERSHIPS, ZodiacSignName, PlanetId, getSignRuler, getPlanetSignsRuled, getPlanetDignities } from './rulerships';

console.log('--- RUNNING RULERSHIPS TESTS ---');

// 1. TRADITIONAL_RULERSHIPS contains exactly 12 signs.
const signs = Object.keys(TRADITIONAL_RULERSHIPS) as ZodiacSignName[];
if (signs.length === 12) {
  console.log('✓ TRADITIONAL_RULERSHIPS contains exactly 12 signs passed.');
} else {
  throw new Error(`Expected 12 signs, got ${signs.length}`);
}

// 2. None of Uranus/Neptune/Pluto are traditional rulers.
const rulers = Object.values(TRADITIONAL_RULERSHIPS);
if (!rulers.includes('uranus') && !rulers.includes('neptune') && !rulers.includes('pluto')) {
  console.log('✓ Modern planets are not traditional rulers passed.');
} else {
  throw new Error('Modern planets found in TRADITIONAL_RULERSHIPS');
}

// 3-7. Specific sign rulers
if (getSignRuler('Телец') === 'venus') {
  console.log('✓ getSignRuler("Телец") === "venus" passed.');
} else {
  throw new Error(`Expected venus for Телец, got ${getSignRuler('Телец')}`);
}

if (getSignRuler('Весы') === 'venus') {
  console.log('✓ getSignRuler("Весы") === "venus" passed.');
} else {
  throw new Error(`Expected venus for Весы, got ${getSignRuler('Весы')}`);
}

if (getSignRuler('Скорпион') === 'mars') {
  console.log('✓ getSignRuler("Скорпион") === "mars" passed.');
} else {
  throw new Error(`Expected mars for Скорпион, got ${getSignRuler('Скорпион')}`);
}

if (getSignRuler('Водолей') === 'saturn') {
  console.log('✓ getSignRuler("Водолей") === "saturn" passed.');
} else {
  throw new Error(`Expected saturn for Водолей, got ${getSignRuler('Водолей')}`);
}

if (getSignRuler('Рыбы') === 'jupiter') {
  console.log('✓ getSignRuler("Рыбы") === "jupiter" passed.');
} else {
  throw new Error(`Expected jupiter for Рыбы, got ${getSignRuler('Рыбы')}`);
}

// 8-10. getPlanetSignsRuled
const vSigns = getPlanetSignsRuled('venus');
if (vSigns.length === 2 && vSigns.includes('Телец') && vSigns.includes('Весы')) {
  console.log('✓ getPlanetSignsRuled("venus") returns ["Телец", "Весы"] passed.');
} else {
  throw new Error(`Expected ["Телец", "Весы"], got ${JSON.stringify(vSigns)}`);
}

const mSigns = getPlanetSignsRuled('mars');
if (mSigns.length === 2 && mSigns.includes('Овен') && mSigns.includes('Скорпион')) {
  console.log('✓ getPlanetSignsRuled("mars") returns ["Овен", "Скорпион"] passed.');
} else {
  throw new Error(`Expected ["Овен", "Скорпион"], got ${JSON.stringify(mSigns)}`);
}

const sSigns = getPlanetSignsRuled('saturn');
if (sSigns.length === 2 && sSigns.includes('Козерог') && sSigns.includes('Водолей')) {
  console.log('✓ getPlanetSignsRuled("saturn") returns ["Козерог", "Водолей"] passed.');
} else {
  throw new Error(`Expected ["Козерог", "Водолей"], got ${JSON.stringify(sSigns)}`);
}

// 11. Essential dignities for 7 classical planets
const sunDig = getPlanetDignities('sun');
if (sunDig.domicile.includes('Лев') && sunDig.detriment.includes('Водолей') && sunDig.exaltation === 'Овен' && sunDig.fall === 'Весы') {
  console.log('✓ Sun dignities passed.');
} else {
  throw new Error(`Sun dignities mismatch: ${JSON.stringify(sunDig)}`);
}

const moonDig = getPlanetDignities('moon');
if (moonDig.domicile.includes('Рак') && moonDig.detriment.includes('Козерог') && moonDig.exaltation === 'Телец' && moonDig.fall === 'Скорпион') {
  console.log('✓ Moon dignities passed.');
} else {
  throw new Error(`Moon dignities mismatch: ${JSON.stringify(moonDig)}`);
}

const mercDig = getPlanetDignities('mercury');
if (mercDig.domicile.length === 2 && mercDig.domicile.includes('Близнецы') && mercDig.domicile.includes('Дева') && mercDig.detriment.includes('Стрелец') && mercDig.detriment.includes('Рыбы') && mercDig.exaltation === 'Дева' && mercDig.fall === 'Рыбы') {
  console.log('✓ Mercury dignities passed.');
} else {
  throw new Error(`Mercury dignities mismatch: ${JSON.stringify(mercDig)}`);
}

const venDig = getPlanetDignities('venus');
if (venDig.domicile.length === 2 && venDig.domicile.includes('Телец') && venDig.domicile.includes('Весы') && venDig.detriment.includes('Скорпион') && venDig.detriment.includes('Овен') && venDig.exaltation === 'Рыбы' && venDig.fall === 'Дева') {
  console.log('✓ Venus dignities passed.');
} else {
  throw new Error(`Venus dignities mismatch: ${JSON.stringify(venDig)}`);
}

const marsDig = getPlanetDignities('mars');
if (marsDig.domicile.length === 2 && marsDig.domicile.includes('Овен') && marsDig.domicile.includes('Скорпион') && marsDig.detriment.includes('Весы') && marsDig.detriment.includes('Телец') && marsDig.exaltation === 'Козерог' && marsDig.fall === 'Рак') {
  console.log('✓ Mars dignities passed.');
} else {
  throw new Error(`Mars dignities mismatch: ${JSON.stringify(marsDig)}`);
}

const jupDig = getPlanetDignities('jupiter');
if (jupDig.domicile.length === 2 && jupDig.domicile.includes('Стрелец') && jupDig.domicile.includes('Рыбы') && jupDig.detriment.includes('Близнецы') && jupDig.detriment.includes('Дева') && jupDig.exaltation === 'Рак' && jupDig.fall === 'Козерог') {
  console.log('✓ Jupiter dignities passed.');
} else {
  throw new Error(`Jupiter dignities mismatch: ${JSON.stringify(jupDig)}`);
}

const satDig = getPlanetDignities('saturn');
if (satDig.domicile.length === 2 && satDig.domicile.includes('Козерог') && satDig.domicile.includes('Водолей') && satDig.detriment.includes('Рак') && satDig.detriment.includes('Лев') && satDig.exaltation === 'Весы' && satDig.fall === 'Овен') {
  console.log('✓ Saturn dignities passed.');
} else {
  throw new Error(`Saturn dignities mismatch: ${JSON.stringify(satDig)}`);
}

// 12. Modern planets and additional objects do not get classical dignities
const nonClassical: PlanetId[] = ['uranus', 'neptune', 'pluto', 'north_node', 'south_node', 'lilith'];
for (const p of nonClassical) {
  const dig = getPlanetDignities(p);
  if (dig.domicile.length !== 0 || dig.detriment.length !== 0 || dig.exaltation !== null || dig.fall !== null) {
    throw new Error(`Planet ${p} should not have dignities, got ${JSON.stringify(dig)}`);
  }
}
console.log('✓ Non-classical planets/objects have no dignities passed.');

console.log('ALL RULERSHIPS TESTS PASSED SUCCESSFULLY.');

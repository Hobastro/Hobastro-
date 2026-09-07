import { calculatePositions } from './astroEngine';
import * as Astronomy from 'astronomy-engine';
import { City, BirthData } from '../types';

const testCity: City = {
    id: 'test',
    name: 'Test City',
    names: { ru: 'Тест', en: 'Test' },
    country: 'Test Country',
    region: 'Test Region',
    lat: 0,
    lon: 0,
    timezone: 'UTC',
};

const testData: BirthData = {
    name: 'Test User',
    date: '2026-09-07',
    time: '12:00',
    birthCity: testCity,
    residenceCity: testCity,
    solarCity: testCity,
};

console.log('Astronomy:', Object.keys(Astronomy));
// const jd = Astronomy.JulianDay(Astronomy.MakeTime(new Date('2026-09-07T12:00:00Z')));
// console.log('Julian Day:', jd);

const results = calculatePositions(testData);
console.log('Results:', results);

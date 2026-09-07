import { City } from '../types';

export const cities: City[] = [
  { id: '1', name: 'Bila Tserkva', names: { ru: 'Белая Церковь', en: 'Bila Tserkva' }, country: 'Ukraine', region: 'UA', lat: 49.81, lon: 30.11, timezone: 'Europe/Kiev' },
  { id: '2', name: 'Moscow', names: { ru: 'Москва', en: 'Moscow' }, country: 'Russia', region: 'RU', lat: 55.75, lon: 37.61, timezone: 'Europe/Moscow' },
  { id: '3', name: 'Munster', names: { ru: 'Мюнстер', en: 'Munster' }, country: 'Germany', region: 'NW', lat: 51.96, lon: 7.63, timezone: 'Europe/Berlin' },
  { id: '4', name: 'Rheems', names: { ru: 'Римс', en: 'Rheems' }, country: 'USA', region: 'PA', lat: 40.11, lon: -76.54, timezone: 'America/New_York' },
];

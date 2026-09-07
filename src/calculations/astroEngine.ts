import * as Astronomy from 'astronomy-engine';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BirthData, AstroResult } from '../types';

dayjs.extend(utc);
dayjs.extend(timezone);

const planetMap = [
    { id: 'sun', name: 'Солнце', body: Astronomy.Body.Sun },
    { id: 'moon', name: 'Луна', body: Astronomy.Body.Moon },
    { id: 'mercury', name: 'Меркурий', body: Astronomy.Body.Mercury },
    { id: 'venus', name: 'Венера', body: Astronomy.Body.Venus },
    { id: 'mars', name: 'Марс', body: Astronomy.Body.Mars },
    { id: 'jupiter', name: 'Юпитер', body: Astronomy.Body.Jupiter },
    { id: 'saturn', name: 'Сатурн', body: Astronomy.Body.Saturn },
    { id: 'uranus', name: 'Уран', body: Astronomy.Body.Uranus },
    { id: 'neptune', name: 'Нептун', body: Astronomy.Body.Neptune },
    { id: 'pluto', name: 'Плутон', body: Astronomy.Body.Pluto },
];

export function calculatePositions(birthData: BirthData): AstroResult[] {
    const localTime = dayjs.tz(`${birthData.date} ${birthData.time}`, 'YYYY-MM-DD HH:mm', birthData.birthCity.timezone);
    const date = localTime.toDate();
    const time = new Astronomy.AstroTime(date);
    console.log('Time:', time);

    return planetMap.map(planet => {
        const pos = Astronomy.Ecliptic(planet.body, time);
        const vel = Astronomy.EclipticVelocity(planet.body, time);
        
        return {
            id: planet.id,
            name: planet.name,
            longitude: pos.elon,
            latitude: pos.elat,
            distance: pos.edist,
            speedLongitude: vel.elon,
            isRetrograde: vel.elon < 0,
        };
    });
}

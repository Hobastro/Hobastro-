import React from 'react';
import { EnrichedChartResult, EnrichedPlanetPosition } from '../calculations/planetLayer';

interface CelestialTableProps {
  chart: EnrichedChartResult;
}

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  north_node: '☊',
  south_node: '☋',
  lilith: '⚸',
};

const formatDegree = (deg: number): string => {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = Math.floor(((((deg - d) * 60) - m) * 60));
  return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
};

const getObjectHouse = (longitude: number, cusps: EnrichedChartResult['houses']['cusps']): number => {
  const normLon = (longitude % 360 + 360) % 360;
  
  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];
    
    let start = currentCusp.longitude;
    let end = nextCusp.longitude;
    
    if (end < start) {
      if (normLon >= start || normLon < end) {
        return i + 1;
      }
    } else {
      if (normLon >= start && normLon < end) {
        return i + 1;
      }
    }
  }
  return 1;
};

export const CelestialTable: React.FC<CelestialTableProps> = ({ chart }) => {
  const requiredIds = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'north_node',
    'south_node',
    'lilith'
  ];

  const objectMap = new Map<string, EnrichedPlanetPosition>(chart.positions.map(p => [p.id, p]));

  const rows = requiredIds.map(id => {
    let pos = objectMap.get(id);
    if (!pos && id === 'south_node') {
      const nn = objectMap.get('north_node');
      if (nn) {
        const southLon = (nn.longitude + 180) % 360;
        const signs = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'] as const;
        const signIdx = Math.floor(southLon / 30) % 12;
        const deg = southLon % 30;
        pos = {
          id: 'south_node',
          name: 'Южный узел',
          longitude: southLon,
          speed: -nn.speed,
          sign: signs[signIdx],
          degree: deg,
          retrograde: nn.retrograde,
          ruler: 'venus' as any,
          rulesSigns: [],
          dignities: { isDomicile: false, isDetriment: false, isExalted: false, isFallen: false }
        };
      }
    }

    if (!pos) return null;

    const house = getObjectHouse(pos.longitude, chart.houses.cusps);
    const glyph = PLANET_SYMBOLS[pos.id] || '•';

    return {
      ...pos,
      glyph,
      house,
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div style={{ marginTop: '24px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#003366', marginBottom: '8px', borderBottom: '2px solid #ff9900', paddingBottom: '4px' }}>
        Планеты и управления
      </h2>
      <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#333333', marginBottom: '8px' }}>
        Небесные тела и расчётные точки
      </h3>

      <div style={{ overflowX: 'auto', border: '1px solid #d9d9d9', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#003366', color: '#fff' }}>
              <th style={{ padding: '6px 8px', borderBottom: '1px solid #d9d9d9' }}>Объект</th>
              <th style={{ padding: '6px 8px', borderBottom: '1px solid #d9d9d9' }}>Знак</th>
              <th style={{ padding: '6px 8px', borderBottom: '1px solid #d9d9d9' }}>Градус</th>
              <th style={{ padding: '6px 8px', borderBottom: '1px solid #d9d9d9' }}>Дом</th>
              <th style={{ padding: '6px 8px', borderBottom: '1px solid #d9d9d9' }}>Скорость</th>
              <th style={{ padding: '6px 8px', borderBottom: '1px solid #d9d9d9' }}>Ретро</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} style={{ background: index % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '6px 8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', width: '16px', textAlign: 'center', color: '#003366' }}>{row.glyph}</span>
                  <span>{row.name}</span>
                </td>
                <td style={{ padding: '6px 8px' }}>{row.sign}</td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{formatDegree(row.degree)}</td>
                <td style={{ padding: '6px 8px', fontWeight: 'bold', color: '#003366' }}>{row.house} дом</td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: row.speed < 0 ? '#ff4d4f' : 'inherit' }}>
                  {row.speed > 0 ? `+${row.speed.toFixed(2)}` : row.speed.toFixed(2)}°/д
                </td>
                <td style={{ padding: '6px 8px', fontWeight: row.retrograde ? 'bold' : 'normal', color: row.retrograde ? '#ff4d4f' : '#52c41a' }}>
                  {row.retrograde ? 'R' : 'Прямой'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

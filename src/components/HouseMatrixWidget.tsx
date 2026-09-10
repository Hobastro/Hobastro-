import React from 'react';
import { HouseMatrixResult } from '../calculations/houseMatrixEngine';
import { EnrichedPlanetPosition } from '../calculations/planetLayer';

interface HouseMatrixWidgetProps {
  matrix: HouseMatrixResult;
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
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

const ZODIAC_SYMBOLS: Record<string, string> = {
  'Овен': '♈',
  'Телец': '♉',
  'Близнецы': '♊',
  'Рак': '♋',
  'Лев': '♌',
  'Дева': '♍',
  'Весы': '♎',
  'Скорпион': '♏',
  'Стрелец': '♐',
  'Козерог': '♑',
  'Водолей': '♒',
  'Рыбы': '♓',
};

const formatDegree = (deg: number): string => {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
};

export const HouseMatrixWidget: React.FC<HouseMatrixWidgetProps> = ({ matrix, selectedObjectId, onSelectObject }) => {
  if (!matrix || !matrix.houses) {
    return <div style={{ padding: 16 }}>Нет данных Матрицы домов</div>;
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '12px', borderBottom: '2px solid #ff9900', paddingBottom: '6px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#003366', margin: 0 }}>
          Матрица домов
        </h2>
        <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginTop: '2px' }}>
          (Связи домов и расчётная основа)
        </div>
      </div>

      <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#f0f5ff', border: '1px solid #91caff', fontSize: '12px', color: '#003366' }}>
        <strong>Принцип:</strong> Расчётная модель базируется на традиционных управителях знаков куспидов домов, планетах внутри домов и включённых знаках (соуправителях). Символические управители (Alphabet System) исключены из расчётов. 
        Система домов: <strong>{matrix.houseSystem}</strong>.
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #d9d9d9', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: '#003366', color: '#fff' }}>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '70px', textAlign: 'center' }}>Дом</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '130px' }}>Куспид (Знак / Градус)</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '160px' }}>Управитель куспида</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9' }}>Планеты в доме</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '180px' }}>Включённые знаки / Соуправители</th>
            </tr>
          </thead>
          <tbody>
            {matrix.houses.map((house, index) => {
              const signSymbol = ZODIAC_SYMBOLS[house.cuspSign] || '';
              const rulerSymbol = PLANET_SYMBOLS[house.cuspRuler] || '';

              return (
                <tr key={house.number} style={{ background: index % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center', color: '#003366', background: index % 2 === 0 ? '#f0f4f8' : '#fff' }}>
                    {house.number} дом
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#003366' }}>{signSymbol}</span>
                      <span>{house.cuspSign}</span>
                      <span style={{ fontFamily: 'monospace', color: '#666', fontSize: '11px' }}>{formatDegree(house.cuspDegree)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#003366' }}>{rulerSymbol}</span>
                      <span style={{ fontWeight: '500' }}>{house.rulerNameRu}</span>
                      <span style={{ fontSize: '11px', color: '#666', background: '#e6f7ff', padding: '1px 4px', borderRadius: '3px' }}>
                        (в {house.rulerHouseNumber} доме)
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    {house.planetsInside.length === 0 ? (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>нет планет</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {house.planetsInside.map((planet: EnrichedPlanetPosition) => {
                          const pSymbol = PLANET_SYMBOLS[planet.id] || '•';
                          const isSelected = selectedObjectId === planet.id;
                          return (
                            <span
                              key={planet.id}
                              onClick={() => onSelectObject && onSelectObject(isSelected ? null : planet.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                background: isSelected ? '#ff9900' : '#e6f7ff',
                                color: isSelected ? '#000' : '#003366',
                                border: '1px solid #91caff',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}
                              title={`${planet.name} (${planet.sign} ${formatDegree(planet.degree)}) - Нажмите для выбора`}
                            >
                              <span>{pSymbol}</span>
                              <span>{planet.name}</span>
                              <span style={{ fontSize: '10px', color: isSelected ? '#333' : '#666' }}>({formatDegree(planet.degree)})</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {house.interceptedCoRulers.length === 0 ? (
                      <span style={{ color: '#bbb' }}>—</span>
                    ) : (
                      <div>
                        {house.interceptedCoRulers.map((coRulerObj, sIdx) => {
                          const coRulerSymbol = PLANET_SYMBOLS[coRulerObj.ruler] || '';
                          const sSymbol = ZODIAC_SYMBOLS[coRulerObj.sign] || '';
                          return (
                            <div key={coRulerObj.sign} style={{ fontSize: '11px', color: '#d46b08', marginBottom: sIdx < house.interceptedCoRulers.length - 1 ? '4px' : 0 }}>
                              <span style={{ fontWeight: 'bold' }}>{sSymbol} {coRulerObj.sign}</span>
                              <span style={{ color: '#666' }}> (соупр. {coRulerSymbol} {coRulerObj.rulerNameRu} в {coRulerObj.rulerHouseNumber} дом)</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fafafa', border: '1px solid #d9d9d9', fontSize: '11px', color: '#555' }}>
        <strong>Примечания к расчёту:</strong>
        <ul style={{ margin: '4px 0 0 16px', padding: 0, lineHeight: '1.4' }}>
          <li>Традиционные управители знаков: Овен/Скорпион (Марс), Телец/Весы (Венера), Близнецы/Дева (Меркурий), Рак (Луна), Лев (Солнце), Стрелец/Рыбы (Юпитер), Козерог/Водолей (Сатурн).</li>
          <li>Символические управители (Alphabet System 1→Марс ... 12→Сатурн) полностью исключены из расчётной логики.</li>
          <li>Включённые знаки определяют перехваченных соуправителей (`interceptedCoRulers`) с фиксацией дома их нахождения для будущих связей домов.</li>
          <li>Эвристика второго знака (&gt;1/3 дома) не используется.</li>
        </ul>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { EnrichedChartResult } from '../calculations/planetLayer';
import { BirthData } from '../types';
import { calculateHouseLength, formatDegreeSeconds } from '../calculations/houseSpan';
import { calculateHouseAnalysis, getPlanetRuName } from '../calculations/houseAnalysis';

interface HousesWidgetProps {
  chart: EnrichedChartResult;
  birthData: BirthData;
}

const formatDegree = (deg: number): string => {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
};

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const PLANET_NAMES_RU: Record<string, string> = {
  sun: 'Солнце',
  moon: 'Луна',
  mercury: 'Меркурий',
  venus: 'Венера',
  mars: 'Марс',
  jupiter: 'Юпитер',
  saturn: 'Сатурн',
  uranus: 'Уран',
  neptune: 'Нептун',
  pluto: 'Плутон',
  north_node: 'Северный узел',
  south_node: 'Южный узел',
  lilith: 'Лилит'
};

export const HousesWidget: React.FC<HousesWidgetProps> = ({ chart, birthData }) => {
  const [connectionsOpen, setConnectionsOpen] = useState(true);

  if (!chart || !chart.houses) {
    return <div style={{ padding: 16 }}>Нет данных о домах</div>;
  }

  const houseAnalysisResult = calculateHouseAnalysis(chart);
  const { houses } = chart;
  const angles = houses.angles;

  const houseSystemLabels: Record<string, string> = {
    Placidus: 'Плацидус',
    Koch: 'Кох',
    KochShestopalov: 'Шестопалов',
    Equal: 'Равнодомная от ASC',
    Regiomontanus: 'Региомонтан',
    WholeSign: 'Цельнознаковая (Whole Sign)'
  };

  const systemName = houseSystemLabels[houses.system] || houses.system;

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '12px', borderBottom: '2px solid #ff9900', paddingBottom: '6px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#003366', margin: 0 }}>
          Дома
        </h2>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '13px', color: '#333' }}>
        <strong>Система домов:</strong> {systemName}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#003366', margin: '0 0 6px 0' }}>
          Дома: ({systemName})
        </h3>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #d9d9d9', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#003366', color: '#fff' }}>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '80px', textAlign: 'center' }}>Дом</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '180px' }}>Знак и градус куспида</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '130px' }}>Протяжённость</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9' }}>Абсолютная долгота</th>
            </tr>
          </thead>
          <tbody>
            {houses.cusps.map((cusp, index) => {
              const isAngle = cusp.number === 1 || cusp.number === 10 || cusp.number === 4 || cusp.number === 7;
              let angleLabel = '';
              if (cusp.number === 1) angleLabel = ' (AC)';
              else if (cusp.number === 10) angleLabel = ' (MC)';
              else if (cusp.number === 4) angleLabel = ' (IC)';
              else if (cusp.number === 7) angleLabel = ' (DC)';

              const nextCusp = houses.cusps[(index + 1) % 12];
              const span = calculateHouseLength(cusp.longitude, nextCusp.longitude);

              return (
                <tr key={cusp.number} style={{ background: index % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', fontWeight: isAngle ? 'bold' : 'normal', textAlign: 'center', color: '#003366', background: index % 2 === 0 ? '#f0f4f8' : '#fff' }}>
                    {cusp.number} дом{angleLabel}
                  </td>
                  <td style={{ padding: '8px', fontWeight: isAngle ? 'bold' : 'normal' }}>
                    {cusp.sign} {formatDegree(cusp.degree)}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'monospace', color: '#333' }}>
                    {formatDegreeSeconds(span)}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'monospace', color: '#666' }}>
                    {cusp.longitude.toFixed(2)}°
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '32px' }}>
        <div style={{ marginBottom: '12px', borderBottom: '2px solid #ff9900', paddingBottom: '6px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#003366', margin: 0 }}>
            Анализ домов
          </h2>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #d9d9d9', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#003366', color: '#fff' }}>
                <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '70px', textAlign: 'center' }}>Дом</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '140px' }}>Знак на куспиде</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '120px' }}>Управитель</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '140px' }}>Где стоит управитель</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', width: '160px' }}>Планеты в доме</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #d9d9d9' }}>Связи дома</th>
              </tr>
            </thead>
            <tbody>
              {houseAnalysisResult.houses.map((houseItem, index) => {
                const romanHouse = ROMAN_NUMERALS[houseItem.houseNumber - 1] || String(houseItem.houseNumber);
                const rulerNameRu = PLANET_NAMES_RU[houseItem.ruler] || houseItem.ruler;
                const rulerHouseRoman = ROMAN_NUMERALS[houseItem.rulerHouse - 1] || String(houseItem.rulerHouse);
                const planetsStr = houseItem.planetsInHouse.length > 0
                  ? houseItem.planetsInHouse.map(p => p.name).join(', ')
                  : '—';

                return (
                  <tr key={houseItem.houseNumber} style={{ background: index % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center', color: '#003366', background: index % 2 === 0 ? '#f0f4f8' : '#fff' }}>
                      {romanHouse}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {houseItem.cuspSign}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {rulerNameRu}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {rulerHouseRoman} дом
                    </td>
                    <td style={{ padding: '8px' }}>
                      {planetsStr}
                    </td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>
                      {houseItem.connections.length > 0 ? (
                        houseItem.connections.map((conn, cIdx) => {
                          return (
                            <div key={cIdx} style={{ marginBottom: cIdx < houseItem.connections.length - 1 ? '4px' : '0' }}>
                              {conn.sourceHouse} → {conn.targetHouse} — {conn.detailText}
                            </div>
                          );
                        })
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <div 
          onClick={() => setConnectionsOpen(!connectionsOpen)}
          style={{ 
            marginBottom: '12px', 
            borderBottom: '2px solid #ff9900', 
            paddingBottom: '6px', 
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none'
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#003366', margin: 0 }}>
            Связи домов
          </h2>
          <span style={{ fontSize: '14px', color: '#003366', fontWeight: 'bold' }}>
            {connectionsOpen ? '▲' : '▼'}
          </span>
        </div>

        {connectionsOpen && (
          <div style={{ border: '1px solid #d9d9d9', background: '#fff', padding: '16px' }}>
            {houseAnalysisResult.houses.map((houseItem) => {
              const romanHouse = ROMAN_NUMERALS[houseItem.houseNumber - 1] || String(houseItem.houseNumber);
              
              // Filter connections by type for this house as requested
              const posConns = houseItem.connections.filter(c => c.type === 'ruler_position' || c.type === 'planet_position' || c.type === 'planet_rulership');
              const aspectConns = houseItem.connections.filter(c => c.type === 'planet_aspect');
              const cuspAspectConns = houseItem.connections.filter(c => c.type === 'cusp_aspect');

              // Elements list for header: rulers, planets, angles
              const elementNames: string[] = [];
              elementNames.push(getPlanetRuName(houseItem.ruler));
              if (houseItem.modernCoRuler) {
                elementNames.push(getPlanetRuName(houseItem.modernCoRuler));
              }
              for (const p of houseItem.planetsInHouse) {
                if (!elementNames.includes(getPlanetRuName(p.id))) {
                  elementNames.push(getPlanetRuName(p.id));
                }
              }
              for (const a of houseItem.anglesInHouse) {
                if (!elementNames.includes(a)) {
                  elementNames.push(a);
                }
              }

              return (
                <div key={houseItem.houseNumber} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#003366', marginBottom: '8px' }}>
                    🏛️ {houseItem.houseNumber} ДОМ ({houseItem.cuspSign})
                  </div>

                  <div style={{ marginLeft: '12px', fontSize: '13px', color: '#333' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#444' }}>1. Элементы дома</div>
                    <div style={{ marginLeft: '12px', marginBottom: '8px', color: '#555', fontSize: '12px' }}>
                      <div>- знак на куспиде: {houseItem.cuspSign}</div>
                      <div>- классический управитель: {getPlanetRuName(houseItem.ruler)}</div>
                      {houseItem.modernCoRuler && (
                        <div>- современный соправитель: {getPlanetRuName(houseItem.modernCoRuler)}</div>
                      )}
                      <div>- планеты в доме: {houseItem.planetsInHouse.length > 0 ? houseItem.planetsInHouse.map(p => getPlanetRuName(p.id)).join(', ') : 'нет'}</div>
                      <div>- угол/куспид: {houseItem.anglesInHouse.length > 0 ? houseItem.anglesInHouse.join(', ') : '—'}</div>
                    </div>

                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#444' }}>2. По положению</div>
                    <div style={{ marginLeft: '12px', marginBottom: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {posConns.length > 0 ? (
                        posConns.map((conn, idx) => (
                          <div key={idx} style={{ marginBottom: '2px' }}>
                            "{conn.sourceHouse} → {conn.targetHouse} — {conn.detailText}"
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#888' }}>—</div>
                      )}
                    </div>

                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#444' }}>3. По аспектам между планетами</div>
                    <div style={{ marginLeft: '12px', marginBottom: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {aspectConns.length > 0 ? (
                        aspectConns.map((conn, idx) => (
                          <div key={idx} style={{ marginBottom: '2px' }}>
                            "{conn.sourceHouse} → {conn.targetHouse} — {conn.detailText}"
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#888' }}>—</div>
                      )}
                    </div>

                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#444' }}>4. По аспектам к куспидам / углам карты</div>
                    <div style={{ marginLeft: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {cuspAspectConns.length > 0 ? (
                        cuspAspectConns.map((conn, idx) => (
                          <div key={idx} style={{ marginBottom: '2px' }}>
                            "{conn.sourceHouse} → {conn.targetHouse} — {conn.detailText}"
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#888' }}>—</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

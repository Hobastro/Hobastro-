import React, { useState } from 'react';
import { EnrichedChartResult, EnrichedPlanetPosition } from '../calculations/planetLayer';
import { AspectResult } from '../calculations/aspectEngine';

interface NatalWheelProps {
  chart: EnrichedChartResult;
  aspects: AspectResult[];
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
}

const ZODIAC_SIGNS = [
  { name: 'Овен', symbol: '♈', color: '#ff4d4f' },
  { name: 'Телец', symbol: '♉', color: '#52c41a' },
  { name: 'Близнецы', symbol: '♊', color: '#faad14' },
  { name: 'Рак', symbol: '♋', color: '#1890ff' },
  { name: 'Лев', symbol: '♌', color: '#f5222d' },
  { name: 'Дева', symbol: '♍', color: '#52c41a' },
  { name: 'Весы', symbol: '♎', color: '#faad14' },
  { name: 'Скорпион', symbol: '♏', color: '#722ed1' },
  { name: 'Стрелец', symbol: '♐', color: '#eb2f96' },
  { name: 'Козерог', symbol: '♑', color: '#fa8c16' },
  { name: 'Водолей', symbol: '♒', color: '#13c2c2' },
  { name: 'Рыбы', symbol: '♓', color: '#2f54eb' },
];

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

export const NatalWheel: React.FC<NatalWheelProps> = ({ chart, aspects, selectedObjectId, onSelectObject }) => {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const ascLongitude = chart.houses.angles.ascendant.longitude;
  const mcLongitude = chart.houses.angles.mc.longitude;
  const dscLongitude = chart.houses.angles.descendant.longitude;
  const icLongitude = chart.houses.angles.ic.longitude;

  // ASC слева на 180°
  const rotationOffset = 270 - ascLongitude;

  const getRotatedAngle = (lon: number) => {
    return (lon + rotationOffset) % 360;
  };

  const size = 600;
  const center = size / 2;
  const outerRadius = 250;
  const signRadius = 215;
  const houseRadius = 160;
  const planetRadius = 120;
  const aspectRadius = 85;

  const polarToCartesian = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180.0;
    return {
      x: center + radius * Math.cos(rad),
      y: center - radius * Math.sin(rad),
    };
  };

  const getAdjustedPlanetPositions = () => {
    const sorted = [...chart.positions].sort((a, b) => a.longitude - b.longitude);
    const positions: { planet: EnrichedPlanetPosition; x: number; y: number; angle: number }[] = [];
    const minAngleDiff = 5;

    sorted.forEach((planet, idx) => {
      let angle = getRotatedAngle(planet.longitude);
      if (idx > 0) {
        const prev = positions[idx - 1];
        const diff = (angle - prev.angle + 360) % 360;
        if (diff < minAngleDiff && diff > -minAngleDiff) {
          angle = (prev.angle + minAngleDiff) % 360;
        }
      }
      const pos = polarToCartesian(angle, planetRadius);
      positions.push({ planet, x: pos.x, y: pos.y, angle });
    });

    return positions;
  };

  const adjustedPlanets = getAdjustedPlanetPositions();

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '100%', height: 'auto', background: '#ffffff', borderRadius: '50%' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Основные круги - стиль как на референсе */}
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx={center} cy={center} r={signRadius} fill="none" stroke="#404040" strokeWidth="2" />
        <circle cx={center} cy={center} r={houseRadius} fill="none" stroke="#808080" strokeWidth="1.5" />
        <circle cx={center} cy={center} r={aspectRadius} fill="none" stroke="#c0c0c0" strokeWidth="1" />

        {/* Градусные засечки каждые 30° (для знаков) - большие */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * 30;
          const rotAngle = getRotatedAngle(angle);
          const p1 = polarToCartesian(rotAngle, outerRadius);
          const p2 = polarToCartesian(rotAngle, outerRadius + 15);
          
          return (
            <line
              key={`tick-30-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#1a1a1a"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Засечки каждые 10° - средние */}
        {Array.from({ length: 36 }).map((_, i) => {
          if (i % 3 === 0) return null;
          const angle = i * 10;
          const rotAngle = getRotatedAngle(angle);
          const p1 = polarToCartesian(rotAngle, outerRadius);
          const p2 = polarToCartesian(rotAngle, outerRadius + 10);
          
          return (
            <line
              key={`tick-10-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#404040"
              strokeWidth="1"
            />
          );
        })}

        {/* Малые засечки каждый градус */}
        {Array.from({ length: 360 }).map((_, i) => {
          if (i % 10 === 0) return null;
          const angle = i;
          const rotAngle = getRotatedAngle(angle);
          const p1 = polarToCartesian(rotAngle, outerRadius);
          const p2 = polarToCartesian(rotAngle, outerRadius + 5);
          
          return (
            <line
              key={`tick-1-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#a0a0a0"
              strokeWidth="0.7"
            />
          );
        })}

        {/* Знаки зодиака */}
        {ZODIAC_SIGNS.map((sign, index) => {
          const startLon = index * 30;
          const midLon = startLon + 15;
          const rotStart = getRotatedAngle(startLon);
          const rotMid = getRotatedAngle(midLon);

          const p1 = polarToCartesian(rotStart, outerRadius);
          const p2 = polarToCartesian(rotStart, signRadius);
          const textPos = polarToCartesian(rotMid, (outerRadius + signRadius) / 2 - 8);

          return (
            <g key={sign.name}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#404040" strokeWidth="1.5" />
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="18"
                fill={sign.color}
                fontWeight="bold"
                transform={`rotate(${-(rotMid)}, ${textPos.x}, ${textPos.y})`}
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Куспиды домов */}
        {chart.houses.cusps.map((cusp) => {
          const rotLon = getRotatedAngle(cusp.longitude);
          const pInner = polarToCartesian(rotLon, aspectRadius);
          const pOuter = polarToCartesian(rotLon, houseRadius);

          return (
            <line
              key={cusp.id}
              x1={pInner.x}
              y1={pInner.y}
              x2={pOuter.x}
              y2={pOuter.y}
              stroke="#b0b0b0"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
          );
        })}

        {/* Углы: ASC, DSC, MC, IC */}
        {(() => {
          const ascRot = getRotatedAngle(ascLongitude);
          const dscRot = getRotatedAngle(dscLongitude);
          const mcRot = getRotatedAngle(mcLongitude);
          const icRot = getRotatedAngle(icLongitude);

          const ascPoint = polarToCartesian(ascRot, outerRadius);
          const dscPoint = polarToCartesian(dscRot, outerRadius);
          const mcPoint = polarToCartesian(mcRot, outerRadius);
          const icPoint = polarToCartesian(icRot, outerRadius);

          return (
            <>
              {/* ASC-DSC линия */}
              <line x1={ascPoint.x} y1={ascPoint.y} x2={dscPoint.x} y2={dscPoint.y} stroke="#ff4d4f" strokeWidth="2.5" />
              <circle cx={ascPoint.x} cy={ascPoint.y} r="5" fill="none" stroke="#ff4d4f" strokeWidth="1.5" />
              <circle cx={dscPoint.x} cy={dscPoint.y} r="5" fill="none" stroke="#ff4d4f" strokeWidth="1.5" />
              
              <text 
                x={ascPoint.x - 25} 
                y={ascPoint.y} 
                fontSize="13" 
                fill="#ff4d4f" 
                fontWeight="bold" 
                textAnchor="end" 
                dominantBaseline="central"
              >
                ASC
              </text>
              <text 
                x={dscPoint.x + 25} 
                y={dscPoint.y} 
                fontSize="13" 
                fill="#ff4d4f" 
                fontWeight="bold" 
                textAnchor="start" 
                dominantBaseline="central"
              >
                DSC
              </text>

              {/* MC-IC линия */}
              <line x1={mcPoint.x} y1={mcPoint.y} x2={icPoint.x} y2={icPoint.y} stroke="#1890ff" strokeWidth="2.5" />
              <circle cx={mcPoint.x} cy={mcPoint.y} r="5" fill="none" stroke="#1890ff" strokeWidth="1.5" />
              <circle cx={icPoint.x} cy={icPoint.y} r="5" fill="none" stroke="#1890ff" strokeWidth="1.5" />
              
              <text 
                x={mcPoint.x} 
                y={mcPoint.y - 18} 
                fontSize="13" 
                fill="#1890ff" 
                fontWeight="bold" 
                textAnchor="middle"
              >
                MC
              </text>
              <text 
                x={icPoint.x} 
                y={icPoint.y + 20} 
                fontSize="13" 
                fill="#1890ff" 
                fontWeight="bold" 
                textAnchor="middle"
              >
                IC
              </text>
            </>
          );
        })()}

        {/* Аспекты */}
        {aspects.map((asp, index) => {
          const p1Rot = getRotatedAngle(asp.source.longitude);
          const p2Rot = getRotatedAngle(asp.target.longitude);

          const pt1 = polarToCartesian(p1Rot, aspectRadius);
          const pt2 = polarToCartesian(p2Rot, aspectRadius);

          let strokeColor = '#d0d0d0';
          if (asp.aspectType === 'trine' || asp.aspectType === 'sextile') {
            strokeColor = '#52c41a';
          } else if (asp.aspectType === 'square' || asp.aspectType === 'opposition') {
            strokeColor = '#ff4d4f';
          } else if (asp.aspectType === 'conjunction') {
            strokeColor = '#faad14';
          }

          const isAspectSelected = selectedObjectId && (asp.source.id === selectedObjectId || asp.target.id === selectedObjectId);

          return (
            <line
              key={index}
              x1={pt1.x}
              y1={pt1.y}
              x2={pt2.x}
              y2={pt2.y}
              stroke={strokeColor}
              strokeWidth={isAspectSelected ? 2.5 : (asp.aspectType === 'conjunction' ? 1.8 : 1.2)}
              opacity={isAspectSelected ? 1 : 0.6}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                if (rect) {
                  setTooltip({
                    text: `${asp.source.name} ↔ ${asp.target.name}\n${asp.aspectNameRu} (орб: ${asp.orb}°)`,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
            />
          );
        })}

        {/* Планеты */}
        {adjustedPlanets.map(({ planet, x, y }) => {
          const symbol = PLANET_SYMBOLS[planet.id] || '•';
          const isSelected = selectedObjectId === planet.id;

          return (
            <g
              key={planet.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectObject && onSelectObject(isSelected ? null : planet.id)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                if (rect) {
                  setTooltip({
                    text: `${planet.name}\nЗнак: ${planet.sign}\nГрадус: ${planet.degree.toFixed(2)}°\nДолгота: ${planet.longitude.toFixed(2)}°`,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
            >
              <circle
                cx={x}
                cy={y}
                r={isSelected ? "15" : "11"}
                fill={isSelected ? "#ff9900" : "#ffffff"}
                stroke="#003366"
                strokeWidth={isSelected ? "3" : "2"}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="13"
                fill={isSelected ? "#000000" : "#003366"}
                fontWeight="bold"
              >
                {symbol}
              </text>
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'pre-line',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

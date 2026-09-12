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
  { name: 'Овен', symbol: '♈', color: 'red' },
  { name: 'Телец', symbol: '♉', color: 'gray' },
  { name: 'Близнецы', symbol: '♊', color: 'green' },
  { name: 'Рак', symbol: '♋', color: 'blue' },
  { name: 'Лев', symbol: '♌', color: 'red' },
  { name: 'Дева', symbol: '♍', color: 'green' },
  { name: 'Весы', symbol: '♎', color: 'green' },
  { name: 'Скорпион', symbol: '♏', color: 'blue' },
  { name: 'Стрелец', symbol: '♐', color: 'red' },
  { name: 'Козерог', symbol: '♑', color: 'gray' },
  { name: 'Водолей', symbol: '♒', color: 'green' },
  { name: 'Рыбы', symbol: '♓', color: 'blue' },
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

  const rotationOffset = 180 - ascLongitude;

  const getRotatedAngle = (lon: number) => {
    return (lon + rotationOffset) % 360;
  };

  const size = 500;
  const center = size / 2;
  const outerRadius = 220;
  const signRadius = 190;
  const houseRadius = 150;
  const planetRadius = 120;
  const aspectRadius = 90;

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
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '100%', height: 'auto', background: '#fff', border: '1px solid #d9d9d9', borderRadius: '50%' }}
        onMouseLeave={() => setTooltip(null)}
      >
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#003366" strokeWidth="2" />
        <circle cx={center} cy={center} r={signRadius} fill="none" stroke="#d9d9d9" strokeWidth="1" />
        
        {Array.from({ length: 360 }).map((_, deg) => {
          const rotDeg = getRotatedAngle(deg);
          const isSignBoundary = deg % 30 === 0;
          const isTenDeg = deg % 10 === 0;
          const isFiveDeg = deg % 5 === 0;
          
          let tickLength = 3;
          let strokeWidth = 0.5;
          let strokeColor = '#bfbfbf';

          if (isSignBoundary) {
            tickLength = 8;
            strokeWidth = 1.2;
            strokeColor = '#003366';
          } else if (isTenDeg) {
            tickLength = 6;
            strokeWidth = 0.8;
            strokeColor = '#666666';
          } else if (isFiveDeg) {
            tickLength = 4;
            strokeWidth = 0.6;
            strokeColor = '#999999';
          }

          const pOuter = polarToCartesian(rotDeg, signRadius);
          const pInner = polarToCartesian(rotDeg, signRadius - tickLength);

          return (
            <line
              key={deg}
              x1={pOuter.x}
              y1={pOuter.y}
              x2={pInner.x}
              y2={pInner.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          );
        })}

        <circle cx={center} cy={center} r={signRadius - 8} fill="none" stroke="#d9d9d9" strokeWidth="1" />
        <circle cx={center} cy={center} r={houseRadius} fill="none" stroke="#003366" strokeWidth="1.5" />
        <circle cx={center} cy={center} r={aspectRadius} fill="none" stroke="#e8e8e8" strokeWidth="1" />

        {ZODIAC_SIGNS.map((sign, index) => {
          const startLon = index * 30;
          const midLon = startLon + 15;
          const rotStart = getRotatedAngle(startLon);
          const rotMid = getRotatedAngle(midLon);

          const p1 = polarToCartesian(rotStart, outerRadius);
          const p2 = polarToCartesian(rotStart, signRadius);
          const textPos = polarToCartesian(rotMid, (outerRadius + signRadius) / 2);

          return (
            <g key={sign.name}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#d9d9d9" strokeWidth="1" />
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                fill={sign.color}
                fontWeight="bold"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

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
              stroke="#bfbfbf"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          );
        })}

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
              <line x1={ascPoint.x} y1={ascPoint.y} x2={dscPoint.x} y2={dscPoint.y} stroke="#ff4d4f" strokeWidth="1.5" />
              <text x={ascPoint.x - 15} y={ascPoint.y} fontSize="10" fill="#ff4d4f" fontWeight="bold" textAnchor="end" dominantBaseline="central">ASC</text>
              <text x={dscPoint.x + 15} y={dscPoint.y} fontSize="10" fill="#ff4d4f" fontWeight="bold" textAnchor="start" dominantBaseline="central">DSC</text>

              <line x1={mcPoint.x} y1={mcPoint.y} x2={icPoint.x} y2={icPoint.y} stroke="#1890ff" strokeWidth="1.5" />
              <text x={mcPoint.x} y={mcPoint.y - 12} fontSize="10" fill="#1890ff" fontWeight="bold" textAnchor="middle">MC</text>
              <text x={icPoint.x} y={icPoint.y + 14} fontSize="10" fill="#1890ff" fontWeight="bold" textAnchor="middle">IC</text>
            </>
          );
        })()}

        {aspects.map((asp, index) => {
          const p1Rot = getRotatedAngle(asp.source.longitude);
          const p2Rot = getRotatedAngle(asp.target.longitude);

          const pt1 = polarToCartesian(p1Rot, aspectRadius);
          const pt2 = polarToCartesian(p2Rot, aspectRadius);

          let strokeColor = '#bfbfbf';
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
              strokeWidth={isAspectSelected ? 2.5 : (asp.aspectType === 'conjunction' ? 1.5 : 1)}
              opacity={isAspectSelected ? 1 : 0.7}
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

        {adjustedPlanets.map(({ planet, x, y }) => {
          const symbol = PLANET_SYMBOLS[planet.id] || '•';
          const isSelected = selectedObjectId === planet.id;

          const signObj = ZODIAC_SIGNS.find(s => s.name === planet.sign);
          const planetColor = signObj ? signObj.color : '#003366';

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
                r={isSelected ? "14" : "10"}
                fill={isSelected ? "#ff9900" : "#ffffff"}
                stroke="#003366"
                strokeWidth={isSelected ? "2" : "1"}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fill={isSelected ? "#000000" : planetColor}
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
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
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

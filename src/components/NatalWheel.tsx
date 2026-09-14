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
  { name: 'Овен', symbol: '♈\uFE0E', color: '#ff0000' },      // Овен: Red
  { name: 'Телец', symbol: '♉\uFE0E', color: '#008b8b' },    // Телец: Green
  { name: 'Близнецы', symbol: '♊\uFE0E', color: '#008b8b' },  // Близнецы: Green
  { name: 'Рак', symbol: '♋\uFE0E', color: '#0000ff' },     // Рак: Blue
  { name: 'Лев', symbol: '♌\uFE0E', color: '#ff0000' },      // Лев: Red
  { name: 'Дева', symbol: '♍\uFE0E', color: '#008b8b' },    // Дева: Green
  { name: 'Весы', symbol: '♎\uFE0E', color: '#008b8b' },    // Весы: Green
  { name: 'Скорпион', symbol: '♏\uFE0E', color: '#0000ff' }, // Скорпион: Blue
  { name: 'Стрелец', symbol: '♐\uFE0E', color: '#ff0000' },   // Стрелец: Red
  { name: 'Козерог', symbol: '♑\uFE0E', color: '#008b8b' },  // Козерог: Green
  { name: 'Водолей', symbol: '♒\uFE0E', color: '#20b2aa' },   // Aquarius: Green / Teal
  { name: 'Рыбы', symbol: '♓\uFE0E', color: '#0000ff' },     // Рыбы: Blue
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
  const signRadius = 180;
  const houseBoundaryRadius = 135;
  const planetRadius = 110;
  const houseNumberRadius = 80;
  const aspectRadius = 60;

  const polarToCartesian = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180.0;
    return {
      x: center + radius * Math.cos(rad),
      y: center - radius * Math.sin(rad),
    };
  };

  const getAdjustedPlanetPositions = () => {
    const sorted = [...chart.positions].sort((a, b) => a.longitude - b.longitude);
    const positions: { planet: EnrichedPlanetPosition; x: number; y: number; angle: number; currentRadius: number }[] = [];
    const minAngleDiff = 6;

    sorted.forEach((planet, idx) => {
      let angle = getRotatedAngle(planet.longitude);
      let currentRadius = planetRadius;

      if (idx > 0) {
        const prev = positions[idx - 1];
        const diff = (angle - prev.angle + 360) % 360;
        if (diff < minAngleDiff && diff > -minAngleDiff) {
          angle = (prev.angle + minAngleDiff) % 360;
          currentRadius = prev.currentRadius === planetRadius ? planetRadius + 14 : planetRadius;
        }
      }
      const pos = polarToCartesian(angle, currentRadius);
      positions.push({ planet, x: pos.x, y: pos.y, angle, currentRadius });
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
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#000000" strokeWidth="1" />
        <circle cx={center} cy={center} r={signRadius} fill="none" stroke="#000000" strokeWidth="1" />
        
        {Array.from({ length: 360 }).map((_, deg) => {
          const rotDeg = getRotatedAngle(deg);
          const isSignBoundary = deg % 30 === 0;
          const isTenDeg = deg % 10 === 0;
          
          let tickLength = 3;
          let strokeWidth = 0.5;
          let strokeColor = '#666666';

          if (isSignBoundary) {
            tickLength = 7;
            strokeWidth = 1;
            strokeColor = '#000000';
          } else if (isTenDeg) {
            tickLength = 5;
            strokeWidth = 0.7;
            strokeColor = '#444444';
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

        <circle cx={center} cy={center} r={signRadius} fill="none" stroke="#000000" strokeWidth="1" />
        <circle cx={center} cy={center} r={houseBoundaryRadius} fill="none" stroke="#000000" strokeWidth="1" />
        <circle cx={center} cy={center} r={aspectRadius} fill="none" stroke="#cccccc" strokeWidth="0.8" />

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
                fontSize="22"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                fill={sign.color}
                fontWeight="700"
                style={{ fill: sign.color, color: sign.color }}
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {chart.houses.cusps.map((cusp, idx) => {
          const rotLon = getRotatedAngle(cusp.longitude);
          const pInner = polarToCartesian(rotLon, aspectRadius);
          const pOuter = polarToCartesian(rotLon, houseBoundaryRadius);

          const nextCusp = chart.houses.cusps[(idx + 1) % 12];
          const nextRotLon = getRotatedAngle(nextCusp.longitude);
          
          let diff = (nextRotLon - rotLon + 360) % 360;
          const midRot = (rotLon + diff / 2) % 360;
          const midPos = polarToCartesian(midRot, houseNumberRadius);

          return (
            <g key={cusp.id}>
              <line
                x1={pInner.x}
                y1={pInner.y}
                x2={pOuter.x}
                y2={pOuter.y}
                stroke="#000000"
                strokeWidth="0.8"
              />
              <text
                x={midPos.x}
                y={midPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontFamily="sans-serif"
                fill="#333333"
                fontWeight="600"
              >
                {cusp.number}
              </text>
            </g>
          );
        })}

        {(() => {
          const ascRot = getRotatedAngle(ascLongitude);
          const dscRot = getRotatedAngle(dscLongitude);
          const mcRot = getRotatedAngle(mcLongitude);
          const icRot = getRotatedAngle(icLongitude);

          const ascPoint = polarToCartesian(ascRot, outerRadius);
          const dscPoint = polarToCartesian(dscRot, outerRadius);
          const mcPointOuter = polarToCartesian(mcRot, outerRadius);
          const icPointOuter = polarToCartesian(icRot, outerRadius);

          const ascTickOuter = polarToCartesian(ascRot, outerRadius + 6);
          const ascTickInner = polarToCartesian(ascRot, outerRadius);
          const dscTickOuter = polarToCartesian(dscRot, outerRadius + 6);
          const dscTickInner = polarToCartesian(dscRot, outerRadius);
          const mcTickOuter = polarToCartesian(mcRot, outerRadius + 6);
          const mcTickInner = polarToCartesian(mcRot, outerRadius);
          const icTickOuter = polarToCartesian(icRot, outerRadius + 6);
          const icTickInner = polarToCartesian(icRot, outerRadius);

          return (
            <>
              <line x1={ascPoint.x} y1={ascPoint.y} x2={dscPoint.x} y2={dscPoint.y} stroke="#ff0000" strokeWidth="2" />
              <line x1={ascTickInner.x} y1={ascTickInner.y} x2={ascTickOuter.x} y2={ascTickOuter.y} stroke="#000000" strokeWidth="2" />
              <line x1={dscTickInner.x} y1={dscTickInner.y} x2={dscTickOuter.x} y2={dscTickOuter.y} stroke="#000000" strokeWidth="2" />
              <text x={ascPoint.x - 15} y={ascPoint.y} fontSize="10" fill="#000000" fontWeight="bold" textAnchor="end" dominantBaseline="central">ASC</text>
              <text x={dscPoint.x + 15} y={dscPoint.y} fontSize="10" fill="#000000" fontWeight="bold" textAnchor="start" dominantBaseline="central">DSC</text>

              <line x1={polarToCartesian(mcRot, aspectRadius).x} y1={polarToCartesian(mcRot, aspectRadius).y} x2={mcPointOuter.x} y2={mcPointOuter.y} stroke="#000000" strokeWidth="1.5" />
              <line x1={polarToCartesian(icRot, aspectRadius).x} y1={polarToCartesian(icRot, aspectRadius).y} x2={icPointOuter.x} y2={icPointOuter.y} stroke="#000000" strokeWidth="1.5" />
              <line x1={mcTickInner.x} y1={mcTickInner.y} x2={mcTickOuter.x} y2={mcTickOuter.y} stroke="#000000" strokeWidth="2" />
              <line x1={icTickInner.x} y1={icTickInner.y} x2={icTickOuter.x} y2={icTickOuter.y} stroke="#000000" strokeWidth="2" />
              <text x={mcPointOuter.x} y={mcPointOuter.y - 12} fontSize="10" fill="#000000" fontWeight="bold" textAnchor="middle">MC</text>
              <text x={icPointOuter.x} y={icPointOuter.y + 14} fontSize="10" fill="#000000" fontWeight="bold" textAnchor="middle">IC</text>
            </>
          );
        })()}

        {aspects.map((asp, index) => {
          const p1Rot = getRotatedAngle(asp.source.longitude);
          const p2Rot = getRotatedAngle(asp.target.longitude);

          const pt1 = polarToCartesian(p1Rot, aspectRadius);
          const pt2 = polarToCartesian(p2Rot, aspectRadius);

          let strokeColor = '#bfbfbf';
          let strokeWidthVal = 1;
          if (asp.aspectType === 'opposition') {
            strokeColor = '#ff0000'; // ярко-красная
            strokeWidthVal = 1.5;
          } else if (asp.aspectType === 'square') {
            strokeColor = '#ff0000'; // ярко-красная
            strokeWidthVal = 1.5;
          } else if (asp.aspectType === 'trine') {
            strokeColor = '#000080'; // тёмно-синяя
            strokeWidthVal = 1.2;
          } else if (asp.aspectType === 'sextile') {
            strokeColor = '#00bfff'; // тонкая голубая
            strokeWidthVal = 0.8;
          } else if (asp.aspectType === 'conjunction') {
            strokeColor = '#faad14';
            strokeWidthVal = 1.5;
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
              strokeWidth={isAspectSelected ? 2.5 : strokeWidthVal}
              opacity={isAspectSelected ? 1 : 0.8}
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
                    text: `${planet.name} ${planet.retrograde ? '(ретро)' : ''}\nЗнак: ${planet.sign}\nГрадус: ${planet.degree.toFixed(2)}°\nДолгота: ${planet.longitude.toFixed(2)}°`,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
            >
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="22"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                fill={isSelected ? "#ff9900" : planetColor}
                fontWeight="700"
              >
                {symbol}
                {planet.retrograde && (
                  <tspan fontSize="8" fill="#1890ff" fontWeight="bold" dx="1" dy="-4">R</tspan>
                )}
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

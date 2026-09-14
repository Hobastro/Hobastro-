export function calculateHouseLength(cuspStart: number, cuspEnd: number): number {
  return (cuspEnd - cuspStart + 360) % 360;
}

export function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
}

export function formatDegreeSeconds(deg: number): string {
  const d = Math.floor(deg);
  const remainderMins = (deg - d) * 60;
  const m = Math.floor(remainderMins);
  const s = Math.round((remainderMins - m) * 60);
  return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
}

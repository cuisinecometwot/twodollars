/**
 * Draws QR modules (computed by an encoder in the app layer) as a single
 * path. Includes the 4-module quiet zone scanners need.
 */
export function qrSvg(
  modules: readonly (readonly boolean[])[],
  size: number,
  x = 0,
  y = 0,
): string {
  const n = modules.length;
  const total = n + 8;
  let d = '';
  modules.forEach((row, ry) => {
    let cx = 0;
    while (cx < n) {
      if (!row[cx]) {
        cx++;
        continue;
      }
      let w = 1;
      while (row[cx + w]) w++;
      d += `M${cx + 4} ${ry + 4}h${w}v1h-${w}z`;
      cx += w;
    }
  });
  return (
    `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="#fff"/><path fill="#000" d="${d}"/></svg>`
  );
}

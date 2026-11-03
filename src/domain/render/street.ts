/**
 * Hanoi old-quarter street at dusk: tube houses, shutters, shop signs,
 * tangled power lines, tiled sidewalk, plastic stools. Built from
 * rectangles (not a pixel grid) so the README SVG stays small.
 */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  c: string;
  /** Opacity, for the dusk haze. */
  o?: number;
}

const SKY = ['#1d1838', '#2a2150', '#3e2a58'];
const WALLS = [
  { base: '#e3b448', shade: '#b88a2e' }, // colonial yellow
  { base: '#d98c7a', shade: '#a9604f' },
  { base: '#e8d8b0', shade: '#b8a57c' },
  { base: '#9fb3b8', shade: '#6f858b' },
  { base: '#e3b448', shade: '#b88a2e' },
];
const SIGNS = ['#c8402f', '#2f5fa8', '#3f7a3a', '#c8402f'];
const SHUTTER = '#3f7a5a';
const SHUTTER_DARK = '#2c5a42';
const LIT = '#f7d774';
const DARK_WINDOW = '#2b2440';
const INK = '#2b1d14';
const WIRE = '#15111f';

/** Deterministic so the same card renders the same street every time. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}

/** Row where the sidewalk starts; renderers line the avatar's mat up with it. */
export function streetGround(h: number): number {
  return h - 15;
}

export function streetRects(w: number, h: number, seed = 7): Rect[] {
  const r: Rect[] = [];
  const rect = (x: number, y: number, rw: number, rh: number, c: string, o?: number) => {
    const x0 = Math.max(0, Math.round(x));
    const x1 = Math.min(w, Math.round(x + rw));
    if (x1 > x0 && rh > 0)
      r.push({ x: x0, y: Math.round(y), w: x1 - x0, h: Math.round(rh), c, ...(o && { o }) });
  };
  const rand = rng(seed);
  const ground = streetGround(h);

  // Sky bands + a few stars.
  rect(0, 0, w, ground, SKY[0]!);
  rect(0, Math.round(ground * 0.45), w, ground, SKY[1]!);
  rect(0, Math.round(ground * 0.75), w, ground, SKY[2]!);
  for (let i = 0; i < Math.floor(w / 18); i++)
    rect(Math.floor(rand() * w), Math.floor(rand() * ground * 0.3), 1, 1, '#f4efe1');

  // Tube houses: narrow, tall, different heights.
  let x = -Math.floor(rand() * 6);
  let i = 0;
  while (x < w) {
    const hw = 13 + Math.floor(rand() * 7);
    const hh = Math.min(ground - 3, 22 + Math.floor(rand() * 14));
    const top = ground - hh;
    const wall = WALLS[i % WALLS.length]!;
    rect(x, top, hw, hh, wall.base);
    rect(x, top, hw, 2, wall.shade); // parapet
    rect(x, top - 1, hw, 1, INK);
    rect(x + hw - 1, top, 1, hh, wall.shade); // edge between houses

    // Upper floors: shuttered windows with a balcony rail.
    const winW = hw - 6;
    for (let fy = top + 4; fy + 7 <= ground - 10; fy += 8) {
      const lit = rand() < 0.55;
      rect(x + 3, fy, winW, 5, lit ? LIT : DARK_WINDOW);
      rect(x + 2, fy, 2, 5, SHUTTER);
      rect(x + 3 + winW - 1, fy, 2, 5, SHUTTER);
      rect(x + 2, fy, 1, 5, SHUTTER_DARK);
      rect(x + 2, fy + 5, winW + 2, 1, INK);
      for (let bx = x + 3; bx < x + 2 + winW + 1; bx += 2) rect(bx, fy + 6, 1, 1, INK);
    }

    // Ground floor: shop sign + open shopfront with warm light inside.
    const sign = SIGNS[Math.floor(rand() * SIGNS.length)]!;
    rect(x + 1, ground - 10, hw - 3, 3, sign);
    for (let tx = x + 3; tx < x + hw - 4; tx += 2) rect(tx, ground - 9, 1, 1, '#f4efe1');
    rect(x + 2, ground - 7, hw - 5, 7, '#3a2416');
    rect(x + 3, ground - 6, hw - 7, 4, '#f0a040');
    rect(x + 2, ground - 7, hw - 5, 1, INK);

    x += hw;
    i++;
  }

  // Power pole with sagging, tangled wires — the Hanoi signature.
  // First pole sits in the gap between the avatar and the sign board.
  const poles = [51, w - 4].filter((p) => p < w);
  for (const px of poles) {
    rect(px, 6, 1, ground - 6, '#4a4652');
    rect(px - 2, 8, 5, 1, '#4a4652');
  }
  const anchors = [-8, ...poles, w + 8];
  for (let k = 0; k < 3; k++) {
    const base = 9 + k * 2;
    for (let a = 0; a < anchors.length - 1; a++) {
      const x0 = anchors[a]!;
      const x1 = anchors[a + 1]!;
      const sag = 3 + k + Math.floor(rand() * 3);
      let runStart = x0;
      let runY = base;
      for (let xx = x0; xx <= x1; xx++) {
        const t = (xx - x0) / (x1 - x0);
        const y = base + Math.round(sag * 4 * t * (1 - t));
        if (y !== runY || xx === x1) {
          rect(runStart, runY, xx - runStart, 1, WIRE);
          runStart = xx;
          runY = y;
        }
      }
    }
  }
  for (const px of poles) {
    // Bundle of wire knots around the pole.
    rect(px - 2, 10, 5, 3, WIRE);
    rect(px - 3, 12, 2, 2, WIRE);
    rect(px + 2, 13, 1, 3, WIRE);
  }

  // Dusk haze keeps the busy facades behind the avatar and sign.
  rect(0, 0, w, ground, '#1b1830', 0.28);

  // Sidewalk: terracotta tiles with grout.
  const curb = h - 6;
  rect(0, ground, w, curb - ground, '#b5654a');
  for (let ty = ground; ty < curb; ty += 4)
    for (let tx = (ty / 4) % 2 ? 0 : 4; tx < w; tx += 8) rect(tx, ty, 4, 4, '#9c5440');
  rect(0, ground, w, 1, '#6e3a2c');

  // Curb and road.
  rect(0, curb, w, 1, '#a3a3ad');
  rect(0, curb + 1, w, 1, '#6e6e7a');
  rect(0, curb + 2, w, h - curb - 2, '#2a2833');

  // Red/blue plastic stools, street-tea style.
  const stools = [Math.round(w * 0.43), Math.round(w * 0.47), Math.round(w * 0.97)];
  stools.forEach((sx, n) => {
    const c = n % 2 ? '#2f5fa8' : '#c8402f';
    rect(sx, curb - 4, 3, 1, c);
    rect(sx, curb - 3, 1, 3, c);
    rect(sx + 2, curb - 3, 1, 3, c);
  });

  return r;
}

/** Consecutive same-colour rects become one <path>; draw order is kept. */
export function rectsToSvg(rects: readonly Rect[]): string {
  let out = '';
  let key = '';
  let attrs = '';
  let d = '';
  for (const { x, y, w, h, c, o } of rects) {
    const k = `${c}|${o ?? ''}`;
    if (k !== key) {
      if (d) out += `<path ${attrs} d="${d}"/>`;
      key = k;
      attrs = `fill="${c}"` + (o === undefined ? '' : ` opacity="${o}"`);
      d = '';
    }
    d += `M${x} ${y}h${w}v${h}h-${w}z`;
  }
  if (d) out += `<path ${attrs} d="${d}"/>`;
  return out;
}

export function streetSvg(w: number, h: number, seed?: number): string {
  return rectsToSvg(streetRects(w, h, seed));
}

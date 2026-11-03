import { FIXED_COLORS, HAIR_COLORS, SHIRT_COLORS, SKIN_TONES } from './palette';
import { BODY, GRID, HEAD, PARTS, findPart, type Slot, type Sprite } from './parts';

export interface AvatarConfig {
  skin: string;
  hairColor: string;
  shirtColor: string;
  hair: string;
  shirt: string;
  bowl: string;
  mat: string;
  pet: string;
  instrument: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: 'tan',
  hairColor: 'black',
  shirtColor: 'blue',
  hair: 'messy',
  shirt: 'hoodie',
  bowl: 'clay',
  mat: 'straw',
  pet: 'none',
  instrument: 'laptop',
};

/** Unknown ids fall back to defaults so old or hand-edited configs still render. */
export function normalizeAvatar(input: Partial<Record<keyof AvatarConfig, unknown>>): AvatarConfig {
  const pick = <T extends { id: string }>(list: readonly T[], v: unknown, d: string) =>
    typeof v === 'string' && list.some((x) => x.id === v) ? v : d;
  const part = (slot: Slot, v: unknown) => pick(PARTS[slot], v, DEFAULT_AVATAR[slot]);
  return {
    skin: pick(SKIN_TONES, input.skin, DEFAULT_AVATAR.skin),
    hairColor: pick(HAIR_COLORS, input.hairColor, DEFAULT_AVATAR.hairColor),
    shirtColor: pick(SHIRT_COLORS, input.shirtColor, DEFAULT_AVATAR.shirtColor),
    hair: part('hair', input.hair),
    shirt: part('shirt', input.shirt),
    bowl: part('bowl', input.bowl),
    mat: part('mat', input.mat),
    pet: part('pet', input.pet),
    instrument: part('instrument', input.instrument),
  };
}

/** `rand` returns [0, 1); injected so tests can be deterministic. */
export function randomAvatar(rand: () => number): AvatarConfig {
  const any = <T>(list: readonly T[]): T => list[Math.floor(rand() * list.length)]!;
  return {
    skin: any(SKIN_TONES).id,
    hairColor: any(HAIR_COLORS).id,
    shirtColor: any(SHIRT_COLORS).id,
    hair: any(PARTS.hair).id,
    shirt: any(PARTS.shirt).id,
    bowl: any(PARTS.bowl).id,
    mat: any(PARTS.mat).id,
    pet: any(PARTS.pet).id,
    instrument: any(PARTS.instrument).id,
  };
}

export type Grid = (string | null)[][];

export function baseColors(a: AvatarConfig): Record<string, string> {
  const skin = SKIN_TONES.find((s) => s.id === a.skin) ?? SKIN_TONES[0]!;
  const hair = HAIR_COLORS.find((s) => s.id === a.hairColor) ?? HAIR_COLORS[0]!;
  const shirt = SHIRT_COLORS.find((s) => s.id === a.shirtColor) ?? SHIRT_COLORS[0]!;
  return {
    ...FIXED_COLORS,
    s: skin.base,
    S: skin.shade,
    h: hair.base,
    H: hair.shade,
    c: shirt.base,
    C: shirt.shade,
    d: shirt.detail,
  };
}

function paint(grid: Grid, sprite: Sprite, colors: Record<string, string>) {
  sprite.rows.forEach((row, dy) => {
    [...row].forEach((ch, dx) => {
      if (ch === '.') return;
      const x = sprite.x + dx;
      const y = sprite.y + dy;
      if (x < 0 || y < 0 || x >= GRID || y >= GRID) return;
      const color = colors[ch];
      if (color === undefined) throw new Error(`Unknown palette char "${ch}"`);
      grid[y]![x] = color;
    });
  });
}

export type Layer = Slot | 'body' | 'head';

/** Back-to-front draw order. Pets sit beside the legs, so they go in front of the person. */
export const LAYERS: readonly Layer[] = [
  'mat',
  'body',
  'shirt',
  'head',
  'hair',
  'instrument',
  'pet',
  'bowl',
];

/** `only` draws a subset (e.g. the bowl on its own so renderers can animate it). */
export function composeAvatar(avatar: AvatarConfig, only: readonly Layer[] = LAYERS): Grid {
  const a = normalizeAvatar(avatar);
  const grid: Grid = Array.from({ length: GRID }, () => Array<string | null>(GRID).fill(null));
  const colors = baseColors(a);
  for (const layer of LAYERS) {
    if (!only.includes(layer)) continue;
    if (layer === 'body') BODY.forEach((s) => paint(grid, s, colors));
    else if (layer === 'head') paint(grid, HEAD, colors);
    else {
      const part = findPart(layer, a[layer]);
      if (!part) continue;
      const c = part.colors ? { ...colors, ...part.colors } : colors;
      part.sprites.forEach((s) => paint(grid, s, c));
    }
  }
  return grid;
}

/** Bounding box of the bowl in grid units; the widget drops coins here. */
export function bowlBox(avatar: AvatarConfig): { x: number; y: number; w: number; h: number } {
  const part = findPart('bowl', normalizeAvatar(avatar).bowl)!;
  const s = part.sprites[0]!;
  return { x: s.x, y: s.y, w: Math.max(...s.rows.map((r) => r.length)), h: s.rows.length };
}

/**
 * One <path> per color, each pixel run as a 1-unit-tall rectangle. Much
 * smaller than one <rect> per pixel, which matters for README SVGs.
 */
export function gridToPaths(grid: Grid, ox = 0, oy = 0): string {
  const byColor = new Map<string, string[]>();
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (!c) {
        x++;
        continue;
      }
      let w = 1;
      while (row[x + w] === c) w++;
      const d = byColor.get(c) ?? [];
      d.push(`M${x + ox} ${y + oy}h${w}v1h-${w}z`);
      byColor.set(c, d);
      x += w;
    }
  });
  return [...byColor].map(([c, d]) => `<path fill="${c}" d="${d.join('')}"/>`).join('');
}

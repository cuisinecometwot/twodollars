import {
  LAYERS,
  baseColors,
  bowlBox,
  composeAvatar,
  gridToPaths,
  normalizeAvatar,
  type AvatarConfig,
  type Grid,
} from '../avatar/compose';
import { FIXED_COLORS } from '../avatar/palette';
import { EYES } from '../avatar/parts';

export const COIN_ROWS = ['.kk.', 'kywk', 'kyYk', '.kk.'];

export function spriteGrid(rows: readonly string[], colors = FIXED_COLORS): Grid {
  return rows.map((r) => [...r].map((ch) => (ch === '.' ? null : (colors[ch] ?? null))));
}

export function coinPaths(): string {
  return gridToPaths(spriteGrid(COIN_ROWS));
}

/**
 * Avatar layers in 32×32 user units, with the bowl and eyelids split out so
 * they can be animated (classes td-bowl / td-blink, styled by the caller).
 */
export function avatarLayers(avatar: AvatarConfig): string {
  const a = normalizeAvatar(avatar);
  const rest = composeAvatar(
    a,
    LAYERS.filter((l) => l !== 'bowl'),
  );
  const bowl = composeAvatar(a, ['bowl']);
  const skin = baseColors(a).s;
  const lids = EYES.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('');
  return (
    gridToPaths(rest) +
    `<path class="td-blink" fill="${skin}" d="${lids}"/>` +
    `<g class="td-bowl">${gridToPaths(bowl)}</g>`
  );
}

/** Where coins should land, as fractions of the scene (0..1). */
export function bowlTarget(avatar: AvatarConfig): { x: number; y: number } {
  const b = bowlBox(avatar);
  return { x: (b.x + b.w / 2) / 32, y: (b.y + 1) / 32 };
}

/** Shared animation CSS for the scene. Bowl hop delay is tuned to the coin landing. */
export const SCENE_CSS = `
.td-blink{opacity:0;animation:td-blink 4.5s steps(1) infinite}
@keyframes td-blink{0%,93%{opacity:0}94%,97%{opacity:1}98%{opacity:0}}
.td-bowl{transform-box:fill-box;transform-origin:50% 100%}
@media (prefers-reduced-motion:reduce){.td-blink,.td-bowl,.td-coin,.td-glow{animation:none!important}}
`;

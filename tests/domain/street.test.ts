import { describe, expect, it } from 'vitest';
import { rectsToSvg, streetGround, streetRects } from '../../src/domain/render/street';

describe('street backdrop', () => {
  it('is deterministic for the same size and seed', () => {
    expect(streetRects(120, 52)).toEqual(streetRects(120, 52));
  });

  it('keeps every rect inside the canvas', () => {
    for (const [w, h] of [
      [120, 52],
      [155, 52],
      [120, 48],
    ] as const)
      for (const r of streetRects(w, h)) {
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.x + r.w).toBeLessThanOrEqual(w);
        expect(r.w).toBeGreaterThan(0);
      }
  });

  it('starts the sidewalk 15 rows from the bottom', () => {
    expect(streetGround(52)).toBe(37);
  });

  it('merges consecutive same-colour rects and keeps opacity separate', () => {
    expect(
      rectsToSvg([
        { x: 0, y: 0, w: 1, h: 1, c: '#a' },
        { x: 1, y: 0, w: 1, h: 1, c: '#a' },
        { x: 0, y: 0, w: 2, h: 1, c: '#a', o: 0.5 },
      ]),
    ).toBe(
      '<path fill="#a" d="M0 0h1v1h-1zM1 0h1v1h-1z"/><path fill="#a" opacity="0.5" d="M0 0h2v1h-2z"/>',
    );
  });
});

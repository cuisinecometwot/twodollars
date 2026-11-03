import { describe, expect, it } from 'vitest';
import {
  DEFAULT_AVATAR,
  bowlBox,
  composeAvatar,
  gridToPaths,
  normalizeAvatar,
  randomAvatar,
} from '../../src/domain/avatar/compose';
import { GRID, PARTS, SLOTS } from '../../src/domain/avatar/parts';

describe('composeAvatar', () => {
  it('renders every part variant without unknown palette chars', () => {
    for (const slot of SLOTS)
      for (const part of PARTS[slot])
        expect(() => composeAvatar({ ...DEFAULT_AVATAR, [slot]: part.id })).not.toThrow();
  });

  it('produces a 32x32 grid with some painted pixels', () => {
    const g = composeAvatar(DEFAULT_AVATAR);
    expect(g).toHaveLength(GRID);
    expect(g.every((r) => r.length === GRID)).toBe(true);
    expect(g.flat().filter(Boolean).length).toBeGreaterThan(200);
  });

  it('draws only the requested layers', () => {
    const bowlOnly = composeAvatar(DEFAULT_AVATAR, ['bowl']).flat().filter(Boolean).length;
    const all = composeAvatar(DEFAULT_AVATAR).flat().filter(Boolean).length;
    expect(bowlOnly).toBeGreaterThan(0);
    expect(bowlOnly).toBeLessThan(all);
  });

  it('places every bowl inside the grid', () => {
    for (const b of PARTS.bowl) {
      const box = bowlBox({ ...DEFAULT_AVATAR, bowl: b.id });
      expect(box.x + box.w).toBeLessThanOrEqual(GRID);
      expect(box.y + box.h).toBeLessThanOrEqual(GRID);
    }
  });
});

describe('normalizeAvatar / randomAvatar', () => {
  it('falls back to defaults for unknown ids', () => {
    expect(normalizeAvatar({ hair: 'mullet', skin: 42 })).toEqual(DEFAULT_AVATAR);
  });

  it('random avatars are always valid', () => {
    let seed = 1;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 50; i++) {
      const a = randomAvatar(rand);
      expect(normalizeAvatar(a)).toEqual(a);
    }
  });
});

describe('gridToPaths', () => {
  it('merges horizontal runs per color', () => {
    const out = gridToPaths([
      ['#a', '#a', null],
      [null, '#b', '#a'],
    ]);
    expect(out).toBe(
      '<path fill="#a" d="M0 0h2v1h-2zM2 1h1v1h-1z"/><path fill="#b" d="M1 1h1v1h-1z"/>',
    );
  });
});

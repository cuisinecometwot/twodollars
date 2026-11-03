/**
 * Sprite rows use one character per pixel. '.' is transparent; every other
 * character is looked up here, or in the per-avatar colors (skin/hair/shirt).
 */
export const FIXED_COLORS: Readonly<Record<string, string>> = {
  k: '#2b1d14', // outline
  w: '#f4efe1',
  g: '#a3a3ad',
  G: '#6e6e7a',
  y: '#f5c542', // coin gold
  Y: '#c9952b',
  b: '#9a6534', // wood / clay
  B: '#5e3b1c',
  r: '#c8402f',
  R: '#8e2a20',
  n: '#4f8a3b',
  N: '#356128',
  e: '#d8b26a', // straw
  E: '#b38b45',
  o: '#e08a3a',
  O: '#b5652a',
  p: '#3b4a6b', // pants
  P: '#2b3650',
  m: '#7a2e2e', // mouth
  v: '#e88f86', // cheeks
  t: '#c7a06a', // dog fur
  T: '#9b7646',
  f: '#b4b4be', // cat fur
  F: '#82828e',
  l: '#7fd4f0',
};

export interface Swatch {
  id: string;
  label: string;
  base: string;
  shade: string;
}

export const SKIN_TONES: readonly Swatch[] = [
  { id: 'light', label: 'Light', base: '#f6d3b3', shade: '#dfb08a' },
  { id: 'tan', label: 'Tan', base: '#e3b07f', shade: '#c28d5c' },
  { id: 'brown', label: 'Brown', base: '#b07a4f', shade: '#8c5c37' },
  { id: 'dark', label: 'Dark', base: '#7a5236', shade: '#5c3c26' },
];

export const HAIR_COLORS: readonly Swatch[] = [
  { id: 'black', label: 'Black', base: '#2f2a2a', shade: '#1a1616' },
  { id: 'brown', label: 'Brown', base: '#6b4226', shade: '#4a2d19' },
  { id: 'blond', label: 'Blond', base: '#e6c264', shade: '#bf9a40' },
  { id: 'red', label: 'Red', base: '#b5482a', shade: '#86321c' },
  { id: 'gray', label: 'Gray', base: '#bdbdc4', shade: '#8d8d96' },
  { id: 'pink', label: 'Pink', base: '#f08cb8', shade: '#c4628e' },
];

/** Shirts also use `d` as a detail color (stripes, pocket). */
export const SHIRT_COLORS: readonly (Swatch & { detail: string })[] = [
  { id: 'white', label: 'White', base: '#e9e6dc', shade: '#c4c0b2', detail: '#c8402f' },
  { id: 'red', label: 'Red', base: '#c8402f', shade: '#8e2a20', detail: '#f4efe1' },
  { id: 'blue', label: 'Blue', base: '#3f73c4', shade: '#2c5292', detail: '#f4efe1' },
  { id: 'green', label: 'Green', base: '#4f8a3b', shade: '#356128', detail: '#f5c542' },
  { id: 'yellow', label: 'Yellow', base: '#f0c23b', shade: '#c2951f', detail: '#c8402f' },
  { id: 'black', label: 'Black', base: '#34343e', shade: '#1f1f27', detail: '#f5c542' },
];

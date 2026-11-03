import { escapeXml } from '../sign';

/**
 * Street-shop LED board: red dot-matrix text with a glow. Text that fits is
 * shown still (with a neon flicker); text that doesn't scrolls in a loop.
 */

export interface LedOptions {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  /** Prefix for SVG ids, so several boards can share a document. */
  id?: string;
}

const FONT_SIZE = 13;
/** Width forced per character via textLength, so fit/scroll never depends on the viewer's font. */
export const LED_CHAR_W = 8;
const PAD = 8;
const GAP = 48;
const SPEED = 40; // px per second

export function ledFits(text: string, innerWidth: number): boolean {
  return [...text].length * LED_CHAR_W <= innerWidth;
}

export function renderLedSign({ x, y, w, h, text, id = 'led' }: LedOptions): {
  svg: string;
  css: string;
} {
  const inner = w - PAD * 2;
  const chars = [...text].length;
  const textW = chars * LED_CHAR_W;
  const scroll = !ledFits(text, inner);
  const cy = y + h / 2;
  const t = escapeXml(text);
  const label = (tx: number, anchor = 'start') =>
    `<text x="${tx}" y="${cy}" textLength="${textW}" lengthAdjust="spacingAndGlyphs" text-anchor="${anchor}">${t}</text>`;

  // Scrolling: two copies one period apart, slide by exactly one period, repeat.
  const period = textW + GAP;
  const body = scroll
    ? `<g class="${id}-run">${label(x + PAD)}${label(x + PAD + period)}</g>`
    : `<g class="${id}-still">${label(x + w / 2 - textW / 2)}</g>`;

  const css = scroll
    ? `.${id}-run{animation:${id}-run ${(period / SPEED).toFixed(2)}s linear infinite}
@keyframes ${id}-run{from{transform:translateX(0)}to{transform:translateX(-${period}px)}}`
    : `.${id}-still{animation:${id}-flicker 7s steps(1) infinite}
@keyframes ${id}-flicker{0%,91%,95%,100%{opacity:1}92%,94%{opacity:.35}}`;

  const svg = `<defs>
<clipPath id="${id}-clip"><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}"/></clipPath>
<pattern id="${id}-off" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#2a1212"/></pattern>
<pattern id="${id}-grid" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M2 0h1v3h-1zM0 2h2v1h-2z" fill="#0d0a0a"/></pattern>
<filter id="${id}-glow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0d0a0a" stroke="#4a4652" stroke-width="3"/>
<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" fill="url(#${id}-off)"/>
<g clip-path="url(#${id}-clip)">
<g filter="url(#${id}-glow)" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="${FONT_SIZE}" font-weight="700" fill="#ff5a3c" dominant-baseline="central">${body}</g>
<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" fill="url(#${id}-grid)" opacity=".45"/>
</g>
<rect x="${x - 1}" y="${y - 1}" width="3" height="3" fill="#a3a3ad"/><rect x="${x + w - 2}" y="${y - 1}" width="3" height="3" fill="#a3a3ad"/>`;

  return { svg, css };
}

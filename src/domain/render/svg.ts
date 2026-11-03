import { bowlBox, gridToPaths } from '../avatar/compose';
import type { WidgetConfig } from '../config';
import { escapeXml, wrapText } from '../sign';
import { avatarLayers, coinPaths, spriteGrid, SCENE_CSS } from './scene';
import { qrSvg } from './qr';

export type QrModules = readonly (readonly boolean[])[];

const FONT = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

const LANTERN = spriteGrid(['..k..', '.kkk.', 'krrrk', 'kryrk', 'krrrk', '.kkk.', '..y..']);

/** "https://ko-fi.com/duke/" -> "ko-fi.com/duke" */
export function displayUrl(url: string, max = 34): string {
  const s = url.replace(/^https:\/\//, '').replace(/\/$/, '');
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

/**
 * Static card for GitHub READMEs. GitHub serves SVGs as images (no JS), but
 * CSS animations inside still run, so the coin drop and blink are pure CSS.
 */
export function renderReadmeSvg(config: WidgetConfig, qr: QrModules | null = null): string {
  const W = qr ? 620 : 480;
  const H = 208;
  const scale = 6;
  const ax = 8;
  const ay = 8;
  const bowl = bowlBox(config.avatar);
  const coinX = bowl.x + bowl.w / 2 - 2;
  const coinLand = bowl.y - 3;

  const lines = wrapText(config.sign, 22, 5);
  const textTop = 84 - ((lines.length - 1) * 20) / 2;
  const text = lines
    .map((l, i) => `<text x="340" y="${textTop + i * 20}">${escapeXml(l)}</text>`)
    .join('');

  const target = config.links[0]
    ? `→ ${displayUrl(config.links[0])}`
    : qr
      ? 'scan QR, money go straight to me'
      : '';
  const alt = `${config.sign}${config.links[0] ? ` — ${displayUrl(config.links[0])}` : ''}`;

  const css = `${SCENE_CSS}
.td-coin{animation:td-drop 3.6s cubic-bezier(.5,0,1,1) infinite}
@keyframes td-drop{0%{transform:translateY(-12px);opacity:0}8%{opacity:1}50%{transform:translateY(${coinLand}px);opacity:1}54%,100%{transform:translateY(${coinLand}px);opacity:0}}
.td-bowl{animation:td-hop 3.6s infinite}
@keyframes td-hop{0%,49%,60%,100%{transform:none}52%{transform:translateY(-1px)}}
.td-glow{animation:td-glow 2.4s ease-in-out infinite alternate}
@keyframes td-glow{from{opacity:.25}to{opacity:.6}}`;

  const stars = [
    [228, 14],
    [300, 10],
    [452, 18],
    [404, 8],
    [262, 168],
  ]
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="2" height="2" fill="#f4efe1" opacity=".45"/>`)
    .join('');

  const qrBlock = qr
    ? qrSvg(qr, 112, 488, 30) +
      `<text x="544" y="166" text-anchor="middle" font-family="${FONT}" fill="#f5c542" font-size="12">scan = give vía</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(alt)}">
<title>${escapeXml(alt)}</title>
<style>${css}</style>
<rect width="${W}" height="${H}" fill="#1b1830"/>
<rect y="176" width="${W}" height="${H - 176}" fill="#241f3a"/>
${stars}
<circle class="td-glow" cx="27" cy="25" r="14" fill="#f5b942"/>
<g transform="translate(20 14) scale(3)" shape-rendering="crispEdges">${gridToPaths(LANTERN)}</g>
<g transform="translate(${ax} ${ay}) scale(${scale})" shape-rendering="crispEdges">
${avatarLayers(config.avatar)}
<g transform="translate(${coinX} 0)"><g class="td-coin">${coinPaths()}</g></g>
</g>
<g shape-rendering="crispEdges">
<rect x="236" y="148" width="8" height="30" fill="#5e3b1c"/><rect x="436" y="148" width="8" height="30" fill="#5e3b1c"/>
<rect x="218" y="22" width="244" height="128" fill="#c49a63" stroke="#5e3b1c" stroke-width="4"/>
<rect x="224" y="28" width="4" height="4" fill="#2b1d14"/><rect x="452" y="28" width="4" height="4" fill="#2b1d14"/>
<rect x="224" y="140" width="4" height="4" fill="#2b1d14"/><rect x="452" y="140" width="4" height="4" fill="#2b1d14"/>
</g>
<g font-family="${FONT}" font-size="15" font-weight="700" fill="#2b1d14" text-anchor="middle" dominant-baseline="middle">${text}</g>
<text x="340" y="196" text-anchor="middle" font-family="${FONT}" font-size="13" fill="#f5c542">${escapeXml(target)}</text>
${qrBlock}
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#2b1d14" stroke-width="4"/>
</svg>`;
}

export const README_FILENAME = 'twodollars.svg';

export function readmeMarkdown(config: WidgetConfig, svgPath = README_FILENAME): string {
  const img = `![${config.sign.replace(/[[\]]/g, '')}](${svgPath})`;
  return config.links[0] ? `[${img}](${config.links[0]})` : img;
}

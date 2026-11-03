import { counterKey, type WidgetConfig } from '../config';
import { checkLink, linkLabel } from '../links';
import { checkQrPayload } from '../qr';
import { escapeXml } from '../sign';
import { avatarLayers, bowlTarget, coinPaths, SCENE_CSS } from './scene';
import { qrSvg } from './qr';
import { streetSvg } from './street';
import type { QrModules } from './svg';

const WIDGET_CSS = `
.td{position:relative;isolation:isolate;overflow:hidden;display:inline-flex;gap:14px;align-items:center;max-width:100%;box-sizing:border-box;padding:12px 14px;background:#1b1830;color:#f4efe1;border:4px solid #2b1d14;box-shadow:4px 4px 0 rgba(0,0,0,.35);font:14px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;text-align:left}
.td *{box-sizing:border-box}
.td-bg{position:absolute;inset:0;z-index:-1;width:100%;height:100%;shape-rendering:crispEdges}
.td-scene{position:relative;flex:none;align-self:flex-end;width:160px;height:160px;padding:0;border:0;background:none;cursor:pointer;font:inherit;color:inherit}
.td-scene:focus-visible{outline:3px solid #f5c542;outline-offset:2px}
.td-scene>svg{display:block;width:100%;height:100%;shape-rendering:crispEdges}
.td-count{position:absolute;top:0;right:0;padding:1px 6px;background:#2b1d14;color:#f5c542;font-size:12px}
.td-count:empty{display:none}
.td-coin{position:absolute;width:12.5%;height:12.5%;pointer-events:none;shape-rendering:crispEdges}
.td-side{min-width:0;max-width:240px}
.td-sign{margin:0 0 10px;padding:8px 10px;background:#c49a63;color:#2b1d14;border:3px solid #5e3b1c;font-weight:700;overflow-wrap:anywhere}
.td-links{display:flex;flex-wrap:wrap;gap:6px}
.td-links a{padding:4px 8px;background:#f5c542;color:#2b1d14;border:2px solid #2b1d14;font-weight:700;text-decoration:none;box-shadow:2px 2px 0 #2b1d14}
.td-links a:hover{background:#ffd866}
.td-links a:active{transform:translate(2px,2px);box-shadow:none}
.td-qr{margin-top:8px}
.td-qr summary{display:inline-block;padding:2px 6px;background:rgba(27,24,48,.85);cursor:pointer;color:#f5c542}
.td-qr svg{display:block;width:150px;height:150px;margin-top:6px}
.td-hint{display:inline-block;margin:8px 0 0;padding:2px 6px;background:rgba(27,24,48,.8);font-size:11px;color:#cfc8de}
@media (max-width:420px){.td{flex-direction:column;align-items:stretch}.td-scene{align-self:center}.td-side{max-width:none}.td-bg{bottom:auto;height:184px}}
${SCENE_CSS}
.td-bowl.td-hop{animation:td-hop .25s}
@keyframes td-hop{50%{transform:translateY(-1.5px)}}
`;

const QR_KIND_LABEL = {
  vietqr: 'VietQR',
  emvco: 'bank',
  paypay: 'PayPay',
  link: 'donate link',
} as const;

export interface WidgetOptions {
  /** Seconds between automatic coin drops (OBS). 0 = only on click. */
  auto?: number;
}

/**
 * Markup for <two-dollars>. Works without JS (static avatar, sign, links);
 * the runtime adds the coin drop, sound and local counter.
 */
export function renderWidgetMarkup(
  config: WidgetConfig,
  qr: QrModules | null = null,
  opts: WidgetOptions = {},
): string {
  const target = bowlTarget(config.avatar);
  const links = config.links
    .map(checkLink)
    .flatMap((r) => (r.ok ? [r] : []))
    .map(
      (r) =>
        `<a href="${escapeXml(r.url)}" target="_blank" rel="noopener noreferrer nofollow">♥ ${escapeXml(linkLabel(r))}</a>`,
    )
    .join('');
  const qrCheck = config.qr ? checkQrPayload(config.qr) : null;
  const qrBlock =
    qr && qrCheck?.ok
      ? `<details class="td-qr"><summary>Show QR (${QR_KIND_LABEL[qrCheck.kind]})</summary>${qrSvg(qr, 150)}</details>`
      : '';
  const auto = opts.auto ? ` data-auto="${Math.max(5, Math.round(opts.auto))}"` : '';

  return `<two-dollars data-key="${counterKey(config)}" data-bowl="${target.x.toFixed(3)},${target.y.toFixed(3)}"${auto}>
<style>${WIDGET_CSS}</style>
<div class="td">
<svg class="td-bg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${streetSvg(120, 48)}</svg>
<button type="button" class="td-scene" aria-label="Drop a pretend coin">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">${avatarLayers(config.avatar)}</svg>
<span class="td-count"></span>
</button>
<div class="td-side">
<p class="td-sign">${escapeXml(config.sign)}</p>
${links ? `<div class="td-links">${links}</div>` : ''}
${qrBlock}
<p class="td-hint">Tap bowl = free fake coin. Real money go straight to me.</p>
</div>
<template class="td-coin-tpl"><svg class="td-coin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4">${coinPaths()}</svg></template>
</div>
</two-dollars>`;
}

/** Copy-paste snippet: markup plus the inline runtime, no external requests. */
export function renderEmbedSnippet(
  config: WidgetConfig,
  runtime: string,
  qr: QrModules | null = null,
): string {
  return `<!-- twodollars widget -->\n${renderWidgetMarkup(config, qr)}\n<script>${safeScript(runtime)}</script>`;
}

/** Standalone page for OBS "Browser source → Local file". Transparent background. */
export function renderObsOverlay(
  config: WidgetConfig,
  runtime: string,
  qr: QrModules | null = null,
  autoSeconds = 30,
): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>twodollars overlay</title>
<style>html,body{margin:0;background:transparent;overflow:hidden}body{padding:16px}two-dollars{zoom:1.6}</style>
</head>
<body>
${renderWidgetMarkup(config, qr, { auto: autoSeconds })}
<script>${safeScript(runtime)}</script>
</body>
</html>
`;
}

/** Prevents a stray "</script" in the runtime from ending the inline tag early. */
function safeScript(js: string): string {
  return js.replace(/<\/script/gi, '<\\/script');
}

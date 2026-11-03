import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, type WidgetConfig } from '../../src/domain/config';
import { displayUrl, readmeMarkdown, renderReadmeSvg } from '../../src/domain/render/svg';
import {
  renderEmbedSnippet,
  renderObsOverlay,
  renderWidgetMarkup,
} from '../../src/domain/render/html';
import { qrSvg } from '../../src/domain/render/qr';

const EVIL = '"><script>alert(1)</script>&';
const cfg: WidgetConfig = {
  ...DEFAULT_CONFIG,
  sign: EVIL,
  links: ['https://ko-fi.com/duke'],
};
const QR = Array.from({ length: 25 }, (_, y) =>
  Array.from({ length: 25 }, (_, x) => (x + y) % 3 === 0),
);

describe('renderReadmeSvg', () => {
  it('escapes the sign everywhere', () => {
    const svg = renderReadmeSvg(cfg);
    expect(svg).not.toContain('<script');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('stays small enough for a README', () => {
    expect(renderReadmeSvg(cfg).length).toBeLessThan(15_000);
    expect(renderReadmeSvg(cfg, QR).length).toBeLessThan(30_000);
  });

  it('widens the card when a QR is included', () => {
    expect(renderReadmeSvg(cfg)).toMatch(/^<svg[^>]+width="480"/);
    expect(renderReadmeSvg(cfg, QR)).toMatch(/^<svg[^>]+width="620"/);
  });

  it('shows the donate target', () => {
    expect(renderReadmeSvg(cfg)).toContain('→ ko-fi.com/duke');
    expect(displayUrl('https://patreon.com/' + 'x'.repeat(50))).toHaveLength(34);
  });
});

describe('readmeMarkdown', () => {
  it('wraps the image in the first donate link', () => {
    expect(readmeMarkdown({ ...cfg, sign: 'Hi [there]' })).toBe(
      '[![Hi there](twodollars.svg)](https://ko-fi.com/duke)',
    );
    expect(readmeMarkdown({ ...cfg, links: [] }, 'a.svg')).toBe(`![${EVIL}](a.svg)`);
  });
});

describe('renderWidgetMarkup', () => {
  it('escapes the sign and only renders valid links with safe rel', () => {
    const html = renderWidgetMarkup({ ...cfg, links: ['https://ko-fi.com/duke', 'javascript:x'] });
    expect(html).not.toContain('<script');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
    expect(html).toContain('♥ Ko-fi');
  });

  it('includes the QR only when the payload is valid', () => {
    expect(renderWidgetMarkup(cfg, QR)).not.toContain('<details');
    const vn = { ...cfg, qr: 'https://ko-fi.com/duke' };
    expect(renderWidgetMarkup(vn, QR)).toContain('Show QR (donate link)');
  });

  it('passes the bowl position and auto interval as data attributes', () => {
    expect(renderWidgetMarkup(cfg)).toMatch(/data-bowl="0\.\d{3},0\.\d{3}"/);
    expect(renderWidgetMarkup(cfg, null, { auto: 1 })).toContain('data-auto="5"');
  });
});

describe('snippets', () => {
  it('neutralizes </script> inside the runtime', () => {
    const out = renderEmbedSnippet(cfg, 'var s = "</script>";');
    expect(out.match(/<\/script>/g)).toHaveLength(1);
  });

  it('OBS overlay is a full transparent page with auto drop', () => {
    const page = renderObsOverlay(cfg, '');
    expect(page.startsWith('<!doctype html>')).toBe(true);
    expect(page).toContain('background:transparent');
    expect(page).toContain('data-auto="30"');
  });
});

describe('qrSvg', () => {
  it('adds a 4-module quiet zone', () => {
    expect(qrSvg([[true]], 90)).toContain('viewBox="0 0 9 9"');
    expect(qrSvg([[true]], 90)).toContain('M4 4h1v1h-1z');
  });
});

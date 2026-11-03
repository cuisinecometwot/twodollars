import { describe, expect, it } from 'vitest';
import { LED_CHAR_W, ledFits, renderLedSign } from '../../src/domain/render/led';

const box = { x: 0, y: 0, w: 244, h: 24 };

describe('LED sign', () => {
  it('keeps short text still and centered', () => {
    const { svg, css } = renderLedSign({ ...box, text: '♥ ko-fi.com/cuisinecometwot' });
    expect(svg).toContain('class="led-still"');
    expect(svg.match(/<text /g)).toHaveLength(1);
    expect(css).toContain('led-flicker');
  });

  it('scrolls long text with two copies one period apart', () => {
    const text = '♥ ko-fi.com/a  ★  patreon.com/b  ★  paypal.me/c';
    const { svg, css } = renderLedSign({ ...box, text });
    const period = [...text].length * LED_CHAR_W + 48;
    expect(svg).toContain('class="led-run"');
    expect(svg.match(/<text /g)).toHaveLength(2);
    expect(svg).toContain(`x="${8 + period}"`);
    expect(css).toContain(`translateX(-${period}px)`);
  });

  it('decides fit by forced character width, not font', () => {
    expect(ledFits('x'.repeat(28), 228)).toBe(true);
    expect(ledFits('x'.repeat(29), 228)).toBe(false);
    expect(renderLedSign({ ...box, text: 'abc' }).svg).toContain(`textLength="${3 * LED_CHAR_W}"`);
  });

  it('escapes the text', () => {
    expect(renderLedSign({ ...box, text: '<b>&' }).svg).toContain('&lt;b&gt;&amp;');
  });
});

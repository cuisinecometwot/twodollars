import { describe, expect, it } from 'vitest';
import { checkQrPayload, crc16ccitt } from '../../src/domain/qr';
import {
  DEFAULT_CONFIG,
  checkConfig,
  counterKey,
  decodeConfig,
  encodeConfig,
  normalizeConfig,
} from '../../src/domain/config';

// Built field-by-field; CRC computed independently with Python binascii.crc_hqx.
const VIETQR =
  '00020101021138540010A00000072701240006970436011001234567890208QRIBFTTA53037045802VN5912NGUYEN VAN A6304E9B9';

describe('crc16ccitt', () => {
  it('matches the CRC-16/CCITT-FALSE check value', () => {
    expect(crc16ccitt('123456789')).toBe('29B1');
  });
});

describe('checkQrPayload', () => {
  it('accepts VietQR and summarizes it with a masked account', () => {
    const r = checkQrPayload(VIETQR);
    expect(r).toMatchObject({ ok: true, kind: 'vietqr' });
    if (r.ok) expect(r.summary).toBe('VietQR · bank 970436 · acct •••6789 · NGUYEN VAN A');
  });

  it('rejects a tampered VietQR', () => {
    expect(checkQrPayload(VIETQR.replace('6789', '6788')).ok).toBe(false);
  });

  it('accepts PayPay and allowlisted links, rejects other URLs', () => {
    expect(checkQrPayload('https://qr.paypay.ne.jp/p2p01_abcDEF123')).toMatchObject({
      kind: 'paypay',
    });
    expect(checkQrPayload('https://ko-fi.com/duke')).toMatchObject({ kind: 'link' });
    expect(checkQrPayload('https://bit.ly/free-money').ok).toBe(false);
    expect(checkQrPayload('hello').ok).toBe(false);
  });
});

describe('config', () => {
  it('round-trips through encode/decode', () => {
    const c = {
      ...DEFAULT_CONFIG,
      sign: 'Xin vía 🍜',
      links: ['https://ko-fi.com/duke'],
      qr: VIETQR,
    };
    expect(decodeConfig(encodeConfig(c))).toEqual(c);
  });

  it('decodes garbage to null', () => {
    expect(decodeConfig('!!!')).toBeNull();
    expect(decodeConfig('')).toBeNull();
  });

  it('normalizes hostile input into something renderable', () => {
    const c = normalizeConfig({
      avatar: { hair: '<script>' },
      sign: 'x'.repeat(200),
      links: ['javascript:alert(1)', 'ko-fi.com/a', 'patreon.com/b', 'paypal.me/c', 'ko-fi.com/d'],
      qr: 'https://evil.example',
    });
    expect(c.avatar.hair).toBe(DEFAULT_CONFIG.avatar.hair);
    expect([...c.sign]).toHaveLength(80);
    expect(c.links).toEqual([
      'https://ko-fi.com/a',
      'https://patreon.com/b',
      'https://paypal.me/c',
    ]);
    expect(c.qr).toBeNull();
  });

  it('warns about non-allowlisted links and missing payment info', () => {
    expect(checkConfig(DEFAULT_CONFIG).warnings).toHaveLength(1);
    const r = checkConfig({ ...DEFAULT_CONFIG, links: ['https://example.com/me'] });
    expect(r.errors).toEqual([]);
    expect(r.warnings[0]).toMatch(/allowlist/);
  });

  it('keys the coin counter by payout target only', () => {
    const a = { ...DEFAULT_CONFIG, links: ['https://ko-fi.com/duke'] };
    expect(counterKey({ ...a, sign: 'other' })).toBe(counterKey(a));
    expect(counterKey({ ...a, links: ['https://ko-fi.com/x'] })).not.toBe(counterKey(a));
  });
});

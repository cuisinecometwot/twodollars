import { checkLink, linkLabel } from './links';

export const QR_MAX = 512;

export type QrCheck =
  | { ok: true; kind: 'vietqr' | 'emvco' | 'paypay' | 'link'; payload: string; summary: string }
  | { ok: false; error: string };

/** CRC-16/CCITT-FALSE, the checksum EMVCo QR uses in tag 63. */
export function crc16ccitt(s: string): string {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++)
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface Tlv {
  tag: string;
  value: string;
}

export function parseTlv(s: string): Tlv[] | null {
  const out: Tlv[] = [];
  let i = 0;
  while (i < s.length) {
    const tag = s.slice(i, i + 2);
    const lenStr = s.slice(i + 2, i + 4);
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lenStr)) return null;
    const len = Number(lenStr);
    const value = s.slice(i + 4, i + 4 + len);
    if (value.length !== len) return null;
    out.push({ tag, value });
    i += 4 + len;
  }
  return out;
}

const get = (tlv: Tlv[], tag: string) => tlv.find((t) => t.tag === tag)?.value;

function mask(account: string): string {
  return account.length <= 4 ? account : '•••' + account.slice(-4);
}

function checkEmvco(s: string): QrCheck {
  const tlv = parseTlv(s);
  if (!tlv || tlv[0]?.tag !== '00' || tlv[0].value !== '01')
    return { ok: false, error: 'QR look like bank QR but format broken.' };
  const last = tlv[tlv.length - 1]!;
  if (last.tag !== '63' || last.value.length !== 4)
    return { ok: false, error: 'Bank QR missing checksum.' };
  if (crc16ccitt(s.slice(0, -4)) !== last.value.toUpperCase())
    return { ok: false, error: 'Bank QR checksum wrong. Maybe edited?' };

  const name = get(tlv, '59');
  const vn = get(tlv, '38');
  if (vn?.includes('A000000727')) {
    const sub = parseTlv(vn) ?? [];
    const bene = parseTlv(get(sub, '01') ?? '') ?? [];
    const bin = get(bene, '00');
    const acct = get(bene, '01');
    const parts = ['VietQR', bin && `bank ${bin}`, acct && `acct ${mask(acct)}`, name];
    return { ok: true, kind: 'vietqr', payload: s, summary: parts.filter(Boolean).join(' · ') };
  }
  return {
    ok: true,
    kind: 'emvco',
    payload: s,
    summary: ['Bank transfer QR', name, get(tlv, '58')].filter(Boolean).join(' · '),
  };
}

/**
 * Only payment QRs are accepted: EMVCo bank transfers (VietQR etc.), PayPay,
 * or a link to an allowlisted donate platform. The decoded string is stored
 * and the QR redrawn from it, so a hidden phishing URL can't sneak through.
 */
export function checkQrPayload(raw: string): QrCheck {
  const s = raw.trim();
  if (!s) return { ok: false, error: 'QR is empty.' };
  if (s.length > QR_MAX) return { ok: false, error: 'QR too long.' };
  if (/^000201/.test(s)) return checkEmvco(s);
  if (/^https:\/\/qr\.paypay\.ne\.jp\/[A-Za-z0-9_-]+$/.test(s))
    return { ok: true, kind: 'paypay', payload: s, summary: 'PayPay' };
  const link = checkLink(s);
  if (link.ok && link.platform && /^https:\/\//i.test(s))
    return { ok: true, kind: 'link', payload: link.url, summary: linkLabel(link) };
  return { ok: false, error: 'Only bank QR (VietQR), PayPay or donate-site QR allowed.' };
}

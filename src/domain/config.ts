import { DEFAULT_AVATAR, normalizeAvatar, type AvatarConfig } from './avatar/compose';
import { base64urlDecode, base64urlEncode, shortHash, utf8Decode, utf8Encode } from './encoding';
import { MAX_LINKS, checkLink } from './links';
import { checkQrPayload } from './qr';
import { SAMPLE_SIGNS, SIGN_MAX, checkSign, cleanSign } from './sign';

export interface WidgetConfig {
  v: 1;
  avatar: AvatarConfig;
  sign: string;
  /** Normalized https URLs. */
  links: string[];
  /** Decoded QR payload, never an image. */
  qr: string | null;
}

export const DEFAULT_CONFIG: WidgetConfig = {
  v: 1,
  avatar: DEFAULT_AVATAR,
  sign: SAMPLE_SIGNS[0]!,
  links: [],
  qr: null,
};

export interface ConfigIssues {
  errors: string[];
  warnings: string[];
}

/** Strict check for the editor UI: tells the user what is wrong. */
export function checkConfig(c: WidgetConfig): ConfigIssues {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sign = checkSign(c.sign);
  if (!sign.ok) errors.push(sign.error);
  if (c.links.length > MAX_LINKS) errors.push(`Max ${MAX_LINKS} link only.`);
  c.links.forEach((l, i) => {
    const r = checkLink(l);
    if (!r.ok) errors.push(`Link ${i + 1}: ${r.error}`);
    else if (!r.platform)
      warnings.push(
        `Link ${i + 1}: ${r.host} not in Street allowlist. OK for your own widget only.`,
      );
  });
  if (c.qr !== null) {
    const q = checkQrPayload(c.qr);
    if (!q.ok) errors.push(`QR: ${q.error}`);
  }
  if (c.links.length === 0 && c.qr === null)
    warnings.push('No link, no QR. People want give money but no way. Sad.');
  return { errors, warnings };
}

/**
 * Lenient: turns anything (URL hash, old saves) into a renderable config,
 * dropping or trimming what is invalid instead of failing.
 */
export function normalizeConfig(input: unknown): WidgetConfig {
  const o = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const avatar = normalizeAvatar(
    (typeof o.avatar === 'object' && o.avatar !== null ? o.avatar : {}) as Record<string, unknown>,
  );
  const rawSign = typeof o.sign === 'string' ? cleanSign(o.sign) : '';
  const sign = rawSign ? [...rawSign].slice(0, SIGN_MAX).join('') : DEFAULT_CONFIG.sign;
  const links = (Array.isArray(o.links) ? o.links : [])
    .filter((l): l is string => typeof l === 'string')
    .map(checkLink)
    .flatMap((r) => (r.ok ? [r.url] : []))
    .slice(0, MAX_LINKS);
  const q = typeof o.qr === 'string' ? checkQrPayload(o.qr) : null;
  return { v: 1, avatar, sign, links, qr: q?.ok ? q.payload : null };
}

export function encodeConfig(c: WidgetConfig): string {
  return base64urlEncode(utf8Encode(JSON.stringify(c)));
}

export function decodeConfig(s: string): WidgetConfig | null {
  try {
    return normalizeConfig(JSON.parse(utf8Decode(base64urlDecode(s))));
  } catch {
    return null;
  }
}

/** Keys the widget's local coin counter to who receives the money, not to cosmetic edits. */
export function counterKey(c: WidgetConfig): string {
  return shortHash([...c.links, c.qr ?? ''].join('|') || 'nobody');
}

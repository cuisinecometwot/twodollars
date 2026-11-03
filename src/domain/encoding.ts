// UTF-8 + base64url implemented with plain ECMAScript so domain/ needs no
// TextEncoder/btoa (those are host APIs, not part of the language).

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export function utf8Encode(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else
      out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}

export function utf8Decode(bytes: readonly number[]): string {
  let s = '';
  for (let i = 0; i < bytes.length;) {
    const b = bytes[i]!;
    let c: number;
    let n: number;
    if (b < 0x80) [c, n] = [b, 0];
    else if (b >> 5 === 6) [c, n] = [b & 31, 1];
    else if (b >> 4 === 14) [c, n] = [b & 15, 2];
    else if (b >> 3 === 30) [c, n] = [b & 7, 3];
    else throw new Error('Invalid UTF-8');
    for (let j = 1; j <= n; j++) {
      const cb = bytes[i + j];
      if (cb === undefined || cb >> 6 !== 2) throw new Error('Invalid UTF-8');
      c = (c << 6) | (cb & 63);
    }
    s += String.fromCodePoint(c);
    i += n + 1;
  }
  return s;
}

export function base64urlEncode(bytes: readonly number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b, c] = [bytes[i]!, bytes[i + 1], bytes[i + 2]];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]!;
    if (b !== undefined) out += B64[(n >> 6) & 63]!;
    if (c !== undefined) out += B64[n & 63]!;
  }
  return out;
}

export function base64urlDecode(s: string): number[] {
  const out: number[] = [];
  let buf = 0;
  let bits = 0;
  for (const ch of s) {
    const v = B64.indexOf(ch);
    if (v < 0) throw new Error('Invalid base64url');
    buf = (buf << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buf >> bits) & 255);
    }
  }
  return out;
}

/** Short stable hash (FNV-1a) used to key a widget's local coin counter. */
export function shortHash(s: string): string {
  let h = 0x811c9dc5;
  for (const b of utf8Encode(s)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

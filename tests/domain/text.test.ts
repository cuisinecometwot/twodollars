import { describe, expect, it } from 'vitest';
import {
  checkSign,
  cleanSign,
  escapeXml,
  signLength,
  wrapText,
  SIGN_MAX,
} from '../../src/domain/sign';
import { checkLink } from '../../src/domain/links';
import {
  base64urlDecode,
  base64urlEncode,
  utf8Decode,
  utf8Encode,
} from '../../src/domain/encoding';

describe('sign', () => {
  it('counts code points, not UTF-16 units', () => {
    expect(signLength('bánh mì 🍜')).toBe(9);
  });

  it('rejects empty and too-long signs', () => {
    expect(checkSign('   ').ok).toBe(false);
    expect(checkSign('a'.repeat(SIGN_MAX)).ok).toBe(true);
    expect(checkSign('a'.repeat(SIGN_MAX + 1)).ok).toBe(false);
  });

  it('collapses whitespace and control chars', () => {
    expect(cleanSign('  hi\n\tthere\u0007 ')).toBe('hi there');
  });

  it('composes decomposed Vietnamese so diacritics count once', () => {
    const nfd = 'Xin vía'.normalize('NFD');
    expect(signLength(cleanSign(nfd))).toBe(7);
  });

  it('escapes XML special chars', () => {
    expect(escapeXml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });

  it('wraps words, splits long words, and ellipsizes overflow', () => {
    expect(wrapText('one two three four', 9, 5)).toEqual(['one two', 'three', 'four']);
    expect(wrapText('abcdefghij', 4, 5)).toEqual(['abcd', 'efgh', 'ij']);
    expect(wrapText('aa bb cc dd', 2, 2)).toEqual(['aa', 'b…']);
  });
});

describe('checkLink', () => {
  it('accepts allowlisted platforms and normalizes', () => {
    const r = checkLink('Ko-fi.com/duke');
    expect(r).toMatchObject({ ok: true, url: 'https://ko-fi.com/duke', platform: { id: 'kofi' } });
  });

  it('only allows github.com/sponsors/<name>', () => {
    expect(checkLink('https://github.com/sponsors/duke')).toMatchObject({
      platform: { id: 'ghs' },
    });
    expect(checkLink('https://github.com/duke')).toMatchObject({ ok: true, platform: null });
    expect(checkLink('https://github.com/sponsors/')).toMatchObject({ platform: null });
  });

  it('does not match lookalike hosts', () => {
    expect(checkLink('https://ko-fi.com.evil.io/x')).toMatchObject({ ok: true, platform: null });
    expect(checkLink('https://evilko-fi.com/x')).toMatchObject({ ok: true, platform: null });
  });

  it('rejects http, junk and quotes', () => {
    expect(checkLink('http://ko-fi.com/x').ok).toBe(false);
    expect(checkLink('javascript:alert(1)').ok).toBe(false);
    expect(checkLink('https://ko-fi.com/"onmouseover=').ok).toBe(false);
    expect(checkLink('').ok).toBe(false);
  });
});

describe('encoding', () => {
  it('round-trips UTF-8 through base64url', () => {
    for (const s of ['', 'a', 'ab', 'abc', 'Phố Xin Vía 🍜 二ドル']) {
      const b = utf8Encode(s);
      expect(utf8Decode(base64urlDecode(base64urlEncode(b)))).toBe(s);
    }
  });

  it('matches the platform base64url output', () => {
    const s = 'Phố Xin Vía 🍜?>';
    expect(base64urlEncode(utf8Encode(s))).toBe(Buffer.from(s).toString('base64url'));
  });
});

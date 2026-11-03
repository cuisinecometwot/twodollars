export const SIGN_MAX = 80;

export const SAMPLE_SIGNS: readonly string[] = [
  'Spare one bowl of noodle for dev pls',
  'Code no bug. Wallet also no money.',
  'Will debug for bánh mì',
  'Two dollar only. Not three. Two.',
  'Mom say get real job. This is job.',
  'One coin = one less console.log',
  'Work hard 10 year, now sit here. Very senior.',
  'Free to look, 2$ to make me smile',
  'Me write open source, open source no write me money',
  'Coffee empty. Heart full. Bowl also empty.',
];

/** Length in user-perceived characters, not UTF-16 units, so Vietnamese/emoji count fairly. */
export function signLength(text: string): number {
  return [...text].length;
}

export function cleanSign(text: string): string {
  // Collapse whitespace and drop control characters; a sign is one short line of text.
  return (
    text
      .normalize('NFC')
      // eslint-disable-next-line no-control-regex -- stripping control chars is the point
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export type SignCheck = { ok: true; text: string } | { ok: false; error: string };

export function checkSign(text: string): SignCheck {
  const t = cleanSign(text);
  if (!t) return { ok: false, error: 'Sign is empty. Write something pls.' };
  if (signLength(t) > SIGN_MAX)
    return { ok: false, error: `Sign too long, max ${SIGN_MAX} letter.` };
  return { ok: true, text: t };
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Greedy word wrap; words longer than a line are hard-split. */
export function wrapText(text: string, width: number, maxLines: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(' ')) {
    let w = word;
    while (signLength(w) > width) {
      if (cur) {
        lines.push(cur);
        cur = '';
      }
      const chars = [...w];
      lines.push(chars.slice(0, width).join(''));
      w = chars.slice(width).join('');
    }
    if (!cur) cur = w;
    else if (signLength(cur) + 1 + signLength(w) <= width) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    const last = [...kept[maxLines - 1]!];
    kept[maxLines - 1] = last.slice(0, Math.max(0, width - 1)).join('') + '…';
    return kept;
  }
  return lines;
}

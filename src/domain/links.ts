export interface Platform {
  id: string;
  label: string;
  hosts: readonly string[];
  /** Required path prefix, e.g. GitHub only allows /sponsors. */
  pathPrefix?: string;
}

/** Same allowlist the Street will enforce (see design doc, Moderation). */
export const PLATFORMS: readonly Platform[] = [
  { id: 'bmc', label: 'Buy Me a Coffee', hosts: ['buymeacoffee.com', 'www.buymeacoffee.com'] },
  { id: 'kofi', label: 'Ko-fi', hosts: ['ko-fi.com', 'www.ko-fi.com'] },
  { id: 'ghs', label: 'GitHub Sponsors', hosts: ['github.com'], pathPrefix: '/sponsors/' },
  { id: 'paypal', label: 'PayPal', hosts: ['paypal.me', 'www.paypal.me'] },
  { id: 'patreon', label: 'Patreon', hosts: ['patreon.com', 'www.patreon.com'] },
];

export const MAX_LINKS = 3;

export type LinkCheck =
  { ok: true; url: string; platform: Platform | null; host: string } | { ok: false; error: string };

// Hand-rolled instead of the URL class so domain/ stays pure ECMAScript.
const URL_RE = /^https:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)+)(\/[^\s"'<>]*)?$/i;

export function checkLink(raw: string): LinkCheck {
  let s = raw.trim();
  if (!s) return { ok: false, error: 'Link is empty.' };
  if (!/^[a-z]+:\/\//i.test(s)) s = 'https://' + s;
  if (/^http:\/\//i.test(s)) return { ok: false, error: 'Need https link, not http.' };
  if (s.length > 300) return { ok: false, error: 'Link too long.' };
  const m = URL_RE.exec(s);
  if (!m) return { ok: false, error: 'This not look like a link.' };
  const host = m[1]!.toLowerCase();
  const path = m[2] ?? '/';
  const url = `https://${host}${path}`;
  const platform =
    PLATFORMS.find(
      (p) =>
        p.hosts.includes(host) &&
        (!p.pathPrefix || (path.startsWith(p.pathPrefix) && path.length > p.pathPrefix.length)),
    ) ?? null;
  return { ok: true, url, platform, host };
}

export function linkLabel(check: Extract<LinkCheck, { ok: true }>): string {
  return check.platform?.label ?? check.host;
}

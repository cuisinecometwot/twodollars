import { useState } from 'react';
import { MAX_LINKS, checkLink, linkLabel } from '../../domain/links';
import { checkQrPayload } from '../../domain/qr';
import { decodeQrImage } from '../qr';

function LinkStatus({ value }: { value: string }) {
  if (!value.trim()) return null;
  const r = checkLink(value);
  if (!r.ok) return <small className="bad">✗ {r.error}</small>;
  if (!r.platform)
    return <small className="warn">⚠ {r.host}: OK here, but Street not accept</small>;
  return <small className="good">✓ {linkLabel(r)}</small>;
}

export function MoneyEditor({
  links,
  qr,
  onLinks,
  onQr,
}: {
  links: string[];
  qr: string | null;
  onLinks: (l: string[]) => void;
  onQr: (q: string | null) => void;
}) {
  const [qrError, setQrError] = useState('');
  const [paste, setPaste] = useState('');
  const qrInfo = qr ? checkQrPayload(qr) : null;

  const acceptQr = (raw: string | null) => {
    if (!raw) return setQrError('No QR found in picture. Try crop closer?');
    const r = checkQrPayload(raw);
    if (!r.ok) return setQrError(r.error);
    setQrError('');
    setPaste('');
    onQr(r.payload);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      acceptQr(await decodeQrImage(file));
    } catch {
      setQrError('Cannot read this picture.');
    }
  };

  return (
    <div className="stack">
      <p className="muted">
        We never touch money. Money go straight from kind person to you. Allowlist: Buy Me a Coffee,
        Ko-fi, GitHub Sponsors, PayPal.me, Patreon.
      </p>
      {links.map((l, i) => (
        <div key={i} className="field">
          <span>Donate link {i + 1}</span>
          <div className="row">
            <input
              type="url"
              inputMode="url"
              placeholder="ko-fi.com/your-name"
              value={l}
              onChange={(e) => onLinks(links.map((x, j) => (j === i ? e.target.value : x)))}
            />
            {links.length > 1 && (
              <button
                type="button"
                className="btn btn-small"
                aria-label={`Remove link ${i + 1}`}
                onClick={() => onLinks(links.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            )}
          </div>
          <LinkStatus value={l} />
        </div>
      ))}
      {links.length < MAX_LINKS && (
        <button type="button" className="btn btn-small" onClick={() => onLinks([...links, ''])}>
          + One more link
        </button>
      )}

      <div className="field">
        <span>QR (VietQR, PayPay, or donate site)</span>
        {qrInfo?.ok ? (
          <div className="row-between">
            <small className="good">✓ {qrInfo.summary}</small>
            <button type="button" className="btn btn-small" onClick={() => onQr(null)}>
              Remove QR
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                void onFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <div className="row">
              <input
                type="text"
                placeholder="…or paste QR text (000201…)"
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-small"
                disabled={!paste.trim()}
                onClick={() => acceptQr(paste)}
              >
                Use
              </button>
            </div>
            <small className="muted">
              Picture read inside your browser only. We keep the text and redraw the QR, never the
              picture.
            </small>
          </>
        )}
        {qrError && <small className="bad">✗ {qrError}</small>}
      </div>
    </div>
  );
}

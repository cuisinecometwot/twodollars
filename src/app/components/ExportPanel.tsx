import { useEffect, useMemo, useState } from 'react';
import type { WidgetConfig } from '../../domain/config';
import { renderEmbedSnippet, renderObsOverlay } from '../../domain/render/html';
import {
  README_FILENAME,
  readmeMarkdown,
  renderReadmeSvg,
  type QrModules,
} from '../../domain/render/svg';
import runtime from '../../widget/runtime.js?raw';
import { copyText, downloadText } from '../files';

type Tab = 'readme' | 'html' | 'obs';

const TABS: { id: Tab; label: string }[] = [
  { id: 'readme', label: 'GitHub README' },
  { id: 'html', label: 'Your website' },
  { id: 'obs', label: 'OBS stream' },
];

function CopyBox({ text, label }: { text: string; label: string }) {
  // Result is tied to the text that was copied, so editing resets the label.
  const [copied, setCopied] = useState<{ text: string; ok: boolean } | null>(null);
  const state = copied?.text === text ? (copied.ok ? 'ok' : 'fail') : 'idle';
  return (
    <div className="copybox">
      <textarea
        readOnly
        value={text}
        rows={4}
        aria-label={label}
        onFocus={(e) => e.target.select()}
      />
      <button
        type="button"
        className="btn"
        onClick={async () => setCopied({ text, ok: await copyText(text) })}
      >
        {state === 'ok' ? 'Copied ok!' : state === 'fail' ? 'Copy fail, use Ctrl+C' : 'Copy'}
      </button>
    </div>
  );
}

export function ExportPanel({ config, qr }: { config: WidgetConfig; qr: QrModules | null }) {
  const [tab, setTab] = useState<Tab>('readme');
  const svg = useMemo(() => renderReadmeSvg(config, qr), [config, qr]);
  const svgUrl = useMemo(
    () => URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })),
    [svg],
  );
  useEffect(() => () => URL.revokeObjectURL(svgUrl), [svgUrl]);

  return (
    <div className="stack">
      <div role="tablist" aria-label="Export type" className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className="tab"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="stack">
        {tab === 'readme' && (
          <>
            <img className="readme-preview" src={svgUrl} alt="README card preview" />
            <ol className="steps">
              <li>
                <button
                  type="button"
                  className="btn"
                  onClick={() => downloadText(README_FILENAME, svg, 'image/svg+xml')}
                >
                  ⬇ Download {README_FILENAME}
                </button>{' '}
                ({(svg.length / 1024).toFixed(1)} KB)
              </li>
              <li>Put it in your profile repo (github.com/you/you).</li>
              <li>Paste this in README.md. GitHub no run JS, so click go straight to your link:</li>
            </ol>
            <CopyBox text={readmeMarkdown(config)} label="README markdown" />
          </>
        )}
        {tab === 'html' && (
          <>
            <p className="muted">
              One copy-paste, no server, no tracking. Tap bowl = coin fall + <i>cạch</i>. Coin count
              only save in visitor browser.
            </p>
            <CopyBox text={renderEmbedSnippet(config, runtime, qr)} label="HTML snippet" />
          </>
        )}
        {tab === 'obs' && (
          <>
            <ol className="steps">
              <li>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    downloadText(
                      'twodollars-obs.html',
                      renderObsOverlay(config, runtime, qr),
                      'text/html',
                    )
                  }
                >
                  ⬇ Download overlay
                </button>
              </li>
              <li>OBS → Sources → + → Browser → tick “Local file” → pick the file.</li>
              <li>
                Size 800 × 400. Background already transparent. Coin drop by itself every 30s.
              </li>
            </ol>
          </>
        )}
      </div>
    </div>
  );
}

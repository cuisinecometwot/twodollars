import { useMemo, type ReactNode } from 'react';
import { AvatarEditor } from './components/AvatarEditor';
import { ExportPanel } from './components/ExportPanel';
import { MoneyEditor } from './components/MoneyEditor';
import { Preview } from './components/Preview';
import { SignEditor } from './components/SignEditor';
import { qrModules } from './qr';
import { useDraft } from './useDraft';

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="panel" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`}>
        <span className="step-n">{n}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export default function App() {
  const { draft, setDraft, config, issues } = useDraft();
  const qr = useMemo(() => (config.qr ? qrModules(config.qr) : null), [config.qr]);

  return (
    <>
      <header className="masthead">
        <h1>
          two<span>dollars</span>
        </h1>
        <p>Make own begging bowl. Put on GitHub. Wait for coin.</p>
      </header>

      <main className="layout">
        <div className="editor">
          <Step n={1} title="Make face">
            <AvatarEditor
              avatar={draft.avatar}
              onChange={(avatar) => setDraft({ ...draft, avatar })}
            />
          </Step>
          <Step n={2} title="Write sign">
            <SignEditor sign={draft.sign} onChange={(sign) => setDraft({ ...draft, sign })} />
          </Step>
          <Step n={3} title="Where money go">
            <MoneyEditor
              links={draft.links}
              qr={draft.qr}
              onLinks={(links) => setDraft({ ...draft, links })}
              onQr={(q) => setDraft({ ...draft, qr: q })}
            />
          </Step>
        </div>

        <div className="stage">
          <section className="panel street" aria-label="Preview">
            <Preview config={config} qr={qr} />
          </section>
          {(issues.errors.length > 0 || issues.warnings.length > 0) && (
            <ul className="issues" aria-live="polite">
              {issues.errors.map((e) => (
                <li key={e} className="bad">
                  ✗ {e}
                </li>
              ))}
              {issues.warnings.map((w) => (
                <li key={w} className="warn">
                  ⚠ {w}
                </li>
              ))}
            </ul>
          )}
          <Step n={4} title="Take home">
            <ExportPanel config={config} qr={qr} />
          </Step>
          <button type="button" className="btn btn-street" disabled>
            🏮 Sit on the Street: coming soon, street still under construction
          </button>
        </div>
      </main>

      <footer className="footer">
        No server. No cookie. No commission. Only vía. · Edit saved in the link, bookmark it.
      </footer>
    </>
  );
}

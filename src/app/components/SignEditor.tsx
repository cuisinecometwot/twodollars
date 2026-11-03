import { SAMPLE_SIGNS, SIGN_MAX, signLength } from '../../domain/sign';

export function SignEditor({ sign, onChange }: { sign: string; onChange: (s: string) => void }) {
  const len = signLength(sign);
  const nextIdea = () => {
    const i = SAMPLE_SIGNS.indexOf(sign);
    onChange(SAMPLE_SIGNS[(i + 1) % SAMPLE_SIGNS.length]!);
  };
  return (
    <div className="stack">
      <label className="field">
        <span>Your sign</span>
        <textarea
          rows={2}
          value={sign}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby="sign-help"
        />
      </label>
      <div className="row-between">
        <small id="sign-help" className={len > SIGN_MAX ? 'bad' : 'muted'}>
          {len}/{SIGN_MAX} · Funny, self-joke. No sad story, no charity, no phone number pls.
        </small>
        <button type="button" className="btn btn-small" onClick={nextIdea}>
          💡 Give me idea
        </button>
      </div>
    </div>
  );
}

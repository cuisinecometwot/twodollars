import { useMemo } from 'react';
import {
  composeAvatar,
  gridToPaths,
  randomAvatar,
  type AvatarConfig,
} from '../../domain/avatar/compose';
import { HAIR_COLORS, SHIRT_COLORS, SKIN_TONES, type Swatch } from '../../domain/avatar/palette';
import { PARTS, SLOTS, type Slot } from '../../domain/avatar/parts';

const SLOT_TITLES: Record<Slot, string> = {
  hair: 'Hair',
  shirt: 'Shirt',
  bowl: 'Bowl',
  mat: 'Sit on',
  pet: 'Friend',
  instrument: 'Hold',
};

const COLOR_ROWS: {
  key: 'skin' | 'hairColor' | 'shirtColor';
  title: string;
  list: readonly Swatch[];
}[] = [
  { key: 'skin', title: 'Skin', list: SKIN_TONES },
  { key: 'hairColor', title: 'Hair color', list: HAIR_COLORS },
  { key: 'shirtColor', title: 'Shirt color', list: SHIRT_COLORS },
];

function Thumb({ avatar }: { avatar: AvatarConfig }) {
  const paths = useMemo(() => gridToPaths(composeAvatar(avatar)), [avatar]);
  return (
    <svg
      className="thumb"
      viewBox="0 0 32 32"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}

export function AvatarEditor({
  avatar,
  onChange,
}: {
  avatar: AvatarConfig;
  onChange: (a: AvatarConfig) => void;
}) {
  return (
    <div className="stack">
      <div className="row-between">
        <p className="muted">Pick piece by piece. No upload, so nobody can put weird picture.</p>
        <button type="button" className="btn" onClick={() => onChange(randomAvatar(Math.random))}>
          🎲 Random me pls
        </button>
      </div>

      {COLOR_ROWS.map(({ key, title, list }) => (
        <fieldset key={key} className="swatches">
          <legend>{title}</legend>
          {list.map((s) => (
            <label key={s.id} className="swatch" title={s.label}>
              <input
                type="radio"
                name={key}
                value={s.id}
                checked={avatar[key] === s.id}
                onChange={() => onChange({ ...avatar, [key]: s.id })}
              />
              <span
                style={{ background: `linear-gradient(135deg, ${s.base} 60%, ${s.shade} 60%)` }}
              />
              <span className="sr-only">{s.label}</span>
            </label>
          ))}
        </fieldset>
      ))}

      {SLOTS.map((slot) => (
        <fieldset key={slot} className="parts">
          <legend>{SLOT_TITLES[slot]}</legend>
          {PARTS[slot].map((p) => (
            <label key={p.id} className="part">
              <input
                type="radio"
                name={slot}
                value={p.id}
                checked={avatar[slot] === p.id}
                onChange={() => onChange({ ...avatar, [slot]: p.id })}
              />
              <Thumb avatar={{ ...avatar, [slot]: p.id }} />
              <span>{p.label}</span>
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

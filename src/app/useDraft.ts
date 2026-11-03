import { useEffect, useMemo, useState } from 'react';
import type { AvatarConfig } from '../domain/avatar/compose';
import {
  DEFAULT_CONFIG,
  checkConfig,
  decodeConfig,
  encodeConfig,
  normalizeConfig,
} from '../domain/config';

/** What the user is typing; may be invalid. The rendered config is derived from it. */
export interface Draft {
  avatar: AvatarConfig;
  sign: string;
  links: string[];
  qr: string | null;
}

function initialDraft(): Draft {
  const fromHash = decodeConfig(location.hash.slice(1));
  const c = fromHash ?? DEFAULT_CONFIG;
  return { avatar: c.avatar, sign: c.sign, links: c.links.length ? c.links : [''], qr: c.qr };
}

export function useDraft() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const filledLinks = draft.links.map((l) => l.trim()).filter(Boolean);

  const config = useMemo(
    () => normalizeConfig({ ...draft, links: filledLinks }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filledLinks is derived from draft
    [draft],
  );
  const issues = useMemo(
    () => checkConfig({ ...config, sign: draft.sign, links: filledLinks }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filledLinks is derived from draft
    [config, draft.sign, draft.links],
  );

  // The URL hash is the save file: bookmark it to come back and edit later.
  useEffect(() => {
    history.replaceState(null, '', '#' + encodeConfig(config));
  }, [config]);

  return { draft, setDraft, config, issues };
}

# twodollars (Phố Xin Vía)

Meme-style online begging: everyone gets a pixel avatar, a bowl, a sign and their own donate link. The site never touches money and runs on free tiers only. Full design: `Phố Xin Vía — Tài liệu thiết kế.md`.

**Current goal:** Phase 0 — personal widget generated in the browser (no backend), embedded on Duke's GitHub profile to test traction.

## Product
- **User:** devs/creators who want a funny "spare a coin" widget on their GitHub README, site or stream.
- **Problem:** donate buttons are boring; asking for money feels awkward. A self-deprecating beggar avatar makes it a joke.
- **Solution:** compose a pixel beggar (hair, shirt, bowl, mat, pet, instrument), write a sign, add donate links / QR, export as HTML Web Component, README SVG, or OBS overlay.
- **MVP (Phase 0):** avatar part set, in-browser generator, 3 exports, coin-drop + "cạch" sound, local-only coin counter. "Post to Street" stub.
- **Engagement:** one-off utility for Phase 0; the shared street (Phase 1+) is the retained part.
- **Audience/language:** international; UI copy in Vietnamese-style broken English.
- **Non-profit:** no money handled, no commission, no revenue. Success metric: stars/forks/embeds after Duke's profile goes live.
- **Payments allowed:** allowlisted donate domains (buymeacoffee.com, ko-fi.com, github.com/sponsors, paypal.me, patreon.com) + VietQR/EMVCo + PayPay QR.
- **UI:** dark street-at-night palette, warm lantern accent, pixel art (32×32 grid), "Press Start 2P" headings. Desktop + mobile browsers.
- **Deploy:** localhost for now; Cloudflare Pages later (domain undecided).

## Stack & architecture
- React + Vite + TypeScript; Vitest; ESLint + Prettier.
- `src/domain/` — pure TS (no DOM, no third-party; enforced by ESLint): avatar parts/compose, config, sign, links, QR payload validation, SVG/HTML renderers.
- `src/widget/runtime.js` — vanilla `<two-dollars>` custom element, inlined into exports via `?raw` so snippets are self-contained.
- `src/app/` — React generator UI. Third-party libs live here only (`jsqr` decode, `qrcode-generator` redraw).

## Progress
- Done: scaffold.
- Next: domain, widget runtime + renderers, generator UI.

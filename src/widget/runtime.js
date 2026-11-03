// @ts-check
// <two-dollars> runtime. Inlined into exported snippets, so: no imports, no
// network, tiny. Markup is rendered by domain/render/html.ts; this only adds
// the coin drop, the "cạch" sound and a counter kept in localStorage.
(() => {
  if (customElements.get('two-dollars')) return;

  /** @type {AudioContext | null} */
  let audio = null;

  function clink() {
    try {
      audio = audio || new AudioContext();
      const ctx = audio;
      const t = ctx.currentTime;
      // Short noise burst = the "c" of cạch; two bright tones = the coin ring.
      const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      const band = ctx.createBiquadFilter();
      const ng = ctx.createGain();
      src.buffer = noise;
      band.type = 'bandpass';
      band.frequency.value = 3200;
      ng.gain.value = 0.5;
      src.connect(band).connect(ng).connect(ctx.destination);
      src.start(t);
      for (const [f, d] of /** @type {const} */ ([
        [1980, 0.01],
        [2960, 0.05],
      ])) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.exponentialRampToValueAtTime(0.22, t + d + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.22);
        o.connect(g).connect(ctx.destination);
        o.start(t + d);
        o.stop(t + d + 0.25);
      }
    } catch {
      // No audio is fine; the coin still drops.
    }
  }

  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  class TwoDollars extends HTMLElement {
    constructor() {
      super();
      this.count = 0;
      /** @type {number | undefined} */
      this.timer = undefined;
    }

    connectedCallback() {
      // A second widget on the same page is upgraded before its children are
      // parsed, so wait for the document when it is still loading.
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup(), { once: true });
      } else this.setup();
    }

    disconnectedCallback() {
      clearInterval(this.timer);
    }

    get storageKey() {
      return 'twodollars:' + (this.dataset.key || 'x');
    }

    setup() {
      if (this.shadowRoot || !this.isConnected) return;
      const root = this.attachShadow({ mode: 'open' });
      // Move markup into the shadow root so host-page CSS can't break it.
      root.append(...this.childNodes);
      try {
        this.count = Number(localStorage.getItem(this.storageKey)) || 0;
      } catch {
        this.count = 0;
      }
      this.showCount();
      root.querySelector('.td-scene')?.addEventListener('click', () => this.drop());
      const auto = Number(this.dataset.auto);
      if (auto > 0) this.timer = window.setInterval(() => this.drop(), auto * 1000);
    }

    showCount() {
      const el = this.shadowRoot?.querySelector('.td-count');
      if (el) el.textContent = this.count ? '×' + this.count : '';
    }

    land() {
      clink();
      this.count++;
      try {
        localStorage.setItem(this.storageKey, String(this.count));
      } catch {
        // Private mode etc.: counter just won't persist.
      }
      this.showCount();
      const bowl = this.shadowRoot?.querySelector('.td-bowl');
      if (bowl) {
        bowl.classList.remove('td-hop');
        requestAnimationFrame(() => bowl.classList.add('td-hop'));
      }
    }

    drop() {
      const root = this.shadowRoot;
      const scene = root?.querySelector('.td-scene');
      const tpl = root?.querySelector('template.td-coin-tpl');
      if (!scene || !(tpl instanceof HTMLTemplateElement) || reducedMotion()) {
        this.land();
        return;
      }
      const [bx = 0.8, by = 0.75] = (this.dataset.bowl || '').split(',').map(Number);
      const coin = /** @type {SVGElement} */ (tpl.content.firstElementChild?.cloneNode(true));
      if (!coin) return this.land();
      coin.style.left = `${bx * 100 - 6.25}%`;
      // Small random wobble so repeated taps don't look copy-pasted.
      const wobble = (Math.random() - 0.5) * 4;
      scene.append(coin);
      const anim = coin.animate(
        [
          { top: '-14%', opacity: 0, transform: `translateX(${wobble}px)` },
          { top: '-4%', opacity: 1, offset: 0.15 },
          { top: `${by * 100 - 12.5}%`, opacity: 1, transform: 'translateX(0)' },
        ],
        { duration: 480, easing: 'cubic-bezier(.5,0,1,1)' },
      );
      anim.onfinish = () => {
        coin.remove();
        this.land();
      };
    }
  }

  customElements.define('two-dollars', TwoDollars);
})();

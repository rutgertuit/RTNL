/**
 * Footer — Invitation to Growth (the closing stage of the Tuit Post structure).
 * Server component.
 */
export function Footer() {
  return (
    <footer className="rt-footer" id="contact">
      <div className="container">
        <div className="rt-footer__invite">
          <div className="eyebrow eyebrow--warm">END / INVITATION</div>
          <h2 className="rt-footer__headline">
            Working on something similar? Tell me.
          </h2>
          <a className="button button--warm rt-footer__cta" href="mailto:rutger@rutgertuit.nl">
            rutger@rutgertuit.nl <span aria-hidden>→</span>
          </a>
        </div>

        <div className="rt-footer__meta">
          <div className="rt-footer__meta-col">
            <div className="eyebrow">SECTIONS</div>
            <a href="#business">01 Business &amp; Leadership</a>
            <a href="#creative">02 Creative Playground</a>
            <a href="#technical">03 Technical / Deep End</a>
            <a href="#media-kit">04 Media Kit</a>
          </div>
          <div className="rt-footer__meta-col">
            <div className="eyebrow">ELSEWHERE</div>
            <a href="#">LinkedIn</a>
            <a href="#">Substack</a>
            <a href="#">GitHub</a>
            <a href="#">YouTube</a>
          </div>
          <div className="rt-footer__meta-col">
            <div className="eyebrow">COLOPHON</div>
            <span>Instrument Serif · IBM Plex</span>
            <span>Next.js 15 · plain CSS · Cloud Run</span>
            <span>Hosted in NL · responds in EN / NL</span>
          </div>
          <div className="rt-footer__meta-col">
            <div className="eyebrow">RUTGER TUIT · 2026</div>
            <span>Amsterdam</span>
            <span>KVK · [redacted]</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

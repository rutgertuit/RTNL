import Link from "next/link";

/**
 * Footer — site meta only (no invite block, no booking CTA).
 * Server component since there's no per-route conditional rendering anymore.
 */
export function Footer() {
  return (
    <footer className="rt-footer" id="contact">
      <div className="container">
        <div className="rt-footer__meta">
          <div className="rt-footer__meta-col">
            <div className="eyebrow">SECTIONS</div>
            <Link href="/#business">01 Business &amp; Leadership</Link>
            <Link href="/#creative">02 Creative Playground</Link>
            <Link href="/#technical">03 Technical / Deep End</Link>
            <Link href="/#media-kit">04 Media Kit</Link>
          </div>
          <div className="rt-footer__meta-col">
            <div className="eyebrow">ELSEWHERE</div>
            <a href="https://www.linkedin.com/in/rutgertuit/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/rutgertuit/" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.youtube.com/rutgertuit" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="https://www.instagram.com/rutgertuit/" target="_blank" rel="noopener noreferrer">Instagram</a>
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
            <Link href="/contact" className="rt-footer__contact-link">
              Contact →
            </Link>
          </div>
        </div>

        <div className="rt-footer__disclaimer">
          <div className="eyebrow">DISCLAIMER</div>
          <p>
            All views, opinions, and arguments expressed on this site are my own personal
            views. They do not represent the views, positions, or strategies of my employer
            (Google) or any other organisation I am affiliated with. This site is a personal
            project, written and maintained outside of work time, and any AI experiments,
            commentary on industry trends, or speaker bios on this site reflect only my
            individual perspective.
          </p>
        </div>
      </div>
    </footer>
  );
}

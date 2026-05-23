"use client";

import { useEffect } from "react";

/**
 * CreativeAtelier — C1 Long-Scroll showcase: Image / Motion / Music.
 * Wires the audio + video play-button toggle (visual-only, no real audio
 * wired yet — the Codewoord tracks land in Phase 4 content handover).
 */
export function CreativeAtelier() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest(".rt-audio__play, .rt-creative__play") as
        | HTMLButtonElement
        | null;
      if (!btn) return;
      btn.classList.toggle("is-playing");
      const svg = btn.querySelector("svg polygon");
      if (svg) {
        if (btn.classList.contains("is-playing")) {
          svg.setAttribute("points", "2,1 5,1 5,11 2,11 7,1 10,1 10,11 7,11");
        } else {
          svg.setAttribute("points", "2,1 11,6 2,11");
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <section className="rt-creative section" id="creative">
      <div className="container">
        <header className="rt-creative__head">
          <div className="eyebrow eyebrow--warm">02 · CREATIVE PLAYGROUND</div>
          <h2 className="rt-creative__title">
            Three experiments — image, motion, music.
          </h2>
          <p className="rt-creative__lead">
            I run these to find out what the tools can actually do. Each one is half-finished on
            purpose. The asset isn&apos;t the output — it&apos;s the prompt set that produced it.
          </p>
        </header>

        <div className="rt-creative__grid">
          {/* Image */}
          <article className="rt-creative__panel">
            <div className="rt-creative__panel-art">
              <img src="/assets/portraits/02-warehouse.png" alt="" />
              <img src="/assets/portraits/03-cinematic.png" alt="" />
              <img src="/assets/portraits/04-profile.png" alt="" />
            </div>
            <div className="rt-creative__panel-meta">
              <div className="eyebrow">IMAGE · NANO BANANA</div>
              <h3>The consistent-character library.</h3>
              <p>
                Six versions of me from a single prompt set. The images are proof the set works;
                the set is the actual asset.
              </p>
              <a className="button" href="#">
                See the prompts <span aria-hidden>→</span>
              </a>
            </div>
          </article>

          {/* Motion */}
          <article className="rt-creative__panel rt-creative__panel--motion">
            <div className="rt-creative__panel-art">
              <div className="rt-creative__video">
                <img src="/assets/portraits/05-mid-shot.png" alt="" />
                <button className="rt-creative__play" aria-label="play Veo evolution reel">
                  <svg viewBox="0 0 12 12" fill="#F2EEE5">
                    <polygon points="2,1 11,6 2,11" />
                  </svg>
                </button>
                <div className="rt-creative__video-cap">
                  VEO · EVOLUTION REEL · v2 → v3 → v3.1 → OMNI
                </div>
              </div>
            </div>
            <div className="rt-creative__panel-meta">
              <div className="eyebrow">MOTION · VEO</div>
              <h3>Same scene, four Veo generations.</h3>
              <p>
                The interesting thing isn&apos;t how much better the output looks — it&apos;s how
                differently I had to write the brief each time.
              </p>
              <a className="button" href="#">
                Open the reel <span aria-hidden>→</span>
              </a>
            </div>
          </article>

          {/* Music — Codewoord */}
          <article className="rt-creative__panel">
            <div className="rt-creative__panel-meta">
              <div className="eyebrow">MUSIC · CODEWOORD</div>
              <h3>Prompt &amp; Codes I &amp; II.</h3>
              <p>
                Two short albums I made with Lyria. The track titles look like a project plan;
                the music doesn&apos;t sound anything like one.
              </p>
            </div>
            <div className="rt-creative__panel-player">
              <div className="rt-audio">
                <button className="rt-audio__play">
                  <svg viewBox="0 0 12 12" fill="#F2EEE5">
                    <polygon points="2,1 11,6 2,11" />
                  </svg>
                </button>
                <div className="rt-audio__info">
                  <div className="rt-audio__eyebrow">CODEWOORD · PROMPT &amp; CODES II</div>
                  <div className="rt-audio__title">Slow port at 4 a.m.</div>
                  <div className="rt-audio__scrub">
                    <div className="rt-audio__fill" />
                    <div className="rt-audio__head" />
                  </div>
                </div>
                <div className="rt-audio__time">01:42 / 04:28</div>
              </div>
              <ul className="rt-audio__list">
                <li>
                  <span>01</span> Briefing the harbour
                </li>
                <li className="active">
                  <span>02</span> Slow port at 4 a.m.
                </li>
                <li>
                  <span>03</span> Codewoord
                </li>
                <li>
                  <span>04</span> Tuesday at 4 (reprise)
                </li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

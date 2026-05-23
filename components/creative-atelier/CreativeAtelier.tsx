"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * CreativeAtelier — C1 Long-Scroll showcase: Image / Motion / Music.
 *
 * The music panel is a state-driven mock audio player (no real audio
 * file wired yet — the Codewoord tracks land in Phase 4). It supports
 * selecting tracks, play/pause toggle, an advancing scrubber, and a
 * formatted time readout. Respects prefers-reduced-motion by leaving
 * the timer paused unless the user explicitly hits play.
 */

interface Track {
  id: string;
  n: string;
  title: string;
  duration: number; // seconds
}

const TRACKS: Track[] = [
  { id: "t1", n: "01", title: "Briefing the harbour", duration: 192 },
  { id: "t2", n: "02", title: "Slow port at 4 a.m.", duration: 268 },
  { id: "t3", n: "03", title: "Codewoord", duration: 166 },
  { id: "t4", n: "04", title: "Tuesday at 4 (reprise)", duration: 314 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function CreativeAtelier() {
  const [activeId, setActiveId] = useState<string>("t2");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(102); // "01:42" starting point
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);

  const activeTrack = useMemo(
    () => TRACKS.find((t) => t.id === activeId) ?? TRACKS[0]!,
    [activeId]
  );

  // Advance the timer when playing. Tick at 250 ms to feel responsive but
  // stay cheap. Loops back to 0 at the end of the track.
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setCurrentTime((t) => {
        const next = t + 0.25;
        return next >= activeTrack.duration ? 0 : next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [isPlaying, activeTrack.duration]);

  const handleSelectTrack = (id: string) => {
    if (id === activeId) {
      setIsPlaying((p) => !p);
      return;
    }
    setActiveId(id);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => setIsPlaying((p) => !p);
  const handleToggleVideo = () => setVideoPlaying((p) => !p);

  const fillPct = (currentTime / activeTrack.duration) * 100;

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
                the set is the actual asset. Full walkthrough of how to build one — three
                methods, in order of effort.
              </p>
              <a className="button" href="/creative/character-sheet">
                How to build a character sheet <span aria-hidden>→</span>
              </a>
            </div>
          </article>

          {/* Motion */}
          <article className="rt-creative__panel rt-creative__panel--motion">
            <div className="rt-creative__panel-art">
              <div className="rt-creative__video">
                <img src="/assets/portraits/05-mid-shot.png" alt="" />
                <button
                  className={`rt-creative__play ${videoPlaying ? "is-playing" : ""}`}
                  aria-label={videoPlaying ? "pause Veo evolution reel" : "play Veo evolution reel"}
                  aria-pressed={videoPlaying}
                  onClick={handleToggleVideo}
                >
                  <svg viewBox="0 0 12 12" fill="#F2EEE5">
                    {videoPlaying ? (
                      <polygon points="2,1 5,1 5,11 2,11 7,1 10,1 10,11 7,11" />
                    ) : (
                      <polygon points="2,1 11,6 2,11" />
                    )}
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
                <button
                  className={`rt-audio__play ${isPlaying ? "is-playing" : ""}`}
                  aria-label={isPlaying ? `pause ${activeTrack.title}` : `play ${activeTrack.title}`}
                  aria-pressed={isPlaying}
                  onClick={handleTogglePlay}
                >
                  <svg viewBox="0 0 12 12" fill="#F2EEE5">
                    {isPlaying ? (
                      <polygon points="2,1 5,1 5,11 2,11 7,1 10,1 10,11 7,11" />
                    ) : (
                      <polygon points="2,1 11,6 2,11" />
                    )}
                  </svg>
                </button>
                <div className="rt-audio__info">
                  <div className="rt-audio__eyebrow">CODEWOORD · PROMPT &amp; CODES II</div>
                  <div className="rt-audio__title">{activeTrack.title}</div>
                  <div
                    className="rt-audio__scrub"
                    role="progressbar"
                    aria-label="track progress"
                    aria-valuemin={0}
                    aria-valuemax={Math.floor(activeTrack.duration)}
                    aria-valuenow={Math.floor(currentTime)}
                  >
                    <div
                      className="rt-audio__fill"
                      style={{ width: `${fillPct}%` }}
                    />
                    <div
                      className="rt-audio__head"
                      style={{ left: `${fillPct}%` }}
                    />
                  </div>
                </div>
                <div className="rt-audio__time">
                  {formatTime(currentTime)} / {formatTime(activeTrack.duration)}
                </div>
              </div>
              <ul className="rt-audio__list">
                {TRACKS.map((t) => (
                  <li
                    key={t.id}
                    className={t.id === activeId ? "active" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectTrack(t.id)}
                      aria-current={t.id === activeId ? "true" : undefined}
                    >
                      <span>{t.n}</span> {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

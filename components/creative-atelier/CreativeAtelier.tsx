"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

/**
 * CreativeAtelier — C1 Long-Scroll showcase: Image / Motion / Music.
 *
 * The music panel renders the Codewoord albums in a 90s-boombox aesthetic
 * (cassette deck with LCD readout, transport buttons, two speaker grills,
 * VU meter that pulses while playing). It's a state-driven mock player
 * — no real audio wired yet — but supports track switching, play/pause,
 * skip prev/next, scrubber, and a formatted time readout.
 */

interface Track {
  id: string;
  n: string;
  title: string;
  duration: number; // seconds
  src: string;
}

// Five tracks from the two AI-assisted albums released on Spotify. Lyrics
// co-written with AI, music partly AI-generated; some melody and drum
// performances by hand; arrangement / editing by hand. No real
// instruments and no real vocalists. Durations measured via ffprobe at
// commit time so the boombox progress bar matches the audio exactly.
const TRACKS: Track[] = [
  { id: "t1", n: "01", title: "Big Television",  duration: 261, src: "/audio/music/big-television.mp3" },
  { id: "t2", n: "02", title: "Flicker",         duration: 212, src: "/audio/music/flicker.mp3" },
  { id: "t3", n: "03", title: "Mansplainer",     duration: 206, src: "/audio/music/mansplainer.mp3" },
  { id: "t4", n: "04", title: "Oxymorons",       duration: 158, src: "/audio/music/oxymorons.mp3" },
  { id: "t5", n: "05", title: "TPU",             duration: 116, src: "/audio/music/tpu.mp3" },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function CreativeAtelier() {
  const [activeId, setActiveId] = useState<string>("t1");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = useMemo(
    () => TRACKS.find((t) => t.id === activeId) ?? TRACKS[0]!,
    [activeId]
  );

  // When the active track changes, point the audio element at the new src
  // and (if currently playing) resume playback. Without this the element
  // would keep playing the previous track's bytes.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    setCurrentTime(0);
    el.currentTime = 0;
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false));
    }
    // We intentionally exclude isPlaying so toggling pause/play below
    // doesn't trigger a reseek.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Sync the React isPlaying state to the audio element. The element is
  // the source of truth — play() is async + can reject (autoplay policy),
  // so we ask it to play and roll the UI back if it refuses.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false));
    } else {
      el.pause();
    }
  }, [isPlaying]);

  const handleSelectTrack = (id: string) => {
    if (id === activeId) {
      setIsPlaying((p) => !p);
      return;
    }
    setActiveId(id);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => setIsPlaying((p) => !p);
  const handleToggleVideo = () => {
    setVideoPlaying((p) => {
      const next = !p;
      if (videoRef.current) {
        if (next) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
      return next;
    });
  };

  const handlePrev = () => {
    const idx = TRACKS.findIndex((t) => t.id === activeId);
    const prevIdx = idx <= 0 ? TRACKS.length - 1 : idx - 1;
    setActiveId(TRACKS[prevIdx]!.id);
  };

  const handleNext = () => {
    const idx = TRACKS.findIndex((t) => t.id === activeId);
    const nextIdx = idx >= TRACKS.length - 1 ? 0 : idx + 1;
    setActiveId(TRACKS[nextIdx]!.id);
  };

  const fillPct = (currentTime / activeTrack.duration) * 100;

  return (
    <section className="rt-creative section" id="creative">
      <div className="container">
        <header className="rt-creative__head">
          <div className="eyebrow eyebrow--warm">02 · CREATIVE PLAYGROUND</div>
          <h2 className="rt-creative__title">
            Four experiments — image, motion, music, interaction.
          </h2>
          <p className="rt-creative__lead">
            I run these to find out what the tools can actually do. Each one is half-finished on
            purpose. The asset isn&apos;t the output — it&apos;s the prompt set that produced it.
          </p>
        </header>

        <div className="rt-creative__grid">
          {/* Image */}
          <article className="rt-creative__panel">
            <div className="rt-creative__panel-art rt-creative__panel-art--grid">
              {[
                "01-studio",
                "02-warehouse",
                "03-cinematic",
                "04-profile",
                "05-mid-shot",
                "06-stage",
              ].map((id) => (
                <Image
                  key={id}
                  src={`/assets/portraits/${id}.png`}
                  alt=""
                  width={1248}
                  height={1248}
                  sizes="(max-width: 720px) 33vw, (max-width: 1200px) 16vw, 11vw"
                />
              ))}
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
                <video
                  ref={videoRef}
                  src="/assets/video/veo-evolution.mp4"
                  playsInline
                  muted
                  loop
                  preload="metadata"
                  style={{
                    display: videoPlaying ? "block" : "none",
                  }}
                />
                {!videoPlaying && (
                  <Image
                    src="/assets/portraits/05-mid-shot.png"
                    alt=""
                    width={1440}
                    height={1920}
                    sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
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
              <a className="button" href="/creative/video-models">
                The Evolution of Video Models <span aria-hidden>→</span>
              </a>
            </div>
          </article>

          {/* Music — five tracks from the two AI-assisted albums I released
              on Spotify. Boombox UI for fun; real audio underneath. */}
          <article className="rt-creative__panel">
            <div className="rt-creative__panel-meta">
              <div className="eyebrow">MUSIC · TWO AI-ASSISTED ALBUMS</div>
              <h3>Five from the Spotify drops.</h3>
              <p>
                Lyrics co-written with AI; music partly AI-generated. I
                played some of the melody and drums, did most of the
                arrangement and editing. No real instruments and no real
                vocalists were used. Hit play.
              </p>
              <p className="rt-creative__music-plea">
                A request: if you like music, <strong>pay for it</strong>.
                Buy albums. Use streaming services that pay artists
                fairly. Visit concerts. Buy merch. AI tools should make
                more humans able to make music &mdash; not fewer humans
                able to live off it.
              </p>
            </div>
            {/* Hidden audio element — single source of truth for playback.
                The boombox UI below is controlled by the React state, which
                in turn drives this element via the useEffect hooks. */}
            <audio
              ref={audioRef}
              src={activeTrack.src}
              preload="metadata"
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
              onEnded={() => {
                // Auto-advance to next track on end.
                const idx = TRACKS.findIndex((t) => t.id === activeId);
                const nextIdx = idx >= TRACKS.length - 1 ? 0 : idx + 1;
                setActiveId(TRACKS[nextIdx]!.id);
              }}
            />
            <div className="rt-creative__panel-player">
              <div className={`rt-boombox ${isPlaying ? "is-playing" : ""}`}>
                <div className="rt-boombox__top">
                  <span className="rt-boombox__handle" aria-hidden />
                  <span className="rt-boombox__brand">
                    RT · TWO AI-ASSISTED ALBUMS · NOW PLAYING
                  </span>
                  <span className="rt-boombox__handle" aria-hidden />
                </div>

                <div className="rt-boombox__body">
                  <div
                    className="rt-boombox__speaker rt-boombox__speaker--left"
                    aria-hidden
                  >
                    <span className="rt-boombox__speaker-cone" />
                  </div>

                  <div className="rt-boombox__deck">
                    <div className="rt-boombox__lcd">
                      <div className="rt-boombox__lcd-row">
                        <span className="rt-boombox__lcd-num">{activeTrack.n}</span>
                        <span className="rt-boombox__lcd-track">{activeTrack.title}</span>
                      </div>
                      <div
                        className="rt-boombox__scrub"
                        role="progressbar"
                        aria-label="track progress"
                        aria-valuemin={0}
                        aria-valuemax={Math.floor(activeTrack.duration)}
                        aria-valuenow={Math.floor(currentTime)}
                      >
                        <span
                          className="rt-boombox__scrub-fill"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <div className="rt-boombox__lcd-meta">
                        <span>
                          {formatTime(currentTime)} / {formatTime(activeTrack.duration)}
                        </span>
                        <span className="rt-boombox__lcd-state">
                          {isPlaying ? "▶ PLAY" : "■ STOP"}
                        </span>
                      </div>
                      <div className="rt-boombox__vu" aria-hidden>
                        {Array.from({ length: 8 }, (_, i) => (
                          <span key={i} style={{ animationDelay: `${(i * 70) % 360}ms` }} />
                        ))}
                      </div>
                    </div>

                    <div className="rt-boombox__transport">
                      <button
                        type="button"
                        className="rt-boombox__btn rt-boombox__btn--side"
                        onClick={handlePrev}
                        aria-label="previous track"
                      >
                        <svg viewBox="0 0 14 14" aria-hidden>
                          <polygon points="3,2 3,12 4,12 4,2" fill="currentColor" />
                          <polygon points="13,2 4,7 13,12" fill="currentColor" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={`rt-boombox__btn rt-boombox__btn--play ${isPlaying ? "is-playing" : ""}`}
                        onClick={handleTogglePlay}
                        aria-label={isPlaying ? `pause ${activeTrack.title}` : `play ${activeTrack.title}`}
                        aria-pressed={isPlaying}
                      >
                        <svg viewBox="0 0 14 14" aria-hidden>
                          {isPlaying ? (
                            <>
                              <rect x="3" y="2" width="3" height="10" fill="currentColor" />
                              <rect x="8" y="2" width="3" height="10" fill="currentColor" />
                            </>
                          ) : (
                            <polygon points="3,2 12,7 3,12" fill="currentColor" />
                          )}
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="rt-boombox__btn rt-boombox__btn--side"
                        onClick={handleNext}
                        aria-label="next track"
                      >
                        <svg viewBox="0 0 14 14" aria-hidden>
                          <polygon points="1,2 10,7 1,12" fill="currentColor" />
                          <polygon points="10,2 11,2 11,12 10,12" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div
                    className="rt-boombox__speaker rt-boombox__speaker--right"
                    aria-hidden
                  >
                    <span className="rt-boombox__speaker-cone" />
                  </div>
                </div>

                <ul className="rt-boombox__tracklist">
                  {TRACKS.map((t) => (
                    <li key={t.id} className={t.id === activeId ? "active" : ""}>
                      <button
                        type="button"
                        onClick={() => handleSelectTrack(t.id)}
                        aria-current={t.id === activeId ? "true" : undefined}
                      >
                        <span className="rt-boombox__tracklist-num">{t.n}</span>
                        <span className="rt-boombox__tracklist-title">{t.title}</span>
                        <span className="rt-boombox__tracklist-time">
                          {formatTime(t.duration)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          {/* Interaction — fourth experiment: interactive artefacts as explanation */}
          <article className="rt-creative__panel rt-creative__panel--interaction">
            <div className="rt-creative__panel-art rt-creative__panel-art--illustration">
              <img
                src="/assets/creative/interactivity/desk-tinkering.png"
                alt="Workshop desk in warm rim light — soldering iron, half-disassembled keyboard, a monitor in the corner showing a prototype mid-build."
                loading="lazy"
                onError={(e) => {
                  // Placeholder until the desk illustration is dropped in.
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const ph = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (ph) ph.style.display = "flex";
                }}
              />
              <div className="rt-creative__panel-art-placeholder" aria-hidden>
                <span className="eyebrow">ILLUSTRATION PENDING</span>
                <span>desk · tinkering · prototype</span>
              </div>
            </div>
            <div className="rt-creative__panel-meta">
              <div className="eyebrow">METHOD · INTERACTION</div>
              <h3>Interactivity is the new explanation.</h3>
              <p>
                The fastest path from &quot;I don&apos;t get it&quot; to &quot;oh, like
                that&quot; is to let someone press the idea. Three modes — investigation,
                structuring, creation — with the tools and the two mini-games on this
                site as proof.
              </p>
              <a className="button" href="/creative/interactivity">
                Read the method <span aria-hidden>→</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

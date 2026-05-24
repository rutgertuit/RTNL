"use client";

import { useEffect, useRef, useState } from "react";

interface PodcastPlayerProps {
  src: string;
  title: string;
  /** Mono eyebrow above the title — e.g. "EP 02 · 5:30 listen" */
  eyebrow?: string;
  /** Optional subtitle line below the title */
  subtitle?: string;
  /** Display duration shown until audio loads (e.g. "5:30") */
  duration?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Reel() {
  return (
    <svg viewBox="0 0 60 60" aria-hidden focusable="false">
      <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <circle cx="30" cy="30" r="8" fill="currentColor" />
      <circle cx="30" cy="30" r="2" fill="#0B0B0C" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="30" y1="4" x2="30" y2="20" />
        <line x1="30" y1="40" x2="30" y2="56" />
        <line x1="4" y1="30" x2="20" y2="30" />
        <line x1="40" y1="30" x2="56" y2="30" />
        <line x1="11" y1="11" x2="22" y2="22" />
        <line x1="38" y1="38" x2="49" y2="49" />
        <line x1="49" y1="11" x2="38" y2="22" />
        <line x1="22" y1="38" x2="11" y2="49" />
      </g>
    </svg>
  );
}

/**
 * Broadcast-deck podcast player. Two SVG reels rotate while playing.
 * Industrial-luxury palette: dark surface, amber accent on the play
 * button and scrubber, hairline border. Sits inline in article body.
 *
 * Falls back to a "in production" state if the audio file isn't
 * hosted yet — the UI renders fully but the play button is disabled.
 */
export function PodcastPlayer({
  src,
  title,
  eyebrow,
  subtitle,
  duration,
}: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setHasAudio(true);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => setHasAudio(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [src]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audioDuration;
    setCurrentTime(audio.currentTime);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleTogglePlay();
    }
  };

  const fillPct = audioDuration ? (currentTime / audioDuration) * 100 : 0;
  const displayDuration =
    audioDuration > 0 ? formatTime(audioDuration) : duration ?? "—:—";



  return (
    <figure className={`rt-podcast ${isPlaying ? "is-playing" : ""}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="rt-podcast__reels" aria-hidden>
        <div className="rt-podcast__reel rt-podcast__reel--left">
          <Reel />
        </div>
        <div className="rt-podcast__reel rt-podcast__reel--right">
          <Reel />
        </div>
      </div>

      <div className="rt-podcast__meta">
        {eyebrow && <div className="rt-podcast__eyebrow">{eyebrow}</div>}
        <div className="rt-podcast__title">{title}</div>
        {subtitle && <div className="rt-podcast__subtitle">{subtitle}</div>}
      </div>

      <button
        type="button"
        className="rt-podcast__play"
        onClick={handleTogglePlay}
        onKeyDown={handleKey}
        disabled={!hasAudio}
        aria-label={
          !hasAudio
            ? "podcast not yet available"
            : isPlaying
              ? `pause ${title}`
              : `play ${title}`
        }
        aria-pressed={isPlaying}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          {isPlaying ? (
            <>
              <rect x="6" y="4" width="4" height="16" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" fill="currentColor" />
            </>
          ) : (
            <polygon points="7,4 20,12 7,20" fill="currentColor" />
          )}
        </svg>
      </button>

      <div className="rt-podcast__controls">
        <div
          className="rt-podcast__scrub"
          onClick={handleSeek}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={Math.floor(audioDuration || 0)}
          aria-valuenow={Math.floor(currentTime)}
          aria-label="podcast progress"
        >
          <div className="rt-podcast__scrub-fill" style={{ width: `${fillPct}%` }} />
          <div className="rt-podcast__scrub-head" style={{ left: `${fillPct}%` }} />
        </div>
        <div className="rt-podcast__time">
          {formatTime(currentTime)} <span className="rt-podcast__time-sep">/</span> {displayDuration}
        </div>
      </div>

      {!hasAudio && (
        <figcaption className="rt-podcast__placeholder">
          <span className="rt-podcast__placeholder-dot" aria-hidden /> RENDERING ·
          PLAYER ACTIVATES WHEN THE EPISODE IS HOSTED
        </figcaption>
      )}
    </figure>
  );
}

"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { PodcastPlayer } from "./PodcastPlayer";

interface PodcastTabProps {
  /** Audio src — defaults to the placeholder while episode renders */
  src: string;
  /** Episode title shown inside the panel */
  title: string;
  /** Mono eyebrow inside the panel (e.g. "EP 02 · 5:30 LISTEN") */
  eyebrow?: string;
  /** Subtitle line inside the panel */
  subtitle?: string;
  /** Display duration shown until audio loads (e.g. "5:30") */
  duration?: string;
  /** Tab label rotated on the page edge (e.g. "LISTEN · 5:30") */
  tabLabel?: string;
  /** Optional "how this was made" content rendered inside the panel */
  children?: ReactNode;
}

/**
 * Sticky orange tab pinned to the right edge of the viewport on
 * article pages. The article is the focus; this is a peripheral
 * affordance — the reader sees the tab, gets curious, hovers or
 * clicks to expand the panel with the audio player + the
 * "how this was made" mini-essay.
 *
 * Behaviour:
 *   - hover the tab → panel slides open (desktop)
 *   - click the tab → panel locks open (works on touch too)
 *   - click outside / Esc / close button → panel closes
 *   - hover leaves the panel for 400ms → panel auto-closes if
 *     it wasn't click-locked
 *
 * The tab pulses gently on first mount for ~6 seconds then
 * settles — enough to register, not enough to nag.
 */
export function PodcastTab({
  src,
  title,
  eyebrow,
  subtitle,
  duration,
  tabLabel,
  children,
}: PodcastTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const tabRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Esc closes the panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsLocked(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Open from elsewhere on the page (e.g. the inline "Listen to podcast"
  // button in the article header — see components/article/PodcastInlineButton).
  useEffect(() => {
    const onOpen = () => {
      setIsOpen(true);
      setIsLocked(true);
    };
    window.addEventListener("rt-podcast-open", onOpen);
    return () => window.removeEventListener("rt-podcast-open", onOpen);
  }, []);

  // Click outside closes the panel
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (tabRef.current?.contains(t)) return;
      setIsOpen(false);
      setIsLocked(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen]);

  const handleTabHover = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const handlePanelLeave = () => {
    if (isLocked) return;
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 400);
  };

  const handleTabClick = () => {
    if (isOpen && isLocked) {
      setIsOpen(false);
      setIsLocked(false);
    } else {
      setIsOpen(true);
      setIsLocked(true);
    }
  };

  return (
    <div className={`rt-podcast-tab ${isOpen ? "is-open" : ""} ${isLocked ? "is-locked" : ""}`}>
      <button
        ref={tabRef}
        type="button"
        className="rt-podcast-tab__handle"
        onClick={handleTabClick}
        onMouseEnter={handleTabHover}
        aria-expanded={isOpen}
        aria-controls="rt-podcast-tab-panel"
        aria-label={`${isOpen ? "Close" : "Open"} podcast panel`}
      >
        <span className="rt-podcast-tab__icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M12 14a3 3 0 003-3V7a3 3 0 00-6 0v4a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="rt-podcast-tab__label">
          {tabLabel ?? `LISTEN · ${duration ?? ""}`.trim()}
        </span>
        <span className="rt-podcast-tab__arrow" aria-hidden>
          {isOpen ? "›" : "‹"}
        </span>
      </button>

      <div
        id="rt-podcast-tab-panel"
        ref={panelRef}
        className="rt-podcast-tab__panel"
        onMouseLeave={handlePanelLeave}
        role="dialog"
        aria-modal="false"
        aria-label="Podcast version of this article"
        aria-hidden={!isOpen}
      >
        <div className="rt-podcast-tab__panel-head">
          <span className="eyebrow eyebrow--warm">PODCAST VERSION</span>
          <button
            type="button"
            className="rt-podcast-tab__close"
            onClick={() => {
              setIsOpen(false);
              setIsLocked(false);
            }}
            aria-label="Close podcast panel"
          >
            ×
          </button>
        </div>

        <PodcastPlayer
          src={src}
          title={title}
          eyebrow={eyebrow}
          subtitle={subtitle}
          duration={duration}
        />

        {children && (
          <div className="rt-podcast-tab__essay">{children}</div>
        )}
      </div>
    </div>
  );
}

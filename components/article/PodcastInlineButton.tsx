"use client";

/**
 * PodcastInlineButton — the orange CTA that lives in the article header
 * meta line. When clicked, it opens the sticky PodcastTab via a custom
 * window event ('rt-podcast-open'). The tab handles its own visible state.
 *
 * Render this from Article.tsx whenever the article has an audio version
 * available. The sticky tab itself is rendered by the per-article page.tsx
 * and must be present for the event listener to do anything.
 */
export function PodcastInlineButton({ label = "Listen to podcast version" }: { label?: string }) {
  const handleClick = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("rt-podcast-open"));
  };

  return (
    <button
      type="button"
      className="rt-tuit__meta-action rt-tuit__meta-action--warm"
      onClick={handleClick}
      aria-label={label}
    >
      <span className="rt-tuit__meta-action-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path
            d="M12 14a3 3 0 003-3V7a3 3 0 00-6 0v4a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z"
            fill="currentColor"
          />
        </svg>
      </span>
      {label}
      <span aria-hidden>→</span>
    </button>
  );
}

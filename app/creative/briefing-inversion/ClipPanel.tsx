"use client";

import { useState } from "react";

export interface ClipPanelProps {
  /** Slug matching the MP4 filename (without extension) in
   *  /assets/video/briefing-inversion/<slug>.mp4 */
  slug: string;
  /** Label shown over the video chrome — e.g. "VEO 2 · DEC 2024 · 260 WORDS" */
  label: string;
  /** Aspect ratio for the panel; 16:9 default. */
  aspect?: "16/9";
  /** Whether the clip carries audio by design (controls UI affordance). */
  hasAudio?: boolean;
  /** Whether the clip should auto-play muted on viewport entry (Section 3 loops). */
  autoLoop?: boolean;
  /** Dim treatment for the honest-failure block in Section 3 Block 4. */
  dimmed?: boolean;
}

export function ClipPanel({
  slug,
  label,
  aspect = "16/9",
  hasAudio = false,
  autoLoop = false,
  dimmed = false,
}: ClipPanelProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );

  const src = `/assets/video/briefing-inversion/${slug}.mp4`;

  return (
    <div
      className={`rt-bi-clip ${dimmed ? "rt-bi-clip--dim" : ""}`}
      style={{ aspectRatio: aspect.replace("/", " / ") }}
      data-clip-slug={slug}
      data-clip-status={status}
    >
      <video
        className="rt-bi-clip__video"
        src={src}
        muted
        playsInline
        loop={autoLoop}
        autoPlay={autoLoop}
        preload="metadata"
        controls={!autoLoop}
        onLoadedData={() => setStatus("ready")}
        onError={() => setStatus("missing")}
      />

      {status === "missing" && (
        <div className="rt-bi-clip__pending" role="status">
          <span className="rt-bi-clip__pending-badge">RENDER PENDING</span>
          <span className="rt-bi-clip__pending-label">{label}</span>
          <span className="rt-bi-clip__pending-note">
            Clip will appear here once <code>{slug}.mp4</code> lands in{" "}
            <code>/public/assets/video/briefing-inversion/</code>.
          </span>
        </div>
      )}

      <div className="rt-bi-clip__chrome">
        <span className="rt-bi-clip__label">{label}</span>
        {hasAudio && status === "ready" && (
          <span className="rt-bi-clip__audio">♪ AUDIO</span>
        )}
      </div>
    </div>
  );
}

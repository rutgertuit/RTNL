"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Cortex } from "@/components/cortex/Cortex";

const PORTRAITS = [
  { id: "01-studio", label: "Studio", mood: "The executive" },
  { id: "02-warehouse", label: "Warehouse", mood: "The tinkerer" },
  { id: "03-cinematic", label: "Cinematic", mood: "The translator" },
  { id: "04-profile", label: "Profile", mood: "The musician" },
  { id: "05-mid-shot", label: "Mid-shot", mood: "The polymath" },
  { id: "06-stage", label: "Stage", mood: "The conductor" },
];

const CYCLE_MS = 4800;

export function Hero() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userStopped, setUserStopped] = useState(false);
  // Mounted gate: the counter + mood label show index 0 ("01 / 06" — The executive)
  // on first paint even if the cycle effect has already queued a tick. Prevents
  // a flash of stale state when hydration is slow.
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (paused || userStopped) return;
    const id = setTimeout(() => setIdx((i) => (i + 1) % PORTRAITS.length), CYCLE_MS);
    return () => clearTimeout(id);
  }, [idx, paused, userStopped]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) setUserStopped(true);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf: number | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = wrapRef.current;
        if (!el) return;
        const y = window.scrollY;
        const fade = Math.max(0, 1 - y / 700);
        el.style.setProperty("--hero-scroll", String(y));
        el.style.setProperty("--hero-fade", String(fade));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Mouse parallax — desktop only, prefers-reduced-motion aware.
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const fineHover = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    if (!fineHover) return;
    let raf: number | null = null;
    let targetX = 0;
    let targetY = 0;
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = (e.clientX - cx) / (rect.width / 2);
      targetY = (e.clientY - cy) / (rect.height / 2);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const elNow = wrapRef.current;
        if (!elNow) return;
        elNow.style.setProperty("--mouse-x", targetX.toFixed(3));
        elNow.style.setProperty("--mouse-y", targetY.toFixed(3));
      });
    };
    const onLeave = () => {
      const el = wrapRef.current;
      if (!el) return;
      el.style.setProperty("--mouse-x", "0");
      el.style.setProperty("--mouse-y", "0");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    const el = wrapRef.current;
    el?.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el?.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const displayIdx = mounted ? idx : 0;
  const cur = PORTRAITS[displayIdx]!;

  return (
    <section
      ref={wrapRef}
      className="rt-hero rt-hero--v2"
      id="top"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="rt-hero__cortex rt-hero__cortex--orbit" aria-hidden>
        <div className="rt-hero__orbit">
          <Cortex variant="hero" width={1100} height={900} rotate={true} interactive={false} />
        </div>
      </div>

      <div className="rt-hero__vignette" aria-hidden />

      <div className="rt-hero__portrait-stage" aria-live="polite">
        {PORTRAITS.map((p, i) => (
          <figure
            key={p.id}
            className={`rt-hero__portrait-card ${i === idx ? "is-active" : ""}`}
          >
            <Image
              src={`/assets/portraits/${p.id}.png`}
              alt={`Rutger Tuit — ${p.label.toLowerCase()}`}
              width={1440}
              height={1920}
              sizes="(max-width: 720px) 100vw, 50vw"
              priority={i === 0}
            />
            <div className="rt-hero__portrait-protection" aria-hidden />
          </figure>
        ))}
        <div className="rt-hero__portrait-cap">
          <div className="rt-hero__portrait-cap-num">
            PORTRAIT · {String(displayIdx + 1).padStart(2, "0")} / 06
          </div>
          <div className="rt-hero__portrait-cap-mood">{cur.mood}</div>
          <div className="rt-hero__portrait-cap-meta">
            AI · CONSISTENT CHARACTER LIBRARY · NANO BANANA
          </div>
        </div>
        <div className="rt-hero__portrait-dots" role="tablist" aria-label="Portrait sequence">
          {PORTRAITS.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Show portrait ${i + 1}: ${p.label}`}
              className={`rt-hero__portrait-dot ${i === idx ? "is-active" : ""}`}
              onClick={() => {
                setIdx(i);
                setUserStopped(true);
              }}
            />
          ))}
        </div>
        <button
          className="rt-hero__pause"
          aria-pressed={userStopped}
          aria-label={userStopped ? "Resume portrait sequence" : "Pause portrait sequence"}
          onClick={() => setUserStopped((s) => !s)}
        >
          {userStopped ? "▷ PLAY" : "⏸ PAUSE"}
        </button>
      </div>

      <div className="rt-hero__content container">
        <div className="rt-hero__brow">
          <span className="rt-hero__brow-tick" aria-hidden />
          <span className="eyebrow eyebrow--warm">RUTGER TUIT · NOTES FROM THE SEAM</span>
          <span className="rt-hero__brow-sep" aria-hidden>·</span>
          <span className="eyebrow">AMSTERDAM</span>
        </div>

        <h1 className="rt-hero__headline">
          <span className="rt-hero__line rt-hero__line--1">I am a</span>
          <span className="rt-hero__line rt-hero__line--2">technical</span>
          <span className="rt-hero__line rt-hero__line--3">creative</span>
          <span className="rt-hero__line rt-hero__line--4">
            <em>—</em>
          </span>
        </h1>

        <div className="rt-hero__sub">
          <div className="rt-hero__leads">
            <p className="rt-hero__lead">
              From building softsynths to composing in first-gen DAWs. From LAN-party Quake player
              to global e-sports team leader. From a weekend job selling kitchens to 3D and VR
              modelling interiors.
            </p>
            <p className="rt-hero__lead">
              Experimentation is how I learn. Going deep is where I find the parts that &mdash; if
              changed &mdash; move everything.
            </p>
            <p className="rt-hero__lead">
              This site is old hobbies and new hobbies, revisited with AI on the bench. Some of
              what comes out translates into business. Director at Google by day. Homelab of
              agents I visit again at night.
            </p>
            <p className="rt-hero__lead rt-hero__lead--stamp">
              <strong>
                Nothing on this site was hand-touched. Every image, every line, every clip &mdash;
                prompted, then chosen.
              </strong>
            </p>
          </div>
        </div>

        <div className="rt-hero__scroll-hint" aria-hidden>
          <span>SCROLL · THE HOOK BEGINS</span>
          <span className="rt-hero__scroll-line" />
        </div>
      </div>
    </section>
  );
}

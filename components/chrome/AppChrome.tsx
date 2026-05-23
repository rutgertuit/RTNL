"use client";

import { useEffect, useState } from "react";
import { useReveal } from "@/lib/useReveal";

/**
 * Scroll progress (top hairline) + back-to-top button + reveal-on-scroll
 * observer. Also neutralises empty href="#" placeholder links so they don't
 * jump to the top of a long-scroll page.
 */
export function AppChrome() {
  useReveal();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let raf: number | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? window.scrollY / h : 0;
        const fill = document.getElementById("nav-progress-fill");
        if (fill) fill.style.transform = `scaleX(${p})`;
        setShowTop(window.scrollY > window.innerHeight * 1.8);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest('a[href="#"]') as HTMLAnchorElement | null;
      if (a) e.preventDefault();
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <button
      className={`rt-totop ${showTop ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <span className="rt-totop__line" aria-hidden />
      <span className="rt-totop__label">TOP</span>
      <span className="rt-totop__arrow" aria-hidden>↑</span>
    </button>
  );
}

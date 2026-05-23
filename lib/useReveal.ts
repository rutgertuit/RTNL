"use client";

import { useEffect } from "react";

/**
 * Arms `.rt-reveal` nodes that are still below the initial fold for a
 * reveal-in animation. Nodes already in view stay visible immediately —
 * this avoids the "section is stuck invisible because the observer never
 * fired" failure mode when navigating via #hash.
 */
export function useReveal(): void {
  useEffect(() => {
    const items = document.querySelectorAll(".rt-reveal");
    if (items.length === 0) return;
    if (!("IntersectionObserver" in window)) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) {
        el.classList.add("rt-reveal--armed");
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );

    document.querySelectorAll(".rt-reveal--armed").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavMobileMenu } from "./NavMobileMenu";

const SECTIONS = [
  { id: "top", num: "00", label: "Home", short: "Home" },
  { id: "business", num: "01", label: "Business & Leadership", short: "Business" },
  { id: "creative", num: "02", label: "Creative Playground", short: "Creative" },
  { id: "technical", num: "03", label: "Technical · Deep End", short: "Technical" },
  { id: "media-kit", num: "04", label: "Media Kit", short: "Media Kit" },
];

export function Nav() {
  const [active, setActive] = useState("top");
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();
  const onContact = path === "/contact";

  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`rt-nav rt-nav--sticky ${scrolled ? "is-scrolled" : ""}`} aria-label="Primary">
      <Link href="/" className="rt-nav__logo" aria-label="rutger tuit home">
        <span className="rt-nav__logo-top">rutger</span>
        <span className="rt-nav__logo-bot">tuit.</span>
      </Link>
      <div className="rt-nav__items">
        {SECTIONS.slice(1).map((s) => (
          <Link
            key={s.id}
            href={`/#${s.id}`}
            className={`rt-nav__item ${active === s.id ? "is-active" : ""}`}
            aria-current={active === s.id ? "page" : undefined}
          >
            <span className="rt-nav__num">{s.num}</span>
            <span className="rt-nav__item-long">{s.label}</span>
            <span className="rt-nav__item-short">{s.short}</span>
          </Link>
        ))}
      </div>
      {!onContact && (
        <Link href="/#contact" className="rt-nav__cta">
          Get in touch <span aria-hidden>→</span>
        </Link>
      )}
      <NavMobileMenu sections={SECTIONS.slice(1)} />
      <div className="rt-nav__progress" aria-hidden>
        <div className="rt-nav__progress-fill" id="nav-progress-fill" />
      </div>
    </nav>
  );
}

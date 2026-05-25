"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Section = { id: string; num: string; label: string };

export function NavMobileMenu({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const onContact = path === "/contact";

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Move focus into the panel on open (panel-ref + querySelector approach)
  useEffect(() => {
    if (open) {
      const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>("a");
      firstLink?.focus();
    }
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="rt-nav__hamburger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="rt-nav__hamburger-bar" aria-hidden="true" />
        <span className="rt-nav__hamburger-bar" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className="rt-nav__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <nav className="rt-nav__panel-list">
            {sections.map((s) => (
              <Link
                key={s.id}
                href={`/#${s.id}`}
                onClick={() => setOpen(false)}
                className="rt-nav__panel-item"
              >
                <span className="rt-nav__panel-num">{s.num}</span>
                <span>{s.label}</span>
              </Link>
            ))}
            {!onContact && (
              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className="rt-nav__panel-cta"
              >
                Get in touch <span aria-hidden="true">→</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

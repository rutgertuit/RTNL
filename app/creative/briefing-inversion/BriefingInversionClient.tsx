"use client";

import { useEffect, useState } from "react";
import "./briefing-inversion.css";
import { Hero } from "./sections/Hero";
import { BriefingInversion } from "./sections/BriefingInversion";
import { FourLineages } from "./sections/FourLineages";
import { PipelineCollapse } from "./sections/PipelineCollapse";
import { TalkToIt } from "./sections/TalkToIt";
import { CostOfFrame } from "./sections/CostOfFrame";
import { Invitation } from "./sections/Invitation";

const NAV_ITEMS = [
  { id: "brief", label: "Brief" },
  { id: "lineages", label: "Lineages" },
  { id: "architecture", label: "Architecture" },
  { id: "simulator", label: "Simulator" },
  { id: "cost", label: "Cost" },
  { id: "invitation", label: "Invitation" },
] as const;

export function BriefingInversionClient() {
  const [activeId, setActiveId] = useState<string>("brief");

  useEffect(() => {
    const ids = NAV_ITEMS.map((i) => i.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that's intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActiveId(first.target.id);
      },
      {
        // Trigger when the top third of the section enters the viewport.
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const s of sections) observer.observe(s);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="rt-bi-subnav" aria-label="On this page">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={item.id === activeId ? "is-active" : ""}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main className="rt-bi" id="briefing-inversion">
        <Hero />
        <BriefingInversion />
        <FourLineages />
        <PipelineCollapse />
        <TalkToIt />
        <CostOfFrame />
        <Invitation />
      </main>
    </>
  );
}

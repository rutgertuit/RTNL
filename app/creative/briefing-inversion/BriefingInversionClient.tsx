"use client";

import "./briefing-inversion.css";
import { Hero } from "./sections/Hero";
import { BriefingInversion } from "./sections/BriefingInversion";
import { FourLineages } from "./sections/FourLineages";
import { PipelineCollapse } from "./sections/PipelineCollapse";
import { TalkToIt } from "./sections/TalkToIt";
import { CostOfFrame } from "./sections/CostOfFrame";
import { Invitation } from "./sections/Invitation";

export function BriefingInversionClient() {
  return (
    <main className="rt-bi" id="briefing-inversion">
      <Hero />
      <BriefingInversion />
      <FourLineages />
      <PipelineCollapse />
      <TalkToIt />
      <CostOfFrame />
      <Invitation />
    </main>
  );
}

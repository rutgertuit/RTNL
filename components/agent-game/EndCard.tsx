"use client";

import type { GameState } from "@/app/technical/agent-game/cards";

interface EndCardProps {
  state: GameState;
  onReset(): void;
  causeSummary?: string;
}

function meanLoyalty(state: GameState): number {
  const humans = state.employees.filter((e) => e.type === "human");
  if (humans.length === 0) return 0;
  return humans.reduce((s, e) => s + e.loyalty, 0) / humans.length;
}

function formatCashCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return `${n}`;
}

function summariseCause(state: GameState): string {
  if (state.gameResult === "win") {
    return "You crossed the valuation threshold. Edgar would like to renegotiate his options package.";
  }
  if (state.cash <= -1_000_000) return "Bankruptcy. Jochem and Edgar are filing the paperwork.";
  if (state.overcapacityCollapseTurns > 5) return "The office buckled — six straight turns of over-capacity is too long.";
  if (state.employees.filter((e) => e.type === "human").length === 0) return "Talent walkout — every human resigned. The Hermes nodes do not provide commentary.";
  return "Turn cap reached without crossing the valuation threshold.";
}

export function EndCard({ state, onReset, causeSummary }: EndCardProps) {
  const won = state.gameResult === "win";
  const summary = causeSummary ?? summariseCause(state);
  const avgLoyalty = Math.round(meanLoyalty(state));
  return (
    <div className="sim-endcard" role="dialog" aria-modal="true" aria-labelledby="end-title">
      <div className="sim-endcard__inner">
        <h1 id="end-title" className={`sim-endcard__verdict ${won ? "is-win" : "is-loss"}`}>
          {won ? "Cashed out." : "It's over."}
        </h1>
        <p className="sim-endcard__cause">{summary}</p>
        <div className="sim-endcard__stats">
          <div className="sim-endcard__stat">
            <strong>${formatCashCompact(state.valuation)}</strong>
            <span>final valuation</span>
          </div>
          <div className="sim-endcard__stat">
            <strong>{state.turn}</strong>
            <span>turns</span>
          </div>
          <div className="sim-endcard__stat">
            <strong>{avgLoyalty}%</strong>
            <span>avg loyalty</span>
          </div>
          <div className="sim-endcard__stat">
            <strong>v{state.agentVersion}</strong>
            <span>AI version</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="sim-btn sim-btn--next sim-endcard__again"
        >
          Play again →
        </button>
      </div>
    </div>
  );
}

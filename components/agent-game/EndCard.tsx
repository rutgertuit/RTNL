"use client";

import { useState } from "react";
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

function formatCash(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US")}`;
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

function getShareableText(state: GameState): string {
  const turns = state.turn - 1;
  const val = (state.valuation / 1_000_000_000).toFixed(1);
  const difficultyName = state.difficulty.toUpperCase();
  let comment: string;
  if (state.gameResult === "win") {
    comment = "🏆 CEO called me 'General Manager of Cognitive Capital'. Edgar is parameterised, Jochem has his coffee.";
  } else if (state.cash < -1_000_000) {
    comment = "💀 Bankrupt because of KPMG audit fees. Edgar sued the company and Lous went to a hei-sessie without me.";
  } else if (state.overcapacityCollapseTurns > 5) {
    comment = "🏢 Office collapsed — six straight turns over capacity. Lous warned us about the kantoortuin.";
  } else if (state.employees.filter((e) => e.type === "human").length === 0) {
    comment = "🚪 Talent walkout. Last human handed back their badge at the FEBO. The Hermes nodes hum quietly.";
  } else {
    comment = "⏱️ Time expired. Too much interpersonal vagueness. Lous spent 30% of her week bellen with Debiteuren.";
  }
  return `I survived ${turns} turns of the Agent Inclusive Sim [${difficultyName} Mode] — final valuation $${val}B.\n${comment}\nPlay the sim: rutgertuit.nl/technical/agent-game`;
}

export function EndCard({ state, onReset, causeSummary }: EndCardProps) {
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const won = state.gameResult === "win";
  const summary = causeSummary ?? summariseCause(state);
  const avgLoyalty = Math.round(meanLoyalty(state));
  const shareText = getShareableText(state);

  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
            <strong>{state.turn - 1}</strong>
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

        <button
          type="button"
          className="sim-endcard__scorecard-toggle"
          aria-expanded={scorecardOpen}
          aria-controls="endcard-scorecard"
          onClick={() => setScorecardOpen((v) => !v)}
        >
          {scorecardOpen ? "Hide" : "Show"} detailed scorecard
          <span aria-hidden className="sim-endcard__chevron">{scorecardOpen ? "▲" : "▼"}</span>
        </button>

        {scorecardOpen && (
          <div id="endcard-scorecard" className="sim-endcard__scorecard">
            <h2 className="sim-endcard__scorecard-heading">Run summary</h2>
            <dl className="sim-endcard__dl">
              <dt>Final cash</dt>
              <dd>{formatCash(state.cash)}</dd>
              <dt>Final valuation</dt>
              <dd>{formatCash(state.valuation)}</dd>
              <dt>Turns played</dt>
              <dd>{state.turn - 1} / 30</dd>
              <dt>AI version</dt>
              <dd>v{state.agentVersion}</dd>
              <dt>Docs active</dt>
              <dd>{state.hasDocumentation ? "Yes" : "No"}</dd>
              <dt>Team size</dt>
              <dd>{state.employees.length}</dd>
              <dt>Office tier</dt>
              <dd>{state.officeTier}</dd>
            </dl>

            <div className="sim-endcard__share">
              <span className="sim-endcard__share-label">Scorecard</span>
              <textarea
                readOnly
                value={shareText}
                className="sim-endcard__share-text"
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Shareable scorecard text"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="sim-endcard__share-copy"
              >
                {copied ? "✓ Copied Scorecard" : "Copy Scorecard"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

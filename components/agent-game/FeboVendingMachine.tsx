"use client";

import type { FocusEventHandler, MouseEventHandler } from "react";
import type { Card } from "@/app/technical/agent-game/cards";
import { CardTile } from "./CardTile";

interface FeboProps {
  cards: Card[];
  onPull(cardId: string): void;
  onSkip(): void;
  /**
   * Optional per-card hover/focus wiring so the projection context
   * (Phase 5c.2) can preview the draft on hover of the Pull button.
   */
  pullHoverProps?(cardId: string): {
    onMouseEnter?: MouseEventHandler;
    onMouseLeave?: MouseEventHandler;
    onFocus?: FocusEventHandler;
    onBlur?: FocusEventHandler;
  };
}

export function FeboVendingMachine({ cards, onPull, onSkip, pullHoverProps }: FeboProps) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="febo-title" className="sim-febo">
      <div className="sim-febo__machine">
        <div className="sim-febo__header">
          <span className="sim-febo__burger" aria-hidden>🍔</span>
          <h2 id="febo-title" className="sim-febo__title">FEBO Card Automat</h2>
          <p className="sim-febo__sub">Pull a window to add one card to your hand. Free to draft — pay the play cost later.</p>
        </div>
        <div className="sim-febo__compartments">
          {cards.map((c) => {
            const hoverProps = pullHoverProps ? pullHoverProps(c.id) : {};
            return (
              <div key={c.id} className="sim-febo__compartment">
                <div className="sim-febo__glass">
                  <CardTile card={c} disabled />
                </div>
                <button
                  type="button"
                  className="sim-febo__handle"
                  onClick={() => onPull(c.id)}
                  {...hoverProps}
                >
                  Pull window
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" className="sim-febo__skip" onClick={onSkip}>
          Skip this turn&apos;s draft →
        </button>
      </div>
    </div>
  );
}

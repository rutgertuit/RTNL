"use client";

import React, { useEffect, useRef } from "react";
import type { ChaosLog } from "@/app/technical/agent-game/cards";

interface ChaosDialogProps {
  event: ChaosLog;
  onDismiss: () => void;
}

const CATEGORY_LABEL: Record<ChaosLog["cat"], string> = {
  CRIMINAL: "Criminal Activity",
  SUBSTANCE: "Substance / Wellness",
  IDEOLOGICAL: "Ideological Drift",
  INCOMPETENCE: "Operational Incompetence",
};

const formatSigned = (n: number, prefix = ""): string => {
  if (n === 0) return `${prefix}0`;
  const sign = n > 0 ? "+" : "-";
  return `${sign}${prefix}${Math.abs(n).toLocaleString()}`;
};

export function ChaosDialog({ event, onDismiss }: ChaosDialogProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  const prodPct = Math.round((event.productivityNextTurn - 1) * 100);

  return (
    <div
      className="win95-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chaos-title"
    >
      <div className="win95-window win95-modal">
        <div className="win95-title-bar">
          <span className="win95-title-bar__label">⚠ ChaosEngine.exe</span>
          <button
            type="button"
            className="win95-title-btn"
            aria-label="Close"
            onClick={onDismiss}
          >
            X
          </button>
        </div>

        <div className="win95-modal__body">
          <div className="win95-modal__row">
            <div className="win95-modal__icon" aria-hidden>
              ⚠
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                <span className="win95-badge win95-badge--alert">
                  {event.isNamed ? "NAMED EVENT" : "GENERATED EVENT"}
                </span>
                <span className="win95-badge">{CATEGORY_LABEL[event.cat]}</span>
                <span className="win95-badge">{event.pts} pt</span>
              </div>
              <h2 id="chaos-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
                {event.title}
              </h2>
            </div>
          </div>

          <div className="win95-inset" style={{ padding: "8px 10px" }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>{event.body}</p>
          </div>

          <fieldset className="win95-fieldset">
            <legend>Immediate impact</legend>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.55 }}>
              <li>
                Cash:{" "}
                <strong style={{ color: event.cashDelta < 0 ? "#8b0000" : "#1a4d1f" }}>
                  {formatSigned(event.cashDelta, "$")}
                </strong>
              </li>
              <li>
                All-employee loyalty:{" "}
                <strong style={{ color: event.loyaltyDelta < 0 ? "#8b0000" : "#1a4d1f" }}>
                  {formatSigned(event.loyaltyDelta)}
                </strong>
              </li>
              {prodPct !== 0 && (
                <li>
                  Next-turn productivity:{" "}
                  <strong style={{ color: prodPct < 0 ? "#8b0000" : "#1a4d1f" }}>
                    {prodPct > 0 ? "+" : ""}
                    {prodPct}%
                  </strong>
                </li>
              )}
            </ul>
          </fieldset>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4, borderTop: "1px solid #808080" }}>
            <button
              ref={buttonRef}
              type="button"
              className="win95-button win95-button--primary"
              onClick={onDismiss}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Win95TaskbarProps {
  turn: number;
  cashLabel: string;
  difficulty: string;
  chaosActive: boolean;
  onHelp: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export function Win95Taskbar({ turn, cashLabel, difficulty, chaosActive, onHelp, soundOn, onToggleSound }: Win95TaskbarProps) {
  const [time, setTime] = useState("");
  const [startOpen, setStartOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setTime(`${h}:${m < 10 ? "0" + m : m} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {startOpen && (
        <div
          role="menu"
          className="win95-window"
          style={{
            position: "fixed",
            bottom: 32,
            left: 4,
            width: 260,
            zIndex: 1001,
          }}
          onMouseLeave={() => setStartOpen(false)}
        >
          <div className="win95-title-bar">
            <span className="win95-title-bar__label">Agent Inclusive Sim</span>
            <button
              type="button"
              className="win95-title-btn"
              aria-label="Close menu"
              onClick={() => setStartOpen(false)}
            >
              X
            </button>
          </div>
          <div className="win95-window-inner" style={{ padding: 8 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, lineHeight: 1.4 }}>
              <strong>AgentInclusiveSim.exe</strong>
              <br />
              Turn-based corporate-resource sim. Reach the valuation target before AI eats your
              human workforce.
            </p>
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#404040" }}>
              Born from the <em>Agent Inclusive</em> essay on rutgertuit.nl.
            </p>
            <button
              type="button"
              className="win95-button"
              style={{ width: "100%", marginBottom: 4 }}
              onClick={() => {
                setStartOpen(false);
                onHelp();
              }}
            >
              📖 Help / Tutorial
            </button>
            <Link
              className="win95-button"
              href="/business/agent-inclusive"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              📄 Read source article
            </Link>
            <Link
              className="win95-button"
              href="/"
              style={{ width: "100%", textAlign: "center", textDecoration: "none", marginTop: 4 }}
            >
              ⏻ Exit to rutgertuit.nl
            </Link>
          </div>
        </div>
      )}

      <div className="win95-taskbar" role="navigation" aria-label="Game taskbar">
        <button
          type="button"
          className="win95-button win95-start-btn"
          aria-haspopup="menu"
          aria-expanded={startOpen}
          onClick={() => setStartOpen((s) => !s)}
        >
          <span aria-hidden>🟧</span> Start
        </button>

        <div className="win95-taskbar__tasks">
          <button
            type="button"
            className="win95-button win95-task-btn win95-task-btn--active"
            onClick={() => document.getElementById("game-content")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            🖥️ AgentSim — Turn {turn}/30
          </button>
          {chaosActive && (
            <button type="button" className="win95-button win95-task-btn" disabled>
              ⚠ ChaosEngine.exe
            </button>
          )}
        </div>

        <div className="win95-taskbar__tray">
          <button
            type="button"
            className="win95-button"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute sound" : "Enable sound"}
            title={soundOn ? "Sound on — click to mute" : "Sound off — click to enable"}
            style={{ minHeight: 18, padding: "0 6px", fontSize: 12, lineHeight: 1 }}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          <span className="win95-badge win95-badge--cash">{cashLabel}</span>
          <span className="win95-badge">{difficulty}</span>
          <span style={{ minWidth: 56, textAlign: "right", fontFamily: "'Lucida Console', Consolas, monospace" }}>{time}</span>
        </div>
      </div>
    </>
  );
}

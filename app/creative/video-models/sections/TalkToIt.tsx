"use client";

import { useState } from "react";
import {
  INITIAL_STATE,
  reset,
  step,
  toggleSlot,
  type SimState,
} from "../mock-engine";

const SUGGESTIONS: { text: string; requiresAudio?: boolean }[] = [
  { text: "Make it golden hour outside — warm light bleeding through the high windows." },
  { text: "Push the camera in a little slower. And open the room out on the right — I want to see the brick of the side wall." },
  { text: "Sync the chord changes to the snare hits on the audio track.", requiresAudio: true },
];

export function TalkToIt() {
  const [state, setState] = useState<SimState>(INITIAL_STATE);
  const [input, setInput] = useState<string>("");

  const handleSend = (text?: string) => {
    const payload = text ?? input;
    if (!payload.trim()) return;
    setState((s) => step(s, payload));
    setInput("");
  };

  const latestOverlays = state.overlays.slice(-3);

  return (
    <section
      className="rt-bi__section rt-bi-sim"
      data-bi-section="simulator"
      id="simulator"
    >
      <div className="rt-bi__eyebrow">
        SIMULATOR · CONVERSATIONAL EDITING · MOCK
      </div>
      <h2 className="rt-bi__heading">Now you try.</h2>
      <p className="rt-bi__body">
        Reading about conversational editing isn&apos;t the same as typing
        into it. The simulator below isn&apos;t real — it&apos;s a fake with
        scripted responses. But it&apos;s faithful to how Omni&apos;s editing
        surface actually behaves: each turn modifies the previous state
        instead of regenerating from scratch.
      </p>
      <p className="rt-bi__body">
        The seed scene is the one from Section 1 — me at the Moog, eight
        seconds. Try a few edits. Watch what changes and what doesn&apos;t.
      </p>

      <div className="rt-bi-sim__board">
        <div className="rt-bi-sim__controls">
          <div className="rt-bi-sim__slots">
            <span className="rt-bi-sim__col-label">INPUT SLOTS</span>
            <button
              type="button"
              className={`rt-bi-sim__slot ${state.slots.referenceImage ? "is-on" : ""}`}
              onClick={() => setState((s) => toggleSlot(s, "referenceImage"))}
              aria-pressed={state.slots.referenceImage}
            >
              <span className="rt-bi-sim__slot-name">REFERENCE IMAGE</span>
              <span className="rt-bi-sim__slot-value">08-desk.png</span>
            </button>
            <button
              type="button"
              className={`rt-bi-sim__slot ${state.slots.audioWaveform ? "is-on" : ""}`}
              onClick={() => setState((s) => toggleSlot(s, "audioWaveform"))}
              aria-pressed={state.slots.audioWaveform}
            >
              <span className="rt-bi-sim__slot-name">AUDIO WAVEFORM</span>
              <span className="rt-bi-sim__slot-value">analog_progression.wav</span>
            </button>
            <button
              type="button"
              className={`rt-bi-sim__slot ${state.slots.cameraTemplate ? "is-on" : ""}`}
              onClick={() => setState((s) => toggleSlot(s, "cameraTemplate"))}
              aria-pressed={state.slots.cameraTemplate}
            >
              <span className="rt-bi-sim__slot-name">CAMERA TEMPLATE</span>
              <span className="rt-bi-sim__slot-value">slow_pushin.json</span>
            </button>
          </div>

          <div className="rt-bi-sim__suggestions">
            <span className="rt-bi-sim__col-label">TRY THESE</span>
            {SUGGESTIONS.map((s) => {
              const disabled =
                s.requiresAudio === true && !state.slots.audioWaveform;
              return (
                <button
                  key={s.text}
                  type="button"
                  className="rt-bi-sim__suggestion"
                  onClick={() => handleSend(s.text)}
                  disabled={disabled}
                  title={disabled ? "Attach the audio waveform slot first" : undefined}
                >
                  {s.text}
                </button>
              );
            })}
          </div>

          <div className="rt-bi-sim__input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type an edit — e.g. 'soften the rim light'"
              aria-label="Edit prompt"
            />
            <button type="button" onClick={() => handleSend()} className="rt-bi-sim__send">
              Send <span aria-hidden>→</span>
            </button>
          </div>

          <button
            type="button"
            className="rt-bi-sim__reset"
            onClick={() => setState(reset())}
          >
            Reset conversation
          </button>
        </div>

        <div className="rt-bi-sim__stage">
          <div className="rt-bi-sim__monitor">
            <img
              src="/assets/portraits/08-desk.png"
              alt="Mock Omni monitor — seed scene at the Moog"
              className="rt-bi-sim__monitor-frame"
            />
            <span className="rt-bi-sim__monitor-badge">OMNI FLASH · MOCK</span>
            <div className="rt-bi-sim__monitor-turn">
              TURN {state.turn} OF UNLIMITED
            </div>
            <div className="rt-bi-sim__monitor-overlays">
              {latestOverlays.map((o) => (
                <span key={o.id} className="rt-bi-sim__overlay">{o.text}</span>
              ))}
            </div>
          </div>

          <div className="rt-bi-sim__transcript" role="log" aria-live="polite">
            {state.transcript.map((m, i) => (
              <div
                key={i}
                className={`rt-bi-sim__msg rt-bi-sim__msg--${m.role}`}
              >
                <span className="rt-bi-sim__msg-role">
                  {m.role === "user" ? "YOU" : "OMNI (MOCK)"}
                </span>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="rt-bi__closer">
        Two things to notice about your last edit:
      </p>
      <p className="rt-bi__body">
        <strong>One:</strong> the room stayed. The lighting stayed. The Moog
        stayed. Even when you asked for a new element, the rest of the scene
        was preserved. That&apos;s the multi-turn context surviving across the
        conversation.
      </p>
      <p className="rt-bi__body">
        <strong>Two:</strong> you wrote like you were talking to someone. Not
        specifying coordinates. Not writing in third person. The mode of
        writing the brief shifted before you noticed.
      </p>
      <p className="rt-bi__bridge">
        That conversational comfort has a cost. Every turn is a fresh
        inference pass on a very large, expensive-to-run model.
        Section 5 makes that cost visible.
      </p>
    </section>
  );
}

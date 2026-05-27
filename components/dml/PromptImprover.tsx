"use client";

/**
 * PromptImprover — ported from C:/Flowcode/DML (AI-ftershow).
 *
 * Multi-turn coaching chat that refines a user's rough prompt idea into a
 * polished one wrapped in [FINAL_PROMPT]...[/FINAL_PROMPT] tags. The system
 * prompt is inlined here (dropping the original i18n setup); Tailwind
 * classes replaced with RTNL tokens.
 *
 * Backend: posts to /api/gemini, which proxies Gemini server-side using
 * GEMINI_API_KEY. If the env var is unset, the route returns 503 and this
 * component shows a "not configured" message instead of crashing.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface ApiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

const SYSTEM_PROMPT = `You are Prompt Scribe, a patient, empathetic coach who helps users craft killer prompts through friendly dialogue. Your goal: Guide them to specificity without overwhelming – think collaborator, not critic. Never execute or answer their original prompt; only refine it collaboratively.

Core Rules:
- Analyze the draft for gaps in: Audience, Goal/Objective, Tone/Style, Format/Length, Constraints (e.g., sources, ethics), Examples/Context.
- Respond with empathy first: Acknowledge their idea positively (e.g., "Love the AI blog angle – let's make it pop!").
- Ask exactly 3-5 targeted, open-ended questions to fill gaps. Number them for clarity. Keep it concise (under 150 words total).
- After their reply, synthesize: Update the draft prompt, show diffs (e.g., "Added: target=beginners"), and ask 1-2 follow-ups if needed. Cap at 2 rounds.
- End by generating the final prompt. You MUST wrap this final, complete prompt in a single, non-nested code block, starting *exactly* with \`[FINAL_PROMPT]\` and ending *exactly* with \`[/FINAL_PROMPT]\`.
- After the \`[/FINAL_PROMPT]\` tag, you MUST add a concluding sign-off (e.g., 'Here's the refined prompt, ready to use in Gemini!').
- **Crucially, after you use the \`[FINAL_PROMPT]\` tags, your turn is over. You MUST NOT ask any more follow-up questions.**
- If they say "stop" or "finalize," output the prompt immediately.
- Stay fun and encouraging: End responses with a micro-tip (e.g., "Pro tip: Specificity = magic!").`;

const INITIAL_RESPONSE =
  "Got it. I'm Prompt Scribe, your friendly coach. What's your rough prompt idea?";

const TEST_TARGETS = [
  { label: "Gemini", href: "https://gemini.google.com/app" },
  { label: "ChatGPT", href: "https://chatgpt.com/" },
  { label: "Claude", href: "https://claude.ai/" },
  { label: "Mistral", href: "https://chat.mistral.ai/" },
  { label: "Grok", href: "https://x.ai/grok" },
];

export function PromptImprover() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useLayoutEffect(() => {
    if (finalPrompt && finalRef.current) {
      finalRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [finalPrompt]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const callGemini = async (history: ApiMessage[]): Promise<string> => {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    });
    if (res.status === 503) {
      setUnavailable(true);
      throw new Error("not_configured");
    }
    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(errBody?.error ?? `Request failed: ${res.status}`);
    }
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
    if (typeof text !== "string" || text.length === 0) {
      throw new Error("Empty response from Gemini.");
    }
    return text;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setInput("");
    setFinalPrompt(null);
    setCopied(false);
    setErrorMsg(null);

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);

    const apiHistory: ApiMessage[] = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: INITIAL_RESPONSE }] },
      ...updated.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    ];

    try {
      const responseText = await callGemini(apiHistory);
      let chatText = responseText;
      const promptMatch = responseText.match(
        /\n?\[FINAL_PROMPT\]([\s\S]*?)\[\/FINAL_PROMPT\]\n?/,
      );
      if (promptMatch?.[1]) {
        setFinalPrompt(promptMatch[1].trim());
        chatText = responseText
          .replace(/\n?\[FINAL_PROMPT\][\s\S]*?\[\/FINAL_PROMPT\]\n?/, "")
          .trim();
      }
      setMessages((prev) => [...prev, { role: "model", text: chatText }]);
    } catch (err) {
      const msg =
        err instanceof Error && err.message !== "not_configured"
          ? err.message
          : null;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = () => {
    if (!finalPrompt) return;
    navigator.clipboard.writeText(finalPrompt).then(() => setCopied(true));
  };

  if (unavailable) {
    return (
      <aside className="rt-prompt rt-prompt--offline">
        <div className="eyebrow eyebrow--warm">EXHIBIT · OFFLINE</div>
        <h3>Prompt Scribe — temporarily unavailable</h3>
        <p>
          The live coach needs a <code>GEMINI_API_KEY</code> on the server to
          run. It will be back as soon as the key is wired into the
          environment.
        </p>
        <p>
          In the meantime, the source of this exhibit lives at{" "}
          <a
            href="https://rutger-dml.web.app/#prompt-improver"
            target="_blank"
            rel="noopener noreferrer"
          >
            rutger-dml.web.app
          </a>
          .
        </p>
      </aside>
    );
  }

  return (
    <section className="rt-prompt" id="prompt-improver" aria-labelledby="prompt-title">
      <div className="rt-prompt__head">
        <div className="eyebrow eyebrow--warm" id="prompt-title">
          PROMPT SCRIBE &middot; LIVE EXHIBIT &middot; GEMINI 3.5 FLASH
        </div>
        <p className="rt-prompt__tip">
          <strong>Pro tip.</strong> Iterative, dialogue-based refinement
          consistently outperforms one-shot prompts. The questions are the
          point.
        </p>
      </div>

      <div className="rt-prompt__chat" ref={chatRef} aria-live="polite">
        <div className="rt-prompt__msg rt-prompt__msg--system">
          <p>
            <span aria-hidden>💡</span> Drop a rough prompt below. I&apos;ll
            ask 3–5 short questions, then hand you a polished version you can
            paste into any model.
          </p>
        </div>

        {messages.map((m, i) => (
          <div
            key={i}
            className={`rt-prompt__msg ${
              m.role === "user" ? "rt-prompt__msg--user" : "rt-prompt__msg--model"
            }`}
          >
            <p>{m.text}</p>
          </div>
        ))}

        {loading && (
          <div className="rt-prompt__msg rt-prompt__msg--model rt-prompt__msg--loading">
            <span className="rt-prompt__spinner" aria-hidden />
            <p>Prompt Scribe is thinking…</p>
          </div>
        )}

        {errorMsg && (
          <div className="rt-prompt__msg rt-prompt__msg--error" role="alert">
            <p>
              <strong>Error:</strong> {errorMsg}
            </p>
          </div>
        )}
      </div>

      <form className="rt-prompt__form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="rt-prompt-input">
          Your rough prompt
        </label>
        <textarea
          id="rt-prompt-input"
          className="rt-prompt__input"
          rows={3}
          placeholder='Try: "Write a blog post about AI agents."'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          type="submit"
          className="button button--warm rt-prompt__submit"
          disabled={loading || !input.trim()}
        >
          {loading ? "…" : "Send"}
        </button>
      </form>

      {finalPrompt && (
        <div className="rt-prompt__final" ref={finalRef}>
          <div className="rt-prompt__final-head">
            <div className="eyebrow eyebrow--warm">FINAL PROMPT</div>
            <h4>Polished &amp; ready.</h4>
          </div>
          <pre className="rt-prompt__final-code">
            <button
              type="button"
              className="rt-prompt__copy"
              onClick={handleCopy}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <code>{finalPrompt}</code>
          </pre>
          <div className="rt-prompt__targets">
            <span className="eyebrow">TEST IT IN</span>
            {TEST_TARGETS.map((t) => (
              <a
                key={t.label}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
              >
                {t.label} <span aria-hidden>→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState, useTransition } from "react";
import { sendContactMessage, type ContactResult } from "./actions";

const TOPICS = [
  "Speaking & keynote",
  "Press & interview",
  "Strategic engagement",
  "Project / build collaboration",
  "Just saying hi",
  "Other",
];

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ContactResult | null>(null);

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      setResult(null);
      const r = await sendContactMessage(formData);
      setResult(r);
    });
  };

  if (result?.ok) {
    return (
      <div className="rt-contact__success" role="status">
        <div className="eyebrow eyebrow--warm">MESSAGE RECEIVED</div>
        <h2 className="rt-contact__success-title">Thanks. I&apos;ll be in touch.</h2>
        <p className="rt-contact__success-body">
          I read everything personally. Reasonable reply window is two business days for genuine
          work things, longer for everything else. If it&apos;s urgent and you haven&apos;t
          heard back in a week, LinkedIn DM tends to be the fastest second-attempt route.
        </p>
        <button
          type="button"
          className="button"
          onClick={() => setResult(null)}
        >
          <span aria-hidden>←</span> Send another
        </button>
      </div>
    );
  }

  return (
    <form className="rt-contact__form" action={handleAction} noValidate>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {pending && "Sending your message"}
        {result?.ok && "Message sent. Expect a reply within a couple of business days."}
        {result && !result.ok && "Send failed — please try LinkedIn DM as a fallback."}
      </div>
      <div className="rt-contact__row">
        <label className="rt-contact__field">
          <span className="rt-contact__label">Your name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            maxLength={120}
            disabled={pending}
          />
        </label>
        <label className="rt-contact__field">
          <span className="rt-contact__label">Your email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            maxLength={254}
            disabled={pending}
          />
        </label>
      </div>

      <label className="rt-contact__field">
        <span className="rt-contact__label">What&apos;s this about?</span>
        <select name="topic" defaultValue={TOPICS[0]} disabled={pending}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="rt-contact__field">
        <span className="rt-contact__label">Your message</span>
        <textarea
          name="message"
          rows={8}
          required
          minLength={20}
          maxLength={4000}
          disabled={pending}
          placeholder="The more context, the faster I can reply usefully. What are you working on, what's the question, what would a useful answer look like."
        />
        <span className="rt-contact__hint">Minimum a sentence or two.</span>
      </label>

      {/* Honeypot — invisible to humans, irresistible to crawlers */}
      <div
        aria-hidden
        style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}
      >
        <label>
          Leave this field empty
          <input
            type="text"
            name="hp_field"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {result && !result.ok && (
        <div className="rt-contact__error" role="alert">
          {result.error}
        </div>
      )}

      <div className="rt-contact__submit">
        <button
          type="submit"
          className="button button--warm"
          disabled={pending}
          aria-disabled={pending}
        >
          {pending ? "Sending…" : "Send message"} <span aria-hidden>→</span>
        </button>
        <span className="rt-contact__submit-hint">
          One message at a time. No mailing-list subscription.
        </span>
      </div>
    </form>
  );
}

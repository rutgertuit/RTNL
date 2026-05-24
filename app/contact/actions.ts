"use server";

/**
 * Server Action for the /contact form. Validates inputs, drops bot
 * submissions via honeypot, then ships the message via Resend's REST
 * API (no SDK dependency — straight fetch).
 *
 * Required env vars at runtime:
 *   RESEND_API_KEY      — get from https://resend.com (free tier covers
 *                         ~3000 emails / month, more than enough)
 *   RESEND_FROM         — verified-domain sender, e.g.
 *                         "Rutgertuit Contact <contact@rutgertuit.nl>".
 *                         Falls back to Resend's onboarding@resend.dev
 *                         sandbox sender if unset (works without domain
 *                         verification but limits to your own inbox).
 *   CONTACT_TO_EMAIL    — recipient inbox; defaults to
 *                         rutger@rutgertuit.nl
 *
 * To wire on Cloud Run:
 *   gcloud run services update rutgertuit-web \
 *     --set-secrets=RESEND_API_KEY=RESEND_API_KEY:latest \
 *     --region=europe-west4
 */

export interface ContactResult {
  ok: boolean;
  error?: string;
}

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_TOPIC = 80;
const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactMessage(formData: FormData): Promise<ContactResult> {
  // Honeypot — bots fill this hidden field, real users don't.
  // Silently succeed so the bot thinks it worked and stops retrying.
  const honeypot = (formData.get("hp_field") ?? "").toString().trim();
  if (honeypot) {
    return { ok: true };
  }

  const name = (formData.get("name") ?? "").toString().trim().slice(0, MAX_NAME);
  const email = (formData.get("email") ?? "").toString().trim().slice(0, MAX_EMAIL);
  const topic = (formData.get("topic") ?? "Other").toString().trim().slice(0, MAX_TOPIC);
  const message = (formData.get("message") ?? "").toString().trim().slice(0, MAX_MESSAGE);

  if (!name || !email || !message) {
    return { ok: false, error: "Please fill in name, email, and message." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "That email address doesn't look right." };
  }
  if (message.length < MIN_MESSAGE) {
    return { ok: false, error: "The message is a bit short — give me a sentence or two of context." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Log so the submission isn't completely lost during local dev /
    // before the secret is wired up.
    console.error("[contact] RESEND_API_KEY not set — submission captured to logs only:", {
      name,
      email,
      topic,
      messagePreview: message.slice(0, 120),
    });
    return {
      ok: false,
      error: "The contact form isn't fully wired up yet. Reach out on LinkedIn for now.",
    };
  }

  const from = process.env.RESEND_FROM ?? "rutgertuit.nl <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO_EMAIL ?? "rutger@rutgertuit.nl";

  const subject = `[rutgertuit.nl] ${topic} — ${name}`;
  const text =
    `New message from rutgertuit.nl/contact\n` +
    `--------------------------------------\n` +
    `From:    ${name} <${email}>\n` +
    `Topic:   ${topic}\n` +
    `--------------------------------------\n\n` +
    `${message}\n`;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error(`[contact] Resend ${resp.status}:`, body.slice(0, 500));
      return {
        ok: false,
        error: "Couldn't send right now. Try again in a minute, or reach out on LinkedIn.",
      };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contact] Send error:", err);
    return {
      ok: false,
      error: "Something broke on the way through. Try again or use LinkedIn.",
    };
  }
}

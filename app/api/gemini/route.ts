import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

/**
 * Server-side proxy to the Gemini API. Ported from C:/Flowcode/DML's
 * geminiProxy Cloud Function. Keeps GEMINI_API_KEY off the client.
 *
 * Set `GEMINI_API_KEY` in the Cloud Run env (or .env.local for dev) before
 * the PromptImprover exhibit on /creative/interactivity can actually fire.
 * Without it, this route 503s and the client renders a "not configured"
 * fallback so the rest of the article still ships.
 */

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

interface ApiMessagePart {
  text: string;
}
interface ApiMessage {
  role: "user" | "model";
  parts: ApiMessagePart[];
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Per-IP throttle before any cost-incurring work — this route proxies the
  // paid Gemini API, so an unthrottled public endpoint is a financial risk.
  const ip = clientIpFromHeaders(request.headers);
  const limit = rateLimit(`gemini:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured on server." },
      { status: 503 },
    );
  }

  let body: { contents?: ApiMessage[] } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.contents || !Array.isArray(body.contents) || body.contents.length === 0) {
    return NextResponse.json(
      { error: "Request must include a non-empty `contents` array." },
      { status: 400 },
    );
  }

  // Minimal validation — ensure every entry has role + parts[].text
  for (const msg of body.contents) {
    if (
      !msg ||
      (msg.role !== "user" && msg.role !== "model") ||
      !Array.isArray(msg.parts) ||
      msg.parts.length === 0 ||
      typeof msg.parts[0]?.text !== "string"
    ) {
      return NextResponse.json(
        { error: "Malformed message in contents." },
        { status: 400 },
      );
    }
  }

  try {
    const upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents: body.contents }),
    });

    if (!upstream.ok) {
      const errPayload = await upstream.json().catch(() => ({}));
      return NextResponse.json(
        { error: errPayload?.error?.message ?? "Gemini API error." },
        { status: upstream.status },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error." },
      { status: 500 },
    );
  }
}

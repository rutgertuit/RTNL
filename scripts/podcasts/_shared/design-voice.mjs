#!/usr/bin/env node
/**
 * Design an ElevenLabs voice from a text description and emit a sample MP3
 * for human approval. No episode is regenerated here.
 *
 * Usage:
 *   node scripts/podcasts/_shared/design-voice.mjs \
 *     --name "Rutger Tuit (podcast)" \
 *     --desc "Warm, measured Dutch man in his mid-40s speaking English with a mild, consistent Dutch accent. Relaxed expert-peer tone, conversational, light musical cadence, never lecturing." \
 *     --out scratch/voices/rutger-sample.mp3
 *
 * Prints the new permanent voice_id. Drop it into the episode voices.json
 * files once the sample is approved.
 *
 * Prerequisites: ELEVENLABS_API_KEY in web/.env.local (or env). Node 20+.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..", "..", ".."); // web/

async function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const raw = await fs.readFile(path.join(WEB_ROOT, ".env.local"), "utf8").catch(() => "");
  const m = raw.match(/^ELEVENLABS_API_KEY=(.*)$/m);
  return m ? m[1].replace(/^"|"$/g, "") : null;
}
function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : def;
}

const SAMPLE_TEXT =
  "So here's the thing — most of the panic about AI is the wrong panic. " +
  "Walk into a rented holiday kitchen: the cooking hasn't changed, only the drawers. " +
  "The real question is simple. What does this actually change for the person on the other end?";

const apiKey = await loadKey();
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY missing (env or web/.env.local).");
  process.exit(3);
}
const name = arg("--name");
const desc = arg("--desc");
const out = arg("--out", "scratch/voices/sample.mp3");
const text = arg("--text", SAMPLE_TEXT);
if (!name || !desc) {
  console.error("Need --name and --desc.");
  process.exit(2);
}

const H = { "xi-api-key": apiKey, "Content-Type": "application/json" };

// 1. design → previews[].generated_voice_id
const design = await fetch("https://api.elevenlabs.io/v1/text-to-voice/design", {
  method: "POST",
  headers: H,
  body: JSON.stringify({ voice_description: desc, text }),
}).then(async (r) => {
  if (!r.ok) throw new Error(`design ${r.status}: ${(await r.text()).slice(0, 240)}`);
  return r.json();
});
const gen = design.previews?.[0]?.generated_voice_id;
if (!gen) throw new Error("no generated_voice_id in design response");
console.log("generated_voice_id:", gen);

// 2. save → permanent voice_id
const saved = await fetch("https://api.elevenlabs.io/v1/text-to-voice", {
  method: "POST",
  headers: H,
  body: JSON.stringify({ generated_voice_id: gen, voice_name: name, voice_description: desc }),
}).then(async (r) => {
  if (!r.ok) throw new Error(`save ${r.status}: ${(await r.text()).slice(0, 240)}`);
  return r.json();
});
console.log("PERMANENT voice_id:", saved.voice_id);

// 3. sample MP3 (eleven_v3 to match the renderer)
const audio = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${saved.voice_id}?output_format=mp3_44100_128`,
  {
    method: "POST",
    headers: { ...H, Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_v3",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  },
).then(async (r) => {
  if (!r.ok) throw new Error(`tts ${r.status}: ${(await r.text()).slice(0, 240)}`);
  return r.arrayBuffer();
});
await fs.mkdir(path.join(WEB_ROOT, path.dirname(out)), { recursive: true });
await fs.writeFile(path.join(WEB_ROOT, out), Buffer.from(audio));
console.log("sample written:", out);

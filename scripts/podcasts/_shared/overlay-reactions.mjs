#!/usr/bin/env node
/**
 * EXPERIMENTAL — real overlap / talk-over layer.
 *
 * The Text to Dialogue endpoint renders turns sequentially; it never puts two
 * voices in the air at once. To get genuine talk-over (a laugh THROUGH a line,
 * a quick cut-in), we mix it in afterwards:
 *
 *   1. Take the already dialogue-rendered base track (ep01.mp3).
 *   2. Find the turn-handoff gaps in it with ffmpeg `silencedetect`.
 *   3. Generate each short reaction as its own single-voice v3 clip.
 *   4. Place each reaction to START slightly BEFORE its target gap, so it
 *      overlaps the tail of the preceding line (= real overlap), at reduced
 *      gain, via adelay + amix.
 *   5. Re-limit + loudnorm the mix.
 *
 * Output is written to a PREVIEW file (ep01.overlay-preview.mp3) so the live
 * episode is never clobbered while we're judging the effect. The clean base is
 * also copied to ep01.dialogue.mp3 the first time, as an A/B reference.
 *
 *   reactions.json (per episode dir):
 *     {
 *       "reactions": [
 *         { "gapIndex": 5, "speaker": "FRITS", "text": "[laughs]",
 *           "leadMs": 350, "gain": 0.55 }
 *       ]
 *     }
 *   gapIndex   — which detected handoff gap to attach to (see --gaps).
 *   leadMs     — how far before the gap the reaction starts (the overlap).
 *   gain       — reaction level under the speech (0..1).
 *
 * Usage:
 *   cd web
 *   node scripts/podcasts/_shared/overlay-reactions.mjs <slug> --gaps   # list gaps
 *   node scripts/podcasts/_shared/overlay-reactions.mjs <slug>          # build preview
 *   node scripts/podcasts/_shared/overlay-reactions.mjs <slug> --apply  # promote preview → ep01
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PODCASTS_ROOT = path.resolve(__dirname, "..");
const WEB_ROOT = path.resolve(__dirname, "..", "..", "..");
const OUTPUT_ROOT = path.join(WEB_ROOT, "public", "audio", "podcasts");

async function loadEnvLocal() {
  try {
    const raw = await fs.readFile(path.join(WEB_ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {}
}

function ffmpeg(args, { capture = false } = {}) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const child = spawn("ffmpeg", ["-hide_banner", ...args], {
      stdio: ["ignore", "ignore", capture ? "pipe" : "inherit"],
    });
    if (capture) child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 || capture ? resolve(stderr) : reject(new Error(`ffmpeg exited ${code}`)),
    );
  });
}

/** Detect the silence gaps (turn hand-offs) in the base track. */
async function detectGaps(base) {
  const out = await ffmpeg(
    ["-i", base, "-af", "silencedetect=noise=-30dB:d=0.18", "-f", "null", "-"],
    { capture: true },
  );
  const gaps = [];
  const re = /silence_start:\s*([\d.]+)[\s\S]*?silence_end:\s*([\d.]+)/g;
  let m;
  while ((m = re.exec(out))) {
    gaps.push({ start: parseFloat(m[1]), end: parseFloat(m[2]) });
  }
  return gaps;
}

async function synthReaction({ apiKey, voiceId, text, file }) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_v3",
      voice_settings: { stability: 0.4, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const slug = args.find((a) => !a.startsWith("--"));
  if (!slug) {
    console.error("Usage: node overlay-reactions.mjs <slug> [--gaps] [--apply]");
    process.exit(2);
  }

  const epDir = path.join(OUTPUT_ROOT, slug);
  const base = path.join(epDir, "ep01.mp3");
  const dialogueRef = path.join(epDir, "ep01.dialogue.mp3");
  const preview = path.join(epDir, "ep01.overlay-preview.mp3");
  if (!existsSync(base)) {
    console.error(`[${slug}] no ep01.mp3 — render the episode first.`);
    process.exit(1);
  }

  // --apply: promote a previously-built preview to the live episode.
  if (flags.has("--apply")) {
    if (!existsSync(preview)) {
      console.error(`[${slug}] no preview to apply — build one first.`);
      process.exit(1);
    }
    await fs.copyFile(preview, base);
    console.log(`[${slug}] preview promoted → ep01.mp3`);
    return;
  }

  const gaps = await detectGaps(base);
  if (flags.has("--gaps")) {
    console.log(`[${slug}] ${gaps.length} hand-off gaps detected:`);
    gaps.forEach((g, i) =>
      console.log(`   #${String(i).padStart(2, "0")}  start ${g.start.toFixed(2)}s  end ${g.end.toFixed(2)}s`),
    );
    return;
  }

  await loadEnvLocal();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY missing.");
    process.exit(3);
  }

  const reactionsPath = path.join(PODCASTS_ROOT, slug, "reactions.json");
  if (!existsSync(reactionsPath)) {
    console.error(`[${slug}] no reactions.json — author one (see --gaps for indices).`);
    process.exit(1);
  }
  const { reactions } = JSON.parse(await fs.readFile(reactionsPath, "utf8"));
  const voices = JSON.parse(await fs.readFile(path.join(PODCASTS_ROOT, slug, "voices.json"), "utf8"));

  if (!existsSync(dialogueRef)) await fs.copyFile(base, dialogueRef); // A/B reference

  const tmp = path.join(epDir, ".overlay");
  await fs.mkdir(tmp, { recursive: true });

  // Synthesize each reaction + compute its start time (overlap into the gap's
  // preceding speech).
  const placed = [];
  for (let i = 0; i < reactions.length; i++) {
    const r = reactions[i];
    // Target by explicit gapIndex, or by time (atSec) snapped to the nearest
    // detected hand-off gap — time is easier to author against the script.
    let gap;
    if (typeof r.gapIndex === "number") {
      gap = gaps[r.gapIndex];
    } else if (typeof r.atSec === "number") {
      gap = gaps.reduce((best, g) =>
        Math.abs(g.start - r.atSec) < Math.abs(best.start - r.atSec) ? g : best, gaps[0]);
    }
    if (!gap) {
      console.warn(`   reaction ${i}: no resolvable gap (gapIndex/atSec) — skipped.`);
      continue;
    }
    const voiceId = voices[r.speaker]?.voiceId;
    if (!voiceId) {
      console.warn(`   reaction ${i}: no voice for ${r.speaker} — skipped.`);
      continue;
    }
    const file = path.join(tmp, `r${i}.mp3`);
    process.stdout.write(`   reaction ${i}: ${r.speaker} ${JSON.stringify(r.text)} @ ${gap.start.toFixed(2)}s … `);
    await synthReaction({ apiKey, voiceId, text: r.text, file });
    const startMs = Math.max(0, Math.round(gap.start * 1000 - (r.leadMs ?? 300)));
    placed.push({ file, startMs, gain: r.gain ?? 0.55 });
    process.stdout.write(`start ${startMs}ms\n`);
  }
  if (placed.length === 0) {
    console.error(`[${slug}] no reactions placed — nothing to do.`);
    process.exit(1);
  }

  // Build the amix graph: base + each delayed/attenuated reaction.
  const inputs = ["-i", base, ...placed.flatMap((p) => ["-i", p.file])];
  const filters = placed
    .map((p, i) => `[${i + 1}:a]adelay=delays=${p.startMs}:all=1,volume=${p.gain}[r${i}]`)
    .join(";");
  const mixIns = ["[0:a]", ...placed.map((_, i) => `[r${i}]`)].join("");
  const filterComplex =
    `${filters};${mixIns}amix=inputs=${placed.length + 1}:duration=longest:normalize=0[m];` +
    `[m]alimiter=level_in=1:level_out=0.96:limit=0.9:attack=5:release=50,` +
    `loudnorm=I=-16:TP=-1.5:LRA=11:dual_mono=true[out]`;

  console.log(`[${slug}] mixing ${placed.length} reaction(s) over the base …`);
  await ffmpeg([
    "-y", "-loglevel", "error", ...inputs,
    "-filter_complex", filterComplex,
    "-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2",
    preview,
  ]);
  const stat = await fs.stat(preview);
  console.log(`[${slug}] preview → ${path.relative(WEB_ROOT, preview)} (${Math.round(stat.size / 1024)} KB)`);
  console.log(`[${slug}] A/B: clean = ep01.dialogue.mp3 · overlaid = ep01.overlay-preview.mp3`);
  console.log(`[${slug}] happy? promote with: node scripts/podcasts/_shared/overlay-reactions.mjs ${slug} --apply`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

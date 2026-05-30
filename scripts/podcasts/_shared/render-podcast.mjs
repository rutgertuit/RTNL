#!/usr/bin/env node
/**
 * Per-page podcast renderer.
 *
 * For each podcast directory under `web/scripts/podcasts/<slug>/`, this
 * script reads:
 *
 *   - script.md   — dialog in the format:
 *
 *         RUTGER:  Line of dialog.
 *
 *         FRITS:   Another line. Multi-sentence lines stay together.
 *
 *         RUTGER:  And another.
 *
 *     Speaker label is uppercase + colon. Everything until the next
 *     speaker label belongs to the previous speaker. Blank lines are
 *     fine. Lines starting with `#` or `//` are comments and skipped.
 *
 *   - voices.json — keys are speaker labels (uppercase), values carry the
 *     voiceId (the per-speaker settings from the old per-line path are kept
 *     for reference but the dialogue endpoint takes settings top-level):
 *
 *         {
 *           "RUTGER":  { "voiceId": "..." },
 *           "FRITS":   { "voiceId": "..." },
 *           "_dialogue": { "stability": 0.5, "seed": 12345 }   // optional
 *         }
 *
 *     The optional "_dialogue" key sets the episode-wide v3 stability
 *     (0.0 Creative / 0.5 Natural / 1.0 Robust) and seed. Defaults:
 *     stability 0.5, seed derived deterministically from the slug.
 *
 * Generates the conversation with ElevenLabs' Text to Dialogue endpoint
 * (eleven_v3) — turns are batched on speaker boundaries (≤1800 chars/request)
 * so the model delivers each batch as one cohesive multi-speaker exchange with
 * natural turn-taking and interruptions, instead of isolated concatenated
 * lines. Batch MP3s are ffmpeg-concatenated + mastered, and written to:
 *
 *     web/public/audio/podcasts/<slug>/ep01.mp3
 *
 * Inline v3 audio tags in the script text — [laughs], [interrupting],
 * [overlapping], em-dash (—) for cut-offs, ellipsis (…) for trailing — flow
 * straight through to the model. The script CONTENT is never modified here.
 *
 * Usage:
 *     cd web
 *     node scripts/podcasts/_shared/render-podcast.mjs <slug>
 *     node scripts/podcasts/_shared/render-podcast.mjs --all
 *     node scripts/podcasts/_shared/render-podcast.mjs --list
 *     node scripts/podcasts/_shared/render-podcast.mjs <slug> --dry-run
 *
 * Prerequisites:
 *     - ELEVENLABS_API_KEY in web/.env.local (or in env).
 *     - ffmpeg on $PATH (used for the concat + LUFS master).
 *     - Node 20+ (built-in fetch).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PODCASTS_ROOT = path.resolve(__dirname, ".."); // web/scripts/podcasts
const WEB_ROOT = path.resolve(__dirname, "..", "..", ".."); // web/
const OUTPUT_ROOT = path.join(WEB_ROOT, "public", "audio", "podcasts");

// ---------- env ----------

async function loadEnvLocal() {
  const envPath = path.join(WEB_ROOT, ".env.local");
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      const [, k, v] = m;
      if (!process.env[k]) process.env[k] = v.replace(/^"|"$/g, "");
    }
  } catch {
    /* .env.local missing is fine if the key is in process.env already */
  }
}

// ---------- discovery ----------

async function listPodcastDirs() {
  const entries = await fs.readdir(PODCASTS_ROOT, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name)
    .sort();
}

// ---------- script parser ----------

function parseScript(raw) {
  const lines = [];
  let current = null;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#") || trimmed.startsWith("//")) continue;
    const m = trimmed.match(/^([A-Z][A-Z0-9_-]*)\s*:\s*(.*)$/);
    if (m) {
      if (current && current.text) lines.push(current);
      current = { speaker: m[1], text: m[2].trim() };
    } else if (current) {
      current.text += " " + trimmed;
    }
  }
  if (current && current.text) lines.push(current);
  return lines;
}

// ---------- elevenlabs (Text to Dialogue, eleven_v3) ----------

/**
 * Why dialogue and not per-line TTS:
 * The old path synthesised every line in isolation via
 * /v1/text-to-speech/{voiceId} and concatenated the clips — so each line was
 * delivered with zero awareness of the conversation around it (flat
 * turn-taking, no reactive intonation, no overlap). The Text to Dialogue
 * endpoint generates a whole multi-speaker exchange in one pass, so the model
 * carries emotional context across turns and handles natural timing /
 * interruptions. eleven_v3 only. Inline audio tags ([laughs], [interrupting],
 * em-dash for cut-offs) in the script text flow straight through.
 *
 * Constraints we design around (verified against the live docs, 2026-05):
 *   - inputs[] = [{ text, voice_id }] — NO per-turn settings.
 *   - settings / seed / apply_text_normalization are TOP-LEVEL only.
 *   - Keep total characters across all inputs[].text ≤ ~2000 per request →
 *     we batch on speaker-turn boundaries (MAX_DIALOGUE_CHARS below).
 *   - No previous_text/next_text continuity on this endpoint; the only
 *     cross-batch consistency lever is a shared `seed` (+ same voices +
 *     same settings), which we hold constant for the whole episode.
 *   - v3 stability is discrete: 0.0 Creative / 0.5 Natural / 1.0 Robust
 *     (Robust ignores audio tags). Default 0.5 for expressive-but-stable.
 */

const DIALOGUE_MODEL = "eleven_v3";
// Live docs cap dialogue at ~2000 chars total across inputs; leave headroom.
// Held at 1900 (just under the cap) so each episode renders in as few
// independent generations as possible — fewer batches = less cross-batch
// accent/voice drift, the main lever the dialogue endpoint gives us beyond
// a shared seed + the (now accent-locked) voice itself.
const MAX_DIALOGUE_CHARS = 1900;
const DEFAULT_STABILITY = 0.5; // Natural
const DEFAULT_TEXT_NORMALIZATION = "auto";

/** Deterministic 32-bit seed from the slug so re-renders stay consistent. */
function seedFromSlug(slug) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0; // unsigned 0..4294967295
}

/** Split one over-long turn into ≤MAX_DIALOGUE_CHARS pieces on sentence
 *  boundaries, preserving the speaker. Rare for podcast lines but keeps a
 *  monologue from 422-ing the dialogue request. */
function splitLongText(text) {
  if (text.length <= MAX_DIALOGUE_CHARS) return [text];
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const pieces = [];
  let buf = "";
  for (const s of sentences) {
    if (buf && buf.length + s.length > MAX_DIALOGUE_CHARS) {
      pieces.push(buf.trim());
      buf = "";
    }
    buf += s;
  }
  if (buf.trim()) pieces.push(buf.trim());
  return pieces;
}

/** Group parsed turns into dialogue batches, each ≤MAX_DIALOGUE_CHARS total,
 *  split only on speaker-turn boundaries so the model sees coherent exchanges. */
function batchTurns(lines, voices) {
  const batches = [];
  let current = [];
  let chars = 0;
  const push = (speaker, text) => {
    const voiceId = voices[speaker].voiceId;
    if (current.length && chars + text.length > MAX_DIALOGUE_CHARS) {
      batches.push(current);
      current = [];
      chars = 0;
    }
    current.push({ speaker, text, voice_id: voiceId });
    chars += text.length;
  };
  for (const l of lines) {
    for (const piece of splitLongText(l.text)) push(l.speaker, piece);
  }
  if (current.length) batches.push(current);
  return batches;
}

async function synthesizeDialogue({ apiKey, inputs, stability, seed }) {
  const url = `https://api.elevenlabs.io/v1/text-to-dialogue?output_format=mp3_44100_128`;
  const body = {
    inputs: inputs.map((t) => ({ text: t.text, voice_id: t.voice_id })),
    model_id: DIALOGUE_MODEL,
    settings: { stability },
    seed,
    apply_text_normalization: DEFAULT_TEXT_NORMALIZATION,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status}: ${errText.slice(0, 240)}`);
  }
  const arrBuf = await res.arrayBuffer();
  return Buffer.from(arrBuf);
}

// ---------- ffmpeg helpers ----------

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], {
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}

/**
 * Full podcast mastering chain. The previous Multiplier Myth episode was
 * processed with a multi-stage chain rather than a single loudnorm pass;
 * matching that here so the new episodes sit at the same loudness, density
 * and clarity.
 *
 *   1. highpass=f=80           — kill mic rumble + room hum below 80 Hz
 *   2. acompressor (light)     — even out voice dynamics, gentle 3:1
 *   3. acompressor (tighter)   — podcast-density 6:1 for presence
 *   4. deesser (sibilance)     — tame harsh /s/ /sh/ artefacts at ~6 kHz
 *   5. alimiter                — true-peak ceiling at -1.5 dB before loudnorm
 *   6. loudnorm                — master to broadcast podcast target -16 LUFS
 *
 * `dualmono=true` on loudnorm so mono input is treated as stereo for the
 * LUFS calculation (ElevenLabs outputs mono).
 */
const MASTERING_CHAIN = [
  "highpass=f=80",
  "acompressor=threshold=-18dB:ratio=3:attack=5:release=80:makeup=2",
  "acompressor=threshold=-12dB:ratio=6:attack=8:release=200:makeup=2",
  "deesser=i=0.4",
  "alimiter=level_in=1:level_out=0.96:limit=0.85:attack=5:release=50",
  "loudnorm=I=-16:TP=-1.5:LRA=11:dual_mono=true",
].join(",");

async function concatAndMaster(lineFiles, output) {
  // Build a temp concat listfile next to the output.
  const concatList = output + ".concat.txt";
  const listLines = lineFiles.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  await fs.writeFile(concatList, listLines, "utf8");
  await runFfmpeg([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatList,
    "-af",
    MASTERING_CHAIN,
    "-c:a",
    "libmp3lame",
    "-q:a",
    "2",
    output,
  ]);
  await fs.unlink(concatList).catch(() => {});
}

/**
 * Re-master an existing rendered episode WITHOUT calling ElevenLabs again.
 * Reads the cached per-batch dialogue MP3s from .batches/ and re-runs the
 * mastering chain over them. Use this to apply chain tweaks to already-
 * rendered episodes for free.
 */
async function remasterPodcast(slug) {
  const batchesDir = path.join(OUTPUT_ROOT, slug, ".batches");
  if (!existsSync(batchesDir)) {
    console.error(`[${slug}] no .batches/ cache — render first.`);
    return "missing";
  }
  const cached = (await fs.readdir(batchesDir))
    .filter((f) => f.endsWith(".mp3"))
    .sort()
    .map((f) => path.join(batchesDir, f));
  if (cached.length === 0) {
    console.error(`[${slug}] .batches/ is empty.`);
    return "missing";
  }
  const output = path.join(OUTPUT_ROOT, slug, "ep01.mp3");
  console.log(`[${slug}] remastering from ${cached.length} cached batch(es) …`);
  await concatAndMaster(cached, output);
  const stat = await fs.stat(output);
  console.log(`[${slug}] done (${Math.round(stat.size / 1024)} KB).`);
  return "rendered";
}

// ---------- per-podcast render ----------

async function renderPodcast(slug, { dryRun, force, apiKey }) {
  const dir = path.join(PODCASTS_ROOT, slug);
  const scriptPath = path.join(dir, "script.md");
  const voicesPath = path.join(dir, "voices.json");
  if (!existsSync(scriptPath)) {
    console.error(`[${slug}] missing script.md — skipping.`);
    return "missing";
  }
  if (!existsSync(voicesPath)) {
    console.error(`[${slug}] missing voices.json — skipping.`);
    return "missing";
  }

  const [scriptRaw, voicesRaw] = await Promise.all([
    fs.readFile(scriptPath, "utf8"),
    fs.readFile(voicesPath, "utf8"),
  ]);
  const voices = JSON.parse(voicesRaw);
  const lines = parseScript(scriptRaw);
  if (lines.length === 0) {
    console.error(`[${slug}] script.md parsed to zero lines — bailing.`);
    return "failed";
  }

  // Validate that every speaker label has a voice.
  const speakers = [...new Set(lines.map((l) => l.speaker))];
  const missing = speakers.filter((s) => !voices[s]);
  if (missing.length) {
    console.error(`[${slug}] no voice configured for: ${missing.join(", ")}`);
    return "failed";
  }

  const outputDir = path.join(OUTPUT_ROOT, slug);
  const outputFile = path.join(outputDir, "ep01.mp3");
  if (existsSync(outputFile) && !force && !dryRun) {
    const stat = await fs.stat(outputFile);
    console.log(`[${slug}] skipped (exists, ${Math.round(stat.size / 1024)} KB) — use --force to overwrite.`);
    return "skipped";
  }

  // Episode-level dialogue config: one shared stability + seed across all
  // batches (the only cross-batch consistency lever the dialogue endpoint
  // gives us). Overridable per episode via an optional "_dialogue" key in
  // voices.json: { "stability": 0.5, "seed": 12345 }.
  const dialogueCfg = voices._dialogue ?? {};
  const stability = dialogueCfg.stability ?? DEFAULT_STABILITY;
  const seed = dialogueCfg.seed ?? seedFromSlug(slug);

  const batches = batchTurns(lines, voices);

  console.log(
    `[${slug}] ${lines.length} turns → ${batches.length} dialogue batch(es), ` +
      `${speakers.length} speakers (${speakers.join(", ")}); stability=${stability}, seed=${seed}.`,
  );
  if (dryRun) {
    batches.forEach((b, bi) => {
      const chars = b.reduce((s, t) => s + t.text.length, 0);
      console.log(`   batch ${bi + 1}: ${b.length} turns, ${chars} chars`);
      for (const t of b.slice(0, 3)) {
        console.log(`      ${t.speaker}: ${t.text.slice(0, 70)}${t.text.length > 70 ? "…" : ""}`);
      }
      if (b.length > 3) console.log(`      …(${b.length - 3} more turns)`);
    });
    return "dry-run";
  }

  await fs.mkdir(outputDir, { recursive: true });
  const tempDir = path.join(outputDir, ".batches");
  await fs.mkdir(tempDir, { recursive: true });

  const batchFiles = [];
  for (let i = 0; i < batches.length; i++) {
    const batchPath = path.join(tempDir, `${String(i).padStart(3, "0")}.mp3`);
    if (existsSync(batchPath) && !force) {
      batchFiles.push(batchPath);
      continue;
    }
    const chars = batches[i].reduce((s, t) => s + t.text.length, 0);
    process.stdout.write(`   [${String(i + 1).padStart(2, "0")}/${batches.length}] dialogue · ${batches[i].length} turns · ${chars} chars … `);
    let attempt = 0;
    while (true) {
      try {
        const buf = await synthesizeDialogue({ apiKey, inputs: batches[i], stability, seed });
        await fs.writeFile(batchPath, buf);
        process.stdout.write(`${Math.round(buf.length / 1024)} KB\n`);
        batchFiles.push(batchPath);
        break;
      } catch (err) {
        attempt++;
        if (attempt >= 3) {
          process.stdout.write(`FAILED after 3 tries\n`);
          throw err;
        }
        const wait = attempt * 4000;
        process.stdout.write(`retry in ${wait / 1000}s (${err.message?.slice(0, 60)})\n`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }

  console.log(`[${slug}] concatenating ${batchFiles.length} batch(es) → ${path.relative(WEB_ROOT, outputFile)}`);
  await concatAndMaster(batchFiles, outputFile);
  const finalStat = await fs.stat(outputFile);
  console.log(`[${slug}] done (${Math.round(finalStat.size / 1024)} KB).`);

  return "rendered";
}

// ---------- CLI ----------

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const positional = args.filter((a) => !a.startsWith("--"));
  const dryRun = flags.has("--dry-run");
  const force = flags.has("--force");
  const remaster = flags.has("--remaster");

  await loadEnvLocal();
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (flags.has("--list")) {
    const dirs = await listPodcastDirs();
    console.log("Discovered podcast directories:");
    for (const d of dirs) console.log("   " + d);
    return;
  }

  let targets;
  if (flags.has("--all")) {
    targets = await listPodcastDirs();
  } else if (positional.length > 0) {
    targets = positional;
  } else {
    console.error("Usage: node render-podcast.mjs <slug> [--force] [--dry-run] [--remaster]");
    console.error("       node render-podcast.mjs --all [--remaster]");
    console.error("       node render-podcast.mjs --list");
    console.error();
    console.error("--remaster   re-run the ffmpeg mastering chain on the cached .lines/");
    console.error("             from a previous render. No ElevenLabs calls. Free.");
    process.exit(2);
  }

  // --remaster mode doesn't touch the API — just re-runs the chain on the
  // already-rendered per-line MP3s.
  if (remaster) {
    const summary = { rendered: 0, missing: 0, failed: 0 };
    for (const slug of targets) {
      try {
        const result = await remasterPodcast(slug);
        summary[result] = (summary[result] ?? 0) + 1;
      } catch (err) {
        console.error(`[${slug}] remaster failed: ${err.message}`);
        summary.failed++;
      }
    }
    console.log();
    console.log("Remaster summary:", summary);
    return;
  }

  if (!apiKey && !dryRun) {
    console.error("ELEVENLABS_API_KEY missing (looked in env + web/.env.local). Add it and retry.");
    process.exit(3);
  }

  const summary = { rendered: 0, skipped: 0, failed: 0, missing: 0, "dry-run": 0 };
  for (const slug of targets) {
    try {
      const result = await renderPodcast(slug, { dryRun, force, apiKey });
      summary[result] = (summary[result] ?? 0) + 1;
    } catch (err) {
      console.error(`[${slug}] failed: ${err.message}`);
      summary.failed++;
    }
  }
  console.log();
  console.log("Summary:", summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

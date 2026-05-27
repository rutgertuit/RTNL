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
 *   - voices.json — keys are speaker labels (uppercase), values:
 *
 *         {
 *           "RUTGER":  { "voiceId": "...", "model": "eleven_v3",
 *                        "stability": 0.5, "similarity": 0.85 },
 *           "FRITS":   { "voiceId": "...", ... }
 *         }
 *
 * Renders each line with the matching voice via ElevenLabs REST,
 * ffmpeg-concatenates the per-line MP3s into one track, and writes to:
 *
 *     web/public/audio/podcasts/<slug>/ep01.mp3
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

// ---------- elevenlabs ----------

const TTS_MODEL_DEFAULT = "eleven_v3";

async function synthesizeLine({ apiKey, voiceId, model, text, settings }) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const body = {
    text,
    model_id: model ?? TTS_MODEL_DEFAULT,
    voice_settings: {
      stability: settings?.stability ?? 0.5,
      similarity_boost: settings?.similarity ?? 0.85,
      style: settings?.style ?? 0,
      use_speaker_boost: settings?.useSpeakerBoost ?? true,
    },
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

async function concatAndMaster(lineFiles, output) {
  // Build a temp concat listfile next to the output.
  const concatList = output + ".concat.txt";
  const listLines = lineFiles.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  await fs.writeFile(concatList, listLines, "utf8");
  // Concat + master to -16 LUFS in one pass.
  await runFfmpeg([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatList,
    "-af",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "2",
    output,
  ]);
  await fs.unlink(concatList).catch(() => {});
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

  console.log(`[${slug}] ${lines.length} lines, ${speakers.length} speakers (${speakers.join(", ")}).`);
  if (dryRun) {
    for (const l of lines.slice(0, 8)) {
      console.log(`   ${l.speaker}: ${l.text.slice(0, 80)}${l.text.length > 80 ? "…" : ""}`);
    }
    if (lines.length > 8) console.log(`   …(${lines.length - 8} more lines)`);
    return "dry-run";
  }

  await fs.mkdir(outputDir, { recursive: true });
  const tempDir = path.join(outputDir, ".lines");
  await fs.mkdir(tempDir, { recursive: true });

  const lineFiles = [];
  for (let i = 0; i < lines.length; i++) {
    const { speaker, text } = lines[i];
    const cfg = voices[speaker];
    const linePath = path.join(tempDir, `${String(i).padStart(3, "0")}_${speaker}.mp3`);
    if (existsSync(linePath) && !force) {
      lineFiles.push(linePath);
      continue;
    }
    process.stdout.write(`   [${String(i + 1).padStart(3, "0")}/${lines.length}] ${speaker} … `);
    let attempt = 0;
    while (true) {
      try {
        const buf = await synthesizeLine({
          apiKey,
          voiceId: cfg.voiceId,
          model: cfg.model,
          text,
          settings: cfg,
        });
        await fs.writeFile(linePath, buf);
        process.stdout.write(`${Math.round(buf.length / 1024)} KB\n`);
        lineFiles.push(linePath);
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

  console.log(`[${slug}] concatenating ${lineFiles.length} lines → ${path.relative(WEB_ROOT, outputFile)}`);
  await concatAndMaster(lineFiles, outputFile);
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
    console.error("Usage: node render-podcast.mjs <slug> [--force] [--dry-run]");
    console.error("       node render-podcast.mjs --all");
    console.error("       node render-podcast.mjs --list");
    process.exit(2);
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

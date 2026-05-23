#!/usr/bin/env node
/**
 * validate-registry.mjs — fail-loud validator for content/registry.json
 *
 * Run via `npm run registry:validate`. Wire into Cloud Build pre-deploy
 * to refuse pushes that produce an invalid registry.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const schemaPath = resolve(root, "content/registry.schema.json");
const registryPath = resolve(root, "content/registry.json");

const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const registry = JSON.parse(readFileSync(registryPath, "utf-8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(registry);

if (!valid) {
  console.error("❌ registry.json failed schema validation:\n");
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath || "(root)"} ${err.message}`);
  }
  process.exit(1);
}

// Extra invariants beyond JSON Schema:
const ids = new Set();
const slugCollKeys = new Set();
let extraErrors = 0;

for (const item of registry.items) {
  if (ids.has(item.id)) {
    console.error(`❌ duplicate id: ${item.id}`);
    extraErrors++;
  }
  ids.add(item.id);

  const key = `${item.collection}:${item.slug}`;
  if (slugCollKeys.has(key)) {
    console.error(`❌ duplicate slug within collection: ${key}`);
    extraErrors++;
  }
  slugCollKeys.add(key);

  for (const relatedId of item.related_items ?? []) {
    if (!registry.items.some((other) => other.id === relatedId)) {
      console.error(`❌ ${item.id}: related_items references unknown id "${relatedId}"`);
      extraErrors++;
    }
  }

  // Cloud CDN rule: media URLs must be CDN-hosted, never Cloud Run origin
  for (const media of item.media ?? []) {
    const url = media.cdn_url;
    const allowed =
      url.startsWith("https://media.rutgertuit.nl/") ||
      url.startsWith("https://storage.googleapis.com/rutgertuit-media/");
    if (!allowed) {
      console.error(
        `❌ ${item.id}: media url must be CDN-hosted: ${url}`
      );
      extraErrors++;
    }
  }
}

if (extraErrors > 0) {
  console.error(`\n${extraErrors} invariant violation(s).`);
  process.exit(1);
}

console.log(`✅ registry.json valid (${registry.items.length} item(s))`);

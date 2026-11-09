#!/usr/bin/env node
/**
 * =============================================================
 *  check-lang.mjs — validate lang/fa.json and lang/en.json
 * =============================================================
 *  Checks:
 *    1. Both files parse as JSON.
 *    2. Both files expose the exact same flat key set.
 *    3. No value is empty or whitespace-only.
 *    4. No leaf is an unexpected type (must be string).
 *    5. Optional: every data-i18n* key used in HTML/site.js
 *       exists in fa.json (catches hand-edits after extraction).
 *
 *  Usage: node scripts/check-lang.mjs
 *  Exit code 0 = pass, 1 = problems found.
 * =============================================================
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

/* ---------- load ------------------------------------------------- */

function load(name) {
  const path = join(ROOT, 'lang', name);
  if (!existsSync(path)) {
    problems.push(`missing file: lang/${name}`);
    return {};
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    problems.push(`lang/${name} is not valid JSON: ${e.message}`);
    return {};
  }
}

/** Flatten nested object → Map<dottedKey, value>. */
function flatten(obj, prefix = '', out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, key, out);
    } else {
      out.set(key, v);
    }
  }
  return out;
}

const fa = flatten(load('fa.json'));
const en = flatten(load('en.json'));

/* ---------- 1–4: key parity, types, empties ---------------------- */

for (const [name, map] of [['fa', fa], ['en', en]]) {
  if (map.size === 0) continue;
  for (const [key, value] of map) {
    if (typeof value !== 'string') {
      problems.push(`${name}: ${key} is ${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value}, expected string`);
    } else if (value.trim() === '') {
      problems.push(`${name}: ${key} is empty`);
    }
  }
}

const faKeys = new Set(fa.keys());
const enKeys = new Set(en.keys());

for (const key of faKeys) {
  if (!enKeys.has(key)) problems.push(`missing in en.json: ${key}`);
}
for (const key of enKeys) {
  if (!faKeys.has(key)) problems.push(`missing in fa.json: ${key}`);
}

/* ---------- 5: source keys covered by fa.json ------------------- */

const attrRe = /data-i18n(-html|-ph|-title|-aria|-alt|-content)?="([a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*)*)"/g;
const sourceKeys = new Map(); // key → first file seen

const sources = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')).map((f) => join(ROOT, f)),
  join(ROOT, 'assets', 'js', 'site.js')
].filter(existsSync);

for (const file of sources) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(attrRe)) {
    const key = m[2];
    if (!sourceKeys.has(key)) sourceKeys.set(key, file.replace(ROOT + '/', ''));
  }
}

for (const [key, file] of sourceKeys) {
  if (!faKeys.has(key)) problems.push(`key used in ${file} but absent from fa.json: ${key}`);
}

/* ---------- report ----------------------------------------------- */

if (problems.length === 0) {
  console.log(`[check-lang] OK — ${fa.size} fa keys, ${en.size} en keys, ${sourceKeys.size} keys referenced in source, all in parity.`);
  process.exit(0);
}

console.log(`[check-lang] ${problems.length} problem(s):`);
for (const p of problems) console.log('  ✗ ' + p);
process.exit(1);

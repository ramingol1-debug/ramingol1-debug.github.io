#!/usr/bin/env node
/**
 * =============================================================
 *  extract-fa.mjs — generate lang/fa.json from the source files
 * =============================================================
 *  Persian is the source language: every page carries inline
 *  Persian text plus a data-i18n key (SEO / no-JS fallback).
 *  This script harvests those strings so Persian is never
 *  written twice by hand.
 *
 *  Sources
 *    • *.html (root)  — data-i18n, -html, -ph, -title, -aria,
 *                       -alt, -content attributes
 *    • assets/js/site.js — shared chrome (header/footer/fabs)
 *    • <title> + meta description per data-page → meta.<page>.*
 *    • index.html Organization JSON-LD → schema.organization.*
 *
 *  Output: lang/fa.json (sorted keys, 2-space indent, UTF-8)
 *
 *  Usage: node scripts/extract-fa.mjs
 * =============================================================
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'lang', 'fa.json');

/* ---------- tiny helpers ---------------------------------------- */

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&nbsp;': ' ', '&zwnj;': '\u200c', '&hellip;': '…'
};
function decode(s) {
  return s.replace(/&(amp|lt|gt|quot|#39|nbsp|zwnj|hellip);/g, (m) => ENTITIES[m] ?? m);
}
function squash(s) {
  return decode(s).replace(/\s+/g, ' ').trim();
}

/** Find the element tag that owns the attribute match at `idx`. */
function findTagStart(text, idx) {
  const lt = text.lastIndexOf('<', idx);
  if (lt === -1) return -1;
  const m = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(text.slice(lt, lt + 40));
  return m ? lt : -1;
}

/**
 * Extract every data-i18n* pair from `text` (HTML file or JS template).
 * Returns Map<key, { value, kind, where }> — kind: text | attr:<name>
 */
function harvest(text, where, dict, warnings) {
  const attrRe = /data-i18n(-html|-ph|-title|-aria|-alt|-content)?="([^"]+)"/g;
  let m;
  while ((m = attrRe.exec(text)) !== null) {
    const suffix = m[1] || '';
    const key = m[2];
    // Skip JS string-concatenation artifacts such as data-i18n="' + key + '".
    if (!/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/.test(key)) {
      warnings.push(`${where}: skipped non-literal key ${JSON.stringify(key)}`);
      continue;
    }
    const kind =
      suffix === '-html' ? 'text' :
      suffix === '' ? 'text' :
      'attr:' + ({ '-ph': 'placeholder', '-title': 'title', '-aria': 'aria-label', '-alt': 'alt', '-content': 'content' })[suffix];
    const ATTR_PREFIX_LEN = 'attr:'.length;

    const tagStart = findTagStart(text, m.index);
    if (tagStart === -1) { warnings.push(`${where}: cannot locate tag for key "${key}"`); continue; }
    const tagEnd = text.indexOf('>', m.index);
    if (tagEnd === -1) { warnings.push(`${where}: unterminated tag for key "${key}"`); continue; }
    const tagBody = text.slice(tagStart, tagEnd + 1);
    const tagName = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(tagBody)[1];

    let value = '';
    if (kind === 'text') {
      // Content runs until the first closing tag of the same name
      // (our content never nests the same element).
      const close = text.indexOf('</' + tagName + '>', tagEnd);
      if (close === -1) { warnings.push(`${where}: no </${tagName}> for key "${key}"`); continue; }
      value = squash(text.slice(tagEnd + 1, close));
      // Strip any inner tags (data-i18n-html content keeps entities only)
      value = value.replace(/<[^>]*>/g, '');
    } else {
      const attr = kind.slice(ATTR_PREFIX_LEN);
      const am = new RegExp('\\b' + attr + '="([^"]*)"').exec(tagBody);
      if (!am) { warnings.push(`${where}: missing ${attr}="" for key "${key}"`); continue; }
      value = squash(am[1]);
    }

    if (!value) { warnings.push(`${where}: empty value for key "${key}"`); continue; }

    const prev = dict.get(key);
    if (prev && prev.value !== value) {
      warnings.push(`${where}: conflicting value for "${key}" (kept first: "${prev.value}" vs "${value}")`);
      continue;
    }
    if (!prev) dict.set(key, { value, kind, where });
  }
}

/** Nested setter: "a.b.c" → { a: { b: { c: value } } } */
function setPath(obj, path, value) {
  const parts = path.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof node[parts[i]] !== 'object' || node[parts[i]] === null) node[parts[i]] = {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

/* ---------- scan -------------------------------------------------- */

/** Manual Persian values for keys whose inline source is an English
 *  UI attribute (aria-label="Menu", title="Top", …). */
const OVERRIDES = {
  'a11y.menu': 'منو',
  'a11y.top': 'بالا',
  'cta.chatShort': 'گفت‌وگو'
};

const warnings = [];
const dict = new Map();

const htmlFiles = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
for (const f of htmlFiles) {
  const text = readFileSync(join(ROOT, f), 'utf8');
  harvest(text, f, dict, warnings);

  // meta.<page>.title / .description
  const page = /data-page="([^"]+)"/.exec(text)?.[1];
  const title = /<title>([\s\S]*?)<\/title>/.exec(text)?.[1];
  const desc = /<meta name="description" content="([^"]*)"/.exec(text)?.[1];
  if (page && title) dict.set(`meta.${page}.title`, { value: squash(title), kind: 'seo', where: f });
  if (page && desc) dict.set(`meta.${page}.description`, { value: squash(desc), kind: 'seo', where: f });
}

// Shared chrome rendered by site.js
const siteJs = join(ROOT, 'assets', 'js', 'site.js');
if (existsSync(siteJs)) harvest(readFileSync(siteJs, 'utf8'), 'assets/js/site.js', dict, warnings);

// Organization schema from the home page
const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
for (const block of indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try {
    const data = JSON.parse(block[1]);
    if (data['@type'] === 'Organization') {
      if (data.name) dict.set('schema.organization.name', { value: squash(data.name), kind: 'seo', where: 'index.html' });
      if (data.description) dict.set('schema.organization.description', { value: squash(data.description), kind: 'seo', where: 'index.html' });
    }
  } catch { /* not JSON-LD we care about */ }
}

/* ---------- build nested output ---------------------------------- */

const out = {};
for (const [key, meta] of [...dict.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  setPath(out, key, OVERRIDES[key] ?? meta.value);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

/* ---------- report ------------------------------------------------ */

const count = dict.size;
const byKind = {};
for (const { kind } of dict.values()) byKind[kind] = (byKind[kind] || 0) + 1;

console.log(`[extract-fa] wrote ${OUT}`);
console.log(`[extract-fa] ${count} keys from ${htmlFiles.length} HTML files + site.js`);
console.log('[extract-fa] by kind:', JSON.stringify(byKind));
if (warnings.length) {
  console.log(`[extract-fa] ${warnings.length} warning(s):`);
  for (const w of warnings) console.log('  ! ' + w);
} else {
  console.log('[extract-fa] no warnings');
}

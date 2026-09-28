#!/usr/bin/env node
// Report gzipped JS and CSS sizes in a build folder and fail when the total is over budget.
// usage: node bundle-budget.mjs <dist> [--budget-kb 250]

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
const dist = args.find((a) => !a.startsWith("--")) || "dist";
const budgetIndex = args.indexOf("--budget-kb");
const budgetKb = budgetIndex >= 0 ? Number(args[budgetIndex + 1]) : 250;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(dist)
  .filter((f) => /\.(js|mjs|css)$/.test(f))
  .map((f) => ({ file: relative(dist, f), kind: f.endsWith(".css") ? "css" : "js", gz: gzipSync(readFileSync(f)).length }))
  .sort((a, b) => b.gz - a.gz);

const kb = (bytes) => (bytes / 1024).toFixed(1);
for (const f of files) console.log(`${kb(f.gz).padStart(8)} KB  ${f.kind.padEnd(3)}  ${f.file}`);
const js = files.filter((f) => f.kind === "js").reduce((s, f) => s + f.gz, 0);
const css = files.filter((f) => f.kind === "css").reduce((s, f) => s + f.gz, 0);
console.log(`\nJS ${kb(js)} KB gzipped, CSS ${kb(css)} KB gzipped, budget ${budgetKb} KB for JS`);
if (js / 1024 > budgetKb) {
  console.log("over budget");
  process.exit(1);
}

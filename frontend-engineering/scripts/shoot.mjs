#!/usr/bin/env node
// Render HTML files or URLs at several viewports and themes, lint the result,
// and optionally record a scripted walkthrough video. Run with --help for usage.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const USAGE = `usage: node shoot.mjs <file|dir|url>... [options]

  --out <dir>             output folder (default ./shots)
  --viewports <list>      name=WxH,... (default desktop=1440x900,tablet=1024x600,small=800x480,phone=390x844)
  --themes <list>         theme values to apply, e.g. light,dark (default: none, page as-is)
  --theme-attr <name>     attribute set on <html> for a theme (default data-theme)
  --full-page             capture the full scroll height, not only the viewport
  --sheet                 also build one contact sheet PNG per page
  --min-target <px>       smallest allowed tap target when linting (default 44)
  --no-lint               skip the lint pass
  --video <steps.json>    record a walkthrough of the first target using a steps file
  --video-viewport <WxH>  viewport for the walkthrough (default first viewport)

Steps file: [{"do":"click","selector":"text=Library"},{"do":"wait","ms":600},
  {"do":"type","selector":"#q","text":"water"},{"do":"press","key":"Enter"},
  {"do":"goto","url":"#/maps"},{"do":"theme","value":"dark"},{"do":"scroll","y":600}]

Writes PNGs, report.json and report.md to --out. Exit code 1 when lint finds errors.`;

const DEFAULT_VIEWPORTS = "desktop=1440x900,tablet=1024x600,small=800x480,phone=390x844";
const TOOLS_DIR = join(homedir(), ".cache", "paperclip-skill-tools");

function parseArgs(argv) {
  const opts = {
    targets: [], out: "shots", viewports: DEFAULT_VIEWPORTS, themes: "", themeAttr: "data-theme",
    fullPage: false, sheet: false, minTarget: 44, lint: true, video: null, videoViewport: null,
  };
  const valueFlags = {
    "--out": "out", "--viewports": "viewports", "--themes": "themes", "--theme-attr": "themeAttr",
    "--min-target": "minTarget", "--video": "video", "--video-viewport": "videoViewport",
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") { console.log(USAGE); process.exit(0); }
    else if (arg === "--full-page") opts.fullPage = true;
    else if (arg === "--sheet") opts.sheet = true;
    else if (arg === "--no-lint") opts.lint = false;
    else if (valueFlags[arg]) opts[valueFlags[arg]] = argv[++i];
    else if (arg.startsWith("--")) throw new Error(`unknown option ${arg}`);
    else opts.targets.push(arg);
  }
  if (!opts.targets.length) { console.error(USAGE); process.exit(2); }
  opts.minTarget = Number(opts.minTarget);
  return opts;
}

function parseViewports(spec) {
  return spec.split(",").map((entry) => {
    const [name, size] = entry.includes("=") ? entry.split("=") : [entry, entry];
    const [width, height] = size.toLowerCase().split("x").map(Number);
    if (!width || !height) throw new Error(`bad viewport "${entry}"`);
    return { name, width, height };
  });
}

function loadPlaywright() {
  const requireFrom = createRequire(join(TOOLS_DIR, "package.json"));
  try {
    return requireFrom("playwright");
  } catch {
    console.error(`installing playwright into ${TOOLS_DIR} (one time)`);
    mkdirSync(TOOLS_DIR, { recursive: true });
    if (!existsSync(join(TOOLS_DIR, "package.json"))) writeFileSync(join(TOOLS_DIR, "package.json"), "{\"private\":true}\n");
    execFileSync("npm", ["install", "--silent", "--prefix", TOOLS_DIR, "playwright"], { stdio: "inherit" });
    execFileSync(join(TOOLS_DIR, "node_modules", ".bin", "playwright"), ["install", "chromium"], { stdio: "inherit" });
    return requireFrom("playwright");
  }
}

function expandTargets(targets) {
  return targets.flatMap((target) => {
    if (/^https?:\/\//.test(target) || target.startsWith("file://")) return [{ name: slugFromUrl(target), url: target }];
    const path = resolve(target);
    if (!existsSync(path)) throw new Error(`not found: ${target}`);
    const files = statSync(path).isDirectory()
      ? readdirSync(path).filter((f) => f.endsWith(".html")).sort().map((f) => join(path, f))
      : [path];
    return files.map((file) => ({ name: basename(file, extname(file)), url: pathToFileURL(file).href }));
  });
}

function slugFromUrl(url) {
  const { host, pathname, hash } = new URL(url);
  const slug = `${pathname}${hash}`.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return slug || host.replace(/[^a-z0-9]+/gi, "-");
}

async function applyTheme(page, attr, value) {
  if (!value) return;
  await page.evaluate(([a, v]) => document.documentElement.setAttribute(a, v), [attr, value]);
  await page.waitForTimeout(150);
}

// Runs in the page. Finds layout and touch problems a reviewer would otherwise have to spot by eye.
function lintPage(minTarget) {
  const problems = [];
  const describe = (el) => {
    const label = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}` : "";
    return `${el.tagName.toLowerCase()}${id}${cls}${label ? ` "${label}"` : ""}`;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0;
  };

  const doc = document.documentElement;
  if (doc.scrollWidth > window.innerWidth + 1) {
    problems.push({ level: "error", rule: "horizontal-overflow", detail: `page is ${doc.scrollWidth}px wide in a ${window.innerWidth}px viewport` });
  }

  const interactive = document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=switch], [role=checkbox], [tabindex]:not([tabindex='-1'])");
  for (const el of interactive) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < minTarget || r.height < minTarget) {
      const inline = el.tagName === "A" && getComputedStyle(el).display === "inline";
      if (!inline) problems.push({ level: "warn", rule: "small-target", detail: `${describe(el)} is ${Math.round(r.width)}x${Math.round(r.height)}` });
    }
    const name = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title") || el.textContent.trim() || el.getAttribute("placeholder") || (el.id && document.querySelector(`label[for="${el.id}"]`));
    if (!name && !el.closest("label")) problems.push({ level: "error", rule: "no-accessible-name", detail: describe(el) });
  }

  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el) || el.children.length) continue;
    const s = getComputedStyle(el);
    const clipsX = el.scrollWidth > el.clientWidth + 1 && ["hidden", "clip"].includes(s.overflowX);
    if (clipsX && s.textOverflow !== "ellipsis") problems.push({ level: "warn", rule: "clipped-text", detail: `${describe(el)} is cut off without an ellipsis` });
  }

  for (const svg of document.querySelectorAll("svg")) {
    if (!visible(svg)) continue;
    const box = svg.viewBox && svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    if (box && box.width && box.width <= 48 && r.width > box.width * 4) {
      problems.push({ level: "error", rule: "icon-blowout", detail: `${box.width}px icon drawn at ${Math.round(r.width)}x${Math.round(r.height)} inside ${describe(svg.parentElement)}` });
    }
  }

  for (const img of document.querySelectorAll("img")) {
    if (!img.complete || img.naturalWidth === 0) problems.push({ level: "error", rule: "broken-image", detail: img.getAttribute("src") });
    if (!img.hasAttribute("alt")) problems.push({ level: "warn", rule: "img-no-alt", detail: img.getAttribute("src") });
  }
  return problems;
}

async function shootAll(browser, opts, pages, viewports, themes) {
  const results = [];
  for (const target of pages) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
      const page = await context.newPage();
      const consoleErrors = [];
      const external = new Set();
      page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
      page.on("pageerror", (err) => consoleErrors.push(err.message));
      page.on("request", (req) => {
        const u = new URL(req.url());
        const local = u.protocol === "file:" || u.protocol === "data:" || u.protocol === "blob:" || ["localhost", "127.0.0.1", "0.0.0.0"].includes(u.hostname) || u.hostname.endsWith(".localhost");
        if (!local) external.add(`${u.protocol}//${u.host}`);
      });
      await page.goto(target.url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      for (const theme of themes) {
        await applyTheme(page, opts.themeAttr, theme);
        const file = `${target.name}__${theme || "default"}__${vp.name}-${vp.width}x${vp.height}.png`;
        await page.screenshot({ path: join(opts.out, file), fullPage: opts.fullPage });
        const problems = opts.lint ? await page.evaluate(lintPage, opts.minTarget) : [];
        results.push({ page: target.name, url: target.url, viewport: vp, theme: theme || null, file, problems });
      }
      const last = results[results.length - 1];
      last.consoleErrors = consoleErrors;
      last.externalRequests = [...external];
      await context.close();
    }
  }
  return results;
}

async function buildSheets(browser, opts, results) {
  const byPage = Map.groupBy ? Map.groupBy(results, (r) => r.page) : results.reduce((m, r) => m.set(r.page, [...(m.get(r.page) || []), r]), new Map());
  const sheets = [];
  for (const [name, shots] of byPage) {
    const cells = shots.map((s) => `<figure><img src="${pathToFileURL(resolve(opts.out, s.file)).href}"><figcaption>${s.viewport.name} ${s.viewport.width}x${s.viewport.height}${s.theme ? ` · ${s.theme}` : ""}</figcaption></figure>`).join("");
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;padding:24px;background:#1b1b1f;color:#eee;font:14px system-ui,sans-serif}
      h1{font-size:18px;margin:0 0 16px}
      .grid{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
      figure{margin:0;background:#2a2a30;padding:8px;border-radius:8px}
      img{display:block;max-height:420px;max-width:640px;border:1px solid #444}
      figcaption{padding-top:6px;color:#aaa}</style><h1>${name}</h1><div class="grid">${cells}</div>`;
    const page = await browser.newPage({ viewport: { width: 1800, height: 900 } });
    await page.setContent(html, { waitUntil: "load" });
    const file = `${name}__sheet.png`;
    await page.screenshot({ path: join(opts.out, file), fullPage: true });
    await page.close();
    sheets.push(file);
  }
  return sheets;
}

async function recordWalkthrough(browser, opts, target, viewports) {
  const steps = JSON.parse(readFileSync(opts.video, "utf8"));
  const vp = opts.videoViewport ? parseViewports(opts.videoViewport)[0] : viewports[0];
  const size = { width: vp.width, height: vp.height };
  const context = await browser.newContext({ viewport: size, recordVideo: { dir: opts.out, size } });
  const page = await context.newPage();
  await page.goto(target.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  for (const step of steps) {
    if (step.do === "click") await page.click(step.selector);
    else if (step.do === "type") await page.fill(step.selector, step.text);
    else if (step.do === "press") await page.keyboard.press(step.key);
    else if (step.do === "wait") await page.waitForTimeout(step.ms ?? 500);
    else if (step.do === "scroll") await page.mouse.wheel(0, step.y ?? 400);
    else if (step.do === "theme") await applyTheme(page, opts.themeAttr, step.value);
    else if (step.do === "goto") await page.goto(new URL(step.url, target.url).href, { waitUntil: "networkidle" });
    else throw new Error(`unknown step ${JSON.stringify(step)}`);
    await page.waitForTimeout(step.pause ?? 700);
  }
  await page.waitForTimeout(800);
  const video = page.video();
  await context.close();
  const file = `${target.name}__walkthrough.webm`;
  await video.saveAs(join(opts.out, file));
  await video.delete();
  return file;
}

function writeReport(opts, results, sheets, video) {
  const errors = results.flatMap((r) => r.problems.filter((p) => p.level === "error").map((p) => ({ ...p, at: r.file })));
  const warns = results.flatMap((r) => r.problems.filter((p) => p.level === "warn").map((p) => ({ ...p, at: r.file })));
  const consoleErrors = results.flatMap((r) => (r.consoleErrors || []).map((e) => `${r.page} @ ${r.viewport.name}: ${e}`));
  const external = [...new Set(results.flatMap((r) => r.externalRequests || []))];
  writeFileSync(join(opts.out, "report.json"), JSON.stringify({ results, sheets, video }, null, 2));

  const dedupe = (list) => [...new Map(list.map((p) => [`${p.rule}|${p.detail}|${p.at.split("__")[0]}`, p])).values()];
  const lines = [
    `# Render report`,
    ``,
    `${results.length} screenshots, ${sheets.length} contact sheets${video ? `, walkthrough ${video}` : ""}.`,
    `Errors: ${errors.length}. Warnings: ${warns.length}. Console errors: ${consoleErrors.length}. External hosts: ${external.length}.`,
    ``,
  ];
  if (errors.length) lines.push(`## Errors`, ...dedupe(errors).map((p) => `- ${p.rule}: ${p.detail} (${p.at})`), ``);
  if (consoleErrors.length) lines.push(`## Console errors`, ...[...new Set(consoleErrors)].map((e) => `- ${e}`), ``);
  if (external.length) lines.push(`## Requests leaving the machine`, ...external.map((h) => `- ${h}`), ``);
  if (warns.length) lines.push(`## Warnings`, ...dedupe(warns).slice(0, 80).map((p) => `- ${p.rule}: ${p.detail} (${p.at})`), ``);
  writeFileSync(join(opts.out, "report.md"), lines.join("\n"));
  console.log(lines.slice(0, 5).join("\n"));
  console.log(`full report: ${join(opts.out, "report.md")}`);
  return errors.length + consoleErrors.length;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const viewports = parseViewports(opts.viewports);
  const themes = opts.themes ? opts.themes.split(",").map((t) => t.trim()) : [""];
  const pages = expandTargets(opts.targets);
  mkdirSync(opts.out, { recursive: true });

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  try {
    const results = await shootAll(browser, opts, pages, viewports, themes);
    const sheets = opts.sheet ? await buildSheets(browser, opts, results) : [];
    const video = opts.video ? await recordWalkthrough(browser, opts, pages[0], viewports) : null;
    const failures = writeReport(opts, results, sheets, video);
    process.exitCode = failures ? 1 : 0;
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error(err.message); process.exit(2); });

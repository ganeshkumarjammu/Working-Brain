#!/usr/bin/env node
/* Applies the Work Style presets to THIS device's .obsidian folder.
 *   node tools/setup-obsidian.cjs            apply
 *   node tools/setup-obsidian.cjs --dry-run  show what would change
 *   node tools/setup-obsidian.cjs --vault ~/path/to/vault
 * Safe to run repeatedly: values are merged, nothing else in .obsidian is touched.
 * (.obsidian is per-device in this repo, so this is a per-device step.) */
const fs = require("fs"), path = require("path");
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const vi = args.indexOf("--vault");
const vault = path.resolve(vi >= 0 ? args[vi + 1] : path.join(__dirname, ".."));
const presets = path.join(vault, "08_Meta/Work-Style/presets");
if (!fs.existsSync(presets)) { console.error("Presets not found at " + presets + ". Run this from the vault, or pass --vault."); process.exit(1); }

const isObj = v => v && typeof v === "object" && !Array.isArray(v);
function merge(target, src) {
  for (const [k, v] of Object.entries(src)) {
    if (k === "calendarSets" && Array.isArray(v) && Array.isArray(target[k])) {   // Periodic Notes: merge by set id
      for (const set of v) { const t = target[k].find(x => x.id === set.id) || target[k][0]; if (t) merge(t, set); else target[k].push(set); }
    } else if (Array.isArray(v) && Array.isArray(target[k])) target[k] = [...new Set([...target[k], ...v])];   // union, e.g. Templater hotkey list
    else if (isObj(v) && isObj(target[k])) merge(target[k], v);
    else target[k] = v;
  }
  return target;
}
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } }

const jobs = [
  ["dataview.json", ".obsidian/plugins/dataview/data.json"],
  ["templater-obsidian.json", ".obsidian/plugins/templater-obsidian/data.json"],
  ["periodic-notes.json", ".obsidian/plugins/periodic-notes/data.json"],
  ["calendar.json", ".obsidian/plugins/calendar/data.json"],
];
let changed = 0;
for (const [preset, target] of jobs) {
  const dest = path.join(vault, target); const src = readJson(path.join(presets, preset));
  const existing = readJson(dest) || {}; const next = merge(JSON.parse(JSON.stringify(existing)), src);
  const same = JSON.stringify(existing) === JSON.stringify(next);
  console.log((same ? "  ok       " : dry ? "  would set" : "  updated  ") + " " + target);
  if (!same) { changed++; if (!dry) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, JSON.stringify(next, null, 2) + "\n"); } }
}
// hotkeys: only add commands that have no binding yet, so your own choices are never overwritten
{
  const dest = path.join(vault, ".obsidian/hotkeys.json"); const src = readJson(path.join(presets, "hotkeys.json"));
  const existing = readJson(dest) || {}; const next = { ...existing }; let added = 0;
  for (const [cmd, keys] of Object.entries(src)) if (!(cmd in next)) { next[cmd] = keys; added++; }
  console.log((added === 0 ? "  ok       " : dry ? "  would add" : "  added    ") + " .obsidian/hotkeys.json" + (added ? " (" + added + " hotkeys)" : ""));
  if (added) { changed++; if (!dry) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, JSON.stringify(next, null, 2) + "\n"); } }
}
console.log("\n" + (dry ? "Dry run: nothing written." : changed ? "Done. " + changed + " file(s) written." : "Already up to date."));
console.log(`
Still to do by hand (Obsidian cannot read these from files):
  1. Settings > Community plugins: install and enable Dataview, Templater, Calendar, Periodic Notes.
  2. Templater settings: switch ON "Trigger Templater on new file creation".
  3. Reload Obsidian (command palette > "Reload app without saving").`);

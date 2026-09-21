#!/usr/bin/env node
"use strict";
/* Try the Work Style dashboards with six weeks of made-up sample data, then take it out again.
 *   node tools/demo.cjs install   copy examples/demo-data into the vault (never overwrites a file you have)
 *   node tools/demo.cjs remove    delete exactly the files it added (files you edited are kept)
 *   node tools/demo.cjs status
 * Do not commit while the demo is installed: run remove first. */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const vault = path.resolve(__dirname, ".."), demo = path.join(vault, "examples/demo-data"), manifestPath = path.join(vault, ".work-style-demo.json");
const sha = p => crypto.createHash("sha1").update(fs.readFileSync(p)).digest("hex");
function walk(dir, base = "", out = []) { for (const f of fs.readdirSync(dir)) { const abs = path.join(dir, f), rel = path.posix.join(base, f); fs.statSync(abs).isDirectory() ? walk(abs, rel, out) : out.push(rel); } return out; }
const cmd = process.argv[2];

if (cmd === "install") {
  if (fs.existsSync(manifestPath)) { console.log("The demo is already installed. Run: node tools/demo.cjs remove"); process.exit(1); }
  const files = {}, createdDirs = new Set(); let skipped = [];
  for (const rel of walk(demo)) {
    const dest = path.join(vault, rel);
    if (fs.existsSync(dest)) { skipped.push(rel); continue; }
    let d = path.dirname(dest); const chain = []; while (!fs.existsSync(d)) { chain.push(d); d = path.dirname(d); }
    chain.forEach(x => createdDirs.add(path.relative(vault, x).split(path.sep).join("/")));
    fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(path.join(demo, rel), dest); files[rel] = sha(dest);
  }
  fs.writeFileSync(manifestPath, JSON.stringify({ files, createdDirs: [...createdDirs] }, null, 2));
  console.log("Installed " + Object.keys(files).length + " demo notes." + (skipped.length ? " Skipped " + skipped.length + " that already exist in your vault." : ""));
  console.log("Open Work Home. When you are done: node tools/demo.cjs remove   (do not commit while the demo is installed)");
} else if (cmd === "remove") {
  if (!fs.existsSync(manifestPath)) { console.log("No demo is installed."); process.exit(0); }
  const m = JSON.parse(fs.readFileSync(manifestPath, "utf8")); let removed = 0; const kept = [];
  for (const [rel, hash] of Object.entries(m.files)) { const p = path.join(vault, rel); if (!fs.existsSync(p)) continue; if (sha(p) === hash) { fs.unlinkSync(p); removed++; } else kept.push(rel); }
  for (const d of m.createdDirs.sort((a, b) => b.length - a.length)) { const p = path.join(vault, d); try { if (fs.existsSync(p) && fs.readdirSync(p).length === 0) fs.rmdirSync(p); } catch { /* not empty */ } }
  fs.unlinkSync(manifestPath);
  console.log("Removed " + removed + " demo notes." + (kept.length ? "\nKept " + kept.length + " you edited:\n  " + kept.join("\n  ") : ""));
} else if (cmd === "status") {
  console.log(fs.existsSync(manifestPath) ? "Demo installed (" + Object.keys(JSON.parse(fs.readFileSync(manifestPath, "utf8")).files).length + " notes)." : "Demo not installed.");
} else { console.log("Usage: node tools/demo.cjs install | remove | status"); process.exit(1); }

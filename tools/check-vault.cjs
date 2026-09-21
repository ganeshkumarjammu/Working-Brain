#!/usr/bin/env node
"use strict";
/* Checks the whole vault without opening Obsidian.
 *   node tools/check-vault.cjs           check the vault as it is
 *   node tools/check-vault.cjs --demo    also check it with the demo data laid over it (what CI does)
 *   node tools/check-vault.cjs --verbose show every block
 * It verifies: note frontmatter, Templater template rendering, hotkey snippet logic, every ```dataview query
 * (parsed AND executed by the real Dataview engine), and every ```dataviewjs block, including the dashboards. */
const fs = require("fs"), path = require("path");
const yaml = require("js-yaml"), moment = require("moment");
const { createRuntime, SKIP_DIRS } = require("./lib/dv-runtime.cjs");
const { selfTest } = require("./lib/snippet-sim.cjs");

const args = process.argv.slice(2); const withDemo = args.includes("--demo"); const verbose = args.includes("--verbose");
const vault = path.resolve(__dirname, ".."); const demo = path.join(vault, "examples/demo-data");
let failures = 0; const bad = msg => { failures++; console.log("  ✗ " + msg); }; const good = msg => console.log("  ✓ " + msg);

function allMd(dir, base = "", out = []) { for (const f of fs.readdirSync(dir)) { const abs = path.join(dir, f), rel = path.posix.join(base, f); if (fs.statSync(abs).isDirectory()) { if (!SKIP_DIRS.has(f)) allMd(abs, rel, out); } else if (f.endsWith(".md")) out.push(rel); } return out; }

(async () => {
  console.log("Work Style vault check\n");

  // 1 ── frontmatter
  console.log("1. Frontmatter");
  let n = 0, e = 0;
  for (const rel of allMd(vault)) { if (rel.startsWith("08_Meta/Templates/")) continue; const t = fs.readFileSync(path.join(vault, rel), "utf8"); const m = t.match(/^---\n([\s\S]*?)\n---/); if (!m) continue; n++; try { yaml.load(m[1]); } catch (err) { e++; bad(rel + ": " + err.message.split("\n")[0]); } }
  if (!e) good(n + " notes, all frontmatter valid");

  // 2 ── templates render with real moment
  console.log("2. Templater templates");
  const titles = { "T - Daily Note": "2026-09-19", "T - Weekly Review": "2026-W38", "T - Monthly Review": "2026-09", "T - Quarterly Review": "2026-Q3", "T - Yearly Review": "2026" };
  const tdir = path.join(vault, "08_Meta/Templates"); let tn = 0;
  for (const f of fs.readdirSync(tdir).filter(f => f.endsWith(".md"))) {
    const name = f.replace(/\.md$/, ""); const tp = { file: { title: titles[name] || "Test Title" }, date: { now: fmt => moment("2026-09-19T09:00:00").format(fmt || "YYYY-MM-DD") } };
    try { const out = fs.readFileSync(path.join(tdir, f), "utf8").replace(/<%\s*([^*][\s\S]*?)\s*%>/g, (m, expr) => { const v = new Function("tp", "moment", "return (" + expr + ")")(tp, moment); if (v === "Invalid date") throw new Error("Invalid date from: " + expr); return v; });
      const fm = out.match(/^---\n([\s\S]*?)\n---/); if (fm) yaml.load(fm[1]); tn++; } catch (err) { bad(name + ": " + err.message); }
  }
  good(tn + " templates render and their frontmatter parses");

  // 3 ── snippets
  console.log("3. Hotkey snippets (Switch / Stop / Login / Logout)");
  const sf = await selfTest(); if (sf.length) sf.forEach(bad); else good("all snippet behaviours pass");

  // 4/5 ── dataview
  const rt = await createRuntime({ now: process.env.WORKSTYLE_NOW || "2026-09-19T14:30:00" });
  const passes = [["vault as it is", [vault]]]; if (withDemo && fs.existsSync(demo)) passes.push(["vault + demo data", [vault, demo]]);
  let pi = 4;
  for (const [label, roots] of passes) {
    console.log(pi++ + ". Dataview: " + label);
    const index = rt.buildIndex(roots); index.parseErrors.forEach(x => bad("YAML: " + x));
    let q = 0, qEmpty = 0, js = 0, jsBlank = 0;
    const files = index.files.slice(); for (const f of fs.readdirSync(tdir).filter(f => f.endsWith(".md"))) files.push("08_Meta/Templates/" + f);
    for (const rel of files.sort()) {
      const abs = rel.startsWith("08_Meta/Templates/") ? path.join(tdir, path.basename(rel)) : (roots.slice().reverse().map(r => path.join(r, rel)).find(fs.existsSync));
      const text = fs.readFileSync(abs, "utf8");
      const isTemplate = rel.startsWith("08_Meta/Templates/");
      for (const m of text.matchAll(/^```dataview\n([\s\S]*?)^```/gm)) {
        q++; const res = await rt.runQuery(index, isTemplate ? "08_Meta/Dashboards/Home.md" : rel, m[1].trim());
        if (!res.ok) bad(rel + ": " + res.error + "\n      " + m[1].trim().split("\n")[0]); else { if (res.rows === 0) qEmpty++; if (verbose) console.log("      ✓ " + rel + " · " + m[1].trim().split("\n")[0].slice(0, 70) + " → " + res.rows); }
      }
      if (!isTemplate && /^```dataviewjs/m.test(text)) {
        const results = await rt.runNoteJs(vault, index, rel, text);
        for (const r of results) { js++; if (r.error) bad(rel + " (block " + r.i + "): " + r.error); else if (!r.output.length && !r.dom) jsBlank++; if (verbose && !r.error) console.log("      ✓ " + rel + " · block " + r.i + " · " + r.first.slice(0, 60)); }
      }
    }
    good(q + " dataview queries executed (" + qEmpty + " returned no rows, which is fine on an empty vault)");
    good(js + " dataviewjs blocks executed" + (jsBlank ? " (" + jsBlank + " draw only HTML)" : ""));
  }
  console.log("\n" + (failures ? "✗ " + failures + " problem(s) found" : "✓ Everything passes"));
  process.exit(failures ? 1 : 0);
})().catch(err => { console.error("Check crashed: " + err.message); process.exit(2); });

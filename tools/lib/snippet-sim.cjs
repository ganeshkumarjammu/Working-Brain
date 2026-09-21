"use strict";
/* Simulates the Templater hotkey snippets against a fake editor, so their logic is regression-tested. */
const fs = require("fs"), path = require("path"), moment = require("moment");
const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
const SNIP = path.join(__dirname, "../../08_Meta/Templates/Snippets");
const code = name => { const t = fs.readFileSync(path.join(SNIP, name + ".md"), "utf8"); const m = t.match(/<%\*([\s\S]*)-%>/); if (!m) throw new Error(name + ": no Templater execution block"); return m[1]; };

function makeEditor(text) {
  const lines = text.split("\n"); const ed = { lines, cursor: null,
    lineCount: () => lines.length, lastLine: () => lines.length - 1, getLine: i => lines[i], setLine: (i, t) => { lines[i] = t; },
    replaceRange: (txt, pos) => { const cur = lines[pos.line]; lines.splice(pos.line, 1, ...(cur.slice(0, pos.ch) + txt + cur.slice(pos.ch)).split("\n")); },
    setCursor: c => { ed.cursor = c; } };
  return ed;
}
async function run(name, doc, answers, clock, basename = "2026-09-19") {
  const ed = makeEditor(doc), notices = [], ans = [...answers]; let fm = {};
  const tp = { obsidian: { Notice: function (m) { notices.push(m); } },
    app: { workspace: { activeEditor: { editor: ed }, getActiveFile: () => ({ basename }) }, vault: { getAbstractFileByPath: p => ({ path: p }) }, fileManager: { processFrontMatter: async (f, fn) => { fn(fm); } } },
    date: { now: f => moment(clock).format(f || "YYYY-MM-DD") },
    system: { suggester: async () => { const a = ans.shift(); return a === undefined ? null : a; }, prompt: async () => { const a = ans.shift(); return a === undefined ? null : a; } } };
  await new AsyncFn("tp", code(name))(tp);
  return { doc: ed.lines.join("\n"), notices, cursor: ed.cursor, fm };
}

async function selfTest() {
  const fails = []; const ok = (cond, msg) => { if (!cond) fails.push(msg); };
  const base = "# Day\n\n### ⏱ Time log\n\n### 🚧 Waiting on others\n\n## Log\n-\n";
  let r = await run("Switch activity", base, ["admin"], "2026-09-19T09:05:00");
  ok(/### ⏱ Time log\n- \[start:: 09:05\] \[cat:: admin\] \n/.test(r.doc), "first block is inserted right under the Time log heading");
  ok(r.doc.indexOf("Waiting on others") > r.doc.indexOf("[cat:: admin]"), "the new line stays inside the Time log section");
  r = await run("Switch activity", r.doc, ["meeting"], "2026-09-19T09:20:00");
  ok(r.doc.includes("[start:: 09:05] [end:: 09:20] [cat:: admin]"), "switching closes the previous block");
  r = await run("Switch activity", r.doc, ["blocked", "yes", "Sam (DB access)"], "2026-09-19T10:00:00");
  ok(r.doc.includes("[end:: 10:00] [cat:: meeting] [outcome:: yes]"), "closing a meeting records its outcome");
  ok(r.doc.includes("[cat:: blocked] [on:: Sam (DB access)]"), "blocked asks who or what is causing it");
  r = await run("Stop activity", r.doc, [], "2026-09-19T10:40:00");
  ok(r.doc.includes("[start:: 10:00] [end:: 10:40] [cat:: blocked]"), "stop closes the open block");
  r = await run("Stop activity", r.doc, [], "2026-09-19T10:41:00");
  ok(r.notices.some(n => /No open activity/.test(n)), "stop with nothing open says so");
  r = await run("Switch activity", "# x", ["deep-work"], "2026-09-19T11:00:00", "not-a-daily");
  ok(r.notices.some(n => /daily note/.test(n)) && !r.doc.includes("start::"), "refuses to run outside a daily note");
  r = await run("Switch activity", "# Day\nsome text", ["break"], "2026-09-19T11:00:00");
  ok(r.doc.endsWith("- [start:: 11:00] [cat:: break] "), "without a Time log heading the line goes to the end");
  r = await run("Stamp login", "", [], "2026-09-19T08:58:00");
  ok(r.fm.login === "08:58" && r.fm.login_source === "self-logged", "login is stamped");
  r = await run("Stamp logout", "", [], "2026-09-19T17:40:00");
  ok(r.fm.logout === "17:40", "logout is stamped");
  return fails;
}
module.exports = { selfTest };

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
/* opts.activeFm: frontmatter of the open note · opts.files: other notes { path: { text, fm } } (a tiny fake vault) */
async function run(name, doc, answers, clock, basename = "2026-09-19", opts = {}) {
  const ed = makeEditor(doc), notices = [], ans = [...answers]; let fm = {};
  const files = Object.fromEntries(Object.entries(opts.files || {}).map(([p, v]) => [p, { text: v.text, fm: v.fm || {} }]));
  const active = { path: basename + ".md", basename };
  const fileObj = p => ({ path: p, basename: p.split("/").pop().replace(/\.md$/, "") });
  const tp = { obsidian: { Notice: function (m) { notices.push(m); } },
    app: { workspace: { activeEditor: { editor: ed }, getActiveFile: () => active },
      metadataCache: { getFileCache: f => ({ frontmatter: f.path === active.path ? (opts.activeFm || {}) : (files[f.path] ? files[f.path].fm : {}) }) },
      vault: { getAbstractFileByPath: p => ({ path: p }), getMarkdownFiles: () => Object.keys(files).map(fileObj),
        read: async f => files[f.path].text, modify: async (f, t) => { files[f.path].text = t; },
        process: async (f, fn) => { files[f.path].text = fn(files[f.path].text); return files[f.path].text; } },
      fileManager: { processFrontMatter: async (f, fn) => { fn(fm); } } },
    date: { now: f => moment(clock).format(f || "YYYY-MM-DD") },
    system: { suggester: async () => { const a = ans.shift(); return a === undefined ? null : a; }, prompt: async () => { const a = ans.shift(); return a === undefined ? null : a; } } };
  await new AsyncFn("tp", code(name))(tp);
  return { doc: ed.lines.join("\n"), notices, cursor: ed.cursor, fm, files: Object.fromEntries(Object.entries(files).map(([p, v]) => [p, v.text])) };
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
  ok(r.notices.some(n => /daily note/.test(n)) && !r.doc.includes("start::"), "refuses to run outside a daily note or task note");
  r = await run("Switch activity", "# Day\nsome text", ["break"], "2026-09-19T11:00:00");
  ok(r.doc.endsWith("- [start:: 11:00] [cat:: break] "), "without a Time log heading the line goes to the end");
  // --- logging into a specific task ---
  const day = "# Day\n## 🎯 Top 3\n- [ ] Fix export bug [est:: 90] [ticket:: PRJ-7] [project:: Export Rewrite]\n- [ ] Write docs [est:: 30]\n- [ ] Get access [waiting_on:: Sam]\n### ⏱ Time log\n\n## Log\n";
  const tnPath = "03_Projects/Tasks/Add webhook retries.md";
  const tn = { text: "---\ntype: task\nstatus: in-progress\n---\n# Add webhook retries\n## 💼 Work log\n### ⏱ Time log\n\n## Notes\n", fm: { type: "task", status: "in-progress" } };
  r = await run("Switch activity", day, ["deep-work", 0], "2026-09-19T09:00:00", "2026-09-19", { files: { [tnPath]: tn } });
  ok(r.doc.includes("- [start:: 09:00] [cat:: deep-work] [ticket:: PRJ-7] [project:: Export Rewrite] "), "picking a task with a ticket adds its ticket and project");
  r = await run("Switch activity", r.doc, ["deep-work", 1], "2026-09-19T10:00:00", "2026-09-19", { files: { [tnPath]: tn } });
  ok(r.doc.includes("[start:: 09:00] [end:: 10:00]") && r.doc.includes("- [start:: 10:00] [cat:: deep-work] [for:: Write docs] "), "picking a task without a ticket adds [for:: name]");
  ok(!/\[for:: Get access\]/.test(r.doc), "waiting-on items are not offered as tasks");
  r = await run("Switch activity", r.doc, ["deep-work", 2], "2026-09-19T11:00:00", "2026-09-19", { files: { [tnPath]: tn } });
  ok(r.doc.includes("[start:: 10:00] [end:: 11:00]"), "switching to a task note still closes the open block in the daily note");
  ok(r.files[tnPath].includes("### ⏱ Time log\n- [date:: 2026-09-19] [start:: 11:00] [cat:: deep-work] "), "picking a task note writes the line into that note's own Work log");
  ok(!/\[start:: 11:00\]/.test(r.doc), "…and not into the daily note");
  const dailyWithTask = r.doc, noteOpen = r.files[tnPath];
  r = await run("Switch activity", noteOpen.replace(/^---[\s\S]*?---\n/, ""), ["meeting", "yes"], "2026-09-19T11:45:00", "Add webhook retries", { activeFm: { type: "task" }, files: { "2026-09-19.md": { text: dailyWithTask } } });
  ok(r.doc.includes("[date:: 2026-09-19] [start:: 11:00] [end:: 11:45] [cat:: deep-work]"), "in a task note, switching closes its open block");
  ok(r.doc.includes("- [date:: 2026-09-19] [start:: 11:45] [cat:: meeting] "), "in a task note, the new line is dated and goes into its Time log");
  r = await run("Stop activity", dailyWithTask, [], "2026-09-19T11:30:00", "2026-09-19", { files: { [tnPath]: { text: noteOpen, fm: tn.fm } } });
  ok(r.files[tnPath].includes("[start:: 11:00] [end:: 11:30]"), "stop in the daily note closes a block that is open in a task note");
  r = await run("Switch activity", "# Bare task", ["deep-work"], "2026-09-19T12:00:00", "Bare task", { activeFm: { tags: ["task"] } });
  ok(r.doc.includes("## 💼 Work log\n### ⏱ Time log\n- [date:: 2026-09-19] [start:: 12:00] [cat:: deep-work] "), "a task note without a Work log gets one (TaskNotes-style #task tag counts)");
  r = await run("Stamp login", "", [], "2026-09-19T08:58:00");
  ok(r.fm.login === "08:58" && r.fm.login_source === "self-logged", "login is stamped");
  r = await run("Stamp logout", "", [], "2026-09-19T17:40:00");
  ok(r.fm.logout === "17:40", "logout is stamped");
  return fails;
}
module.exports = { selfTest };

<%*
/* Alt+Shift+S — Switch activity.
 * Works in today's daily note OR in a task note (type: task, or the tag #task).
 * 1) closes whatever block is still open today (here, in today's daily note or in any task note) with [end:: now]
 * 2) asks the category (and who/what for blocked / interruption)
 * 3) in the daily note, for work categories, asks "Which task?": a checkbox task adds [ticket::] or [for::]
 *    to the line; a task note gets the line written into ITS Work log instead
 * 4) in a task note, the line goes into that note's Time log with [date:: today] */
const Notice = tp.obsidian.Notice;
const app = tp.app;
const ed = app.workspace.activeEditor ? app.workspace.activeEditor.editor : null;
const file = app.workspace.getActiveFile();
const today = tp.date.now("YYYY-MM-DD");
const now = tp.date.now("HH:mm");
const fmOf = f => { const c = app.metadataCache && app.metadataCache.getFileCache ? app.metadataCache.getFileCache(f) : null; return (c && c.frontmatter) || {}; };
const isTaskNote = f => { if (!f) return false; const fm = fmOf(f); const tags = [].concat(fm.tags || []).map(String); return String(fm.type || "").toLowerCase() === "task" || tags.some(t => /^#?task(\/|$)/i.test(t)); };
const isDaily = f => !!f && /^\d{4}-\d{2}-\d{2}$/.test(f.basename);
const isDone = f => /^(done|completed|complete|cancelled|canceled)$/i.test(String(fmOf(f).status || ""));
const START = /\[start:: ?\d{1,2}:\d{2}\]/;
const openToday = (line, dailyNote) => START.test(line) && !/\[end::/.test(line) && (dailyNote || line.includes("[date:: " + today + "]"));
async function closeLine(line) {
  let out = line.replace(/(\[start:: ?\d{1,2}:\d{2}\])/, "$1 [end:: " + now + "]");
  if (/\[cat:: ?meeting\]/.test(line) && !/\[outcome::/.test(line)) {
    const o = await tp.system.suggester(["✅ yes: clear outcome, decision or action", "❌ no: could have been an email"], ["yes", "no"], false, "Did that meeting have a clear outcome?");
    if (o) out = out.replace(/\s+$/, "") + " [outcome:: " + o + "]";
  }
  return out;
}
// Puts a line at the end of the "Time log" section; creates the Work log section if the note has none.
function insertUnderTimeLog(text, line) {
  const lines = text.split("\n");
  let h = lines.findIndex(l => /^#{1,6}\s.*Time log/i.test(l));
  if (h < 0) { return text.replace(/\s*$/, "") + "\n\n## 💼 Work log\n### ⏱ Time log\n" + line + "\n"; }
  let last = h;
  for (let i = h + 1; i < lines.length; i++) { if (/^#{1,6}\s/.test(lines[i]) || /^```/.test(lines[i])) break; if (lines[i].trim() !== "") last = i; }
  lines.splice(last + 1, 0, line);
  return lines.join("\n");
}

if (!ed || !file || !(isDaily(file) || isTaskNote(file))) {
  new Notice("Open today's daily note (Alt+Shift+D) or a task note first, then switch activity.");
} else {
  const inDaily = isDaily(file);
  const cats = ["deep-work", "meeting", "admin", "learning", "break", "lunch", "blocked", "interruption", "rework", "drift", "other"];
  const labels = [
    "🧠 deep-work: focused work on a deliverable",
    "📅 meeting",
    "🗂️ admin: email, tickets, timesheets",
    "📚 learning",
    "☕ break: coffee, walk",
    "🍽️ lunch",
    "⛔ blocked: waiting on someone or something",
    "⚡ interruption: unplanned ask",
    "🔁 rework: redoing changed or faulty work",
    "🌀 drift: distracted, not productive",
    "▫️ other"
  ];
  const cat = await tp.system.suggester(labels, cats, false, "Switching to...");
  if (cat) {
    // 1) close the block that is still open: first in this note, then in any other note of today
    let closedHere = false;
    for (let i = ed.lineCount() - 1; i >= 0; i--) {
      const line = ed.getLine(i);
      if (START.test(line) && (inDaily || line.includes("[date:: " + today + "]"))) {
        if (openToday(line, inDaily)) { ed.setLine(i, await closeLine(line)); closedHere = true; }
        break;
      }
    }
    if (!closedHere && app.vault.getMarkdownFiles) {
      for (const f of app.vault.getMarkdownFiles()) {
        if (f.path === file.path) continue;
        const dailyNote = isDaily(f) && f.basename === today;
        if (!dailyNote && !isTaskNote(f)) continue;
        const text = await app.vault.read(f);
        if (!text.includes("[start::")) continue;
        const ls = text.split("\n"); let changed = false;
        for (let i = ls.length - 1; i >= 0; i--) if (openToday(ls[i], dailyNote)) { ls[i] = await closeLine(ls[i]); changed = true; }
        if (changed) await app.vault.modify(f, ls.join("\n"));
      }
    }
    // 2) who or what is causing it (only for blocked / interruption)
    let on = "";
    if (cat === "blocked" || cat === "interruption") {
      const q = cat === "blocked" ? "Waiting on who or what?" : "Who or what interrupted you?";
      const a = await tp.system.prompt(q, "", false);
      if (a) on = a.trim();
    }
    // 3) which task? (daily note, work categories only). Esc = no specific task.
    let extra = "", target = null, targetName = "";
    if (inDaily && ["deep-work", "meeting", "admin", "learning", "rework"].includes(cat)) {
      const clean = t => t.replace(/\[[A-Za-z_][\w-]*::[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
      const field = (t, k) => { const m = t.match(new RegExp("\\[" + k + ":: ?([^\\]]+)\\]")); return m ? m[1].trim() : ""; };
      const opts = [];
      for (let i = 0; i < ed.lineCount(); i++) {
        const m = ed.getLine(i).match(/^\s*[-*] \[ \] (.+)$/);
        if (!m || /\[waiting_on::/.test(m[1]) || !clean(m[1])) continue;
        opts.push({ label: "☑ " + clean(m[1]).slice(0, 80), kind: "line", text: clean(m[1]).slice(0, 80), ticket: field(m[1], "ticket"), project: field(m[1], "project") });
      }
      if (app.vault.getMarkdownFiles) {
        for (const f of app.vault.getMarkdownFiles()) {
          if (!isTaskNote(f) || isDone(f) || isDaily(f)) continue;
          opts.push({ label: "📄 " + (fmOf(f).title || f.basename) + " (task note)", kind: "note", file: f, name: String(fmOf(f).title || f.basename) });
        }
      }
      if (opts.length) {
        const pick = await tp.system.suggester(opts.map(o => o.label), opts.map((o, i) => i), false, "Which task? (Esc = no specific task)");
        const o = pick == null ? null : opts[pick];
        if (o && o.kind === "line") extra = (o.ticket ? " [ticket:: " + o.ticket + "]" : " [for:: " + o.text + "]") + (o.project ? " [project:: " + o.project + "]" : "");
        if (o && o.kind === "note") { target = o.file; targetName = o.name; }
      }
    }
    // 4) write the new line
    const dated = target || !inDaily ? "[date:: " + today + "] " : "";
    const newLine = "- " + dated + "[start:: " + now + "] [cat:: " + cat + "]" + (on ? " [on:: " + on + "]" : "") + extra + " ";
    if (target) {
      await app.vault.process(target, text => insertUnderTimeLog(text, newLine));
      new Notice("⏱ Logging into “" + targetName + "” (its own Work log). Alt+Shift+S or Alt+Shift+E there or here to stop.");
    } else {
      const n = ed.lineCount();
      let h = -1;
      for (let i = 0; i < n; i++) { if (/^#{1,6}\s.*Time log/i.test(ed.getLine(i))) { h = i; break; } }
      if (h < 0 && !inDaily) {
        // a task note without a Work log yet: create it at the end
        ed.replaceRange("\n\n## 💼 Work log\n### ⏱ Time log\n" + newLine, { line: ed.lastLine(), ch: ed.getLine(ed.lastLine()).length });
        ed.setCursor({ line: ed.lastLine(), ch: newLine.length });
      } else {
        let last = h >= 0 ? h : ed.lastLine();
        if (h >= 0) {
          for (let i = h + 1; i < n; i++) {
            const l = ed.getLine(i);
            if (/^#{1,6}\s/.test(l) || /^```/.test(l)) break;
            if (l.trim() !== "") last = i;
          }
        }
        ed.replaceRange("\n" + newLine, { line: last, ch: ed.getLine(last).length });
        ed.setCursor({ line: last + 1, ch: newLine.length });
      }
    }
  }
}
-%>

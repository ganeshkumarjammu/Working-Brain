<%*
/* Alt+Shift+E — Stop the current activity without starting another.
 * Works in today's daily note or in a task note, and finds the open block wherever it is today
 * (this note, today's daily note, or any task note). */
const Notice = tp.obsidian.Notice;
const app = tp.app;
const ed = app.workspace.activeEditor ? app.workspace.activeEditor.editor : null;
const file = app.workspace.getActiveFile();
const today = tp.date.now("YYYY-MM-DD");
const now = tp.date.now("HH:mm");
const fmOf = f => { const c = app.metadataCache && app.metadataCache.getFileCache ? app.metadataCache.getFileCache(f) : null; return (c && c.frontmatter) || {}; };
const isTaskNote = f => { if (!f) return false; const fm = fmOf(f); const tags = [].concat(fm.tags || []).map(String); return String(fm.type || "").toLowerCase() === "task" || tags.some(t => /^#?task(\/|$)/i.test(t)); };
const isDaily = f => !!f && /^\d{4}-\d{2}-\d{2}$/.test(f.basename);
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

if (!ed || !file || !(isDaily(file) || isTaskNote(file))) {
  new Notice("Open today's daily note or a task note first.");
} else {
  const inDaily = isDaily(file);
  let closed = false;
  for (let i = ed.lineCount() - 1; i >= 0; i--) {
    const line = ed.getLine(i);
    if (START.test(line) && (inDaily || line.includes("[date:: " + today + "]"))) {
      if (openToday(line, inDaily)) { ed.setLine(i, await closeLine(line)); closed = true; }
      break;
    }
  }
  if (!closed && app.vault.getMarkdownFiles) {
    for (const f of app.vault.getMarkdownFiles()) {
      if (f.path === file.path) continue;
      const dailyNote = isDaily(f) && f.basename === today;
      if (!dailyNote && !isTaskNote(f)) continue;
      const text = await app.vault.read(f);
      if (!text.includes("[start::")) continue;
      const ls = text.split("\n"); let changed = false;
      for (let i = ls.length - 1; i >= 0; i--) if (openToday(ls[i], dailyNote)) { ls[i] = await closeLine(ls[i]); changed = true; }
      if (changed) { await app.vault.modify(f, ls.join("\n")); closed = true; }
    }
  }
  new Notice(closed ? "Stopped at " + now + ". Time until your next activity shows as unlogged." : "No open activity to stop.");
}
-%>

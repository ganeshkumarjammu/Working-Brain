<%*
const Notice = tp.obsidian.Notice;
const ed = tp.app.workspace.activeEditor ? tp.app.workspace.activeEditor.editor : null;
const file = tp.app.workspace.getActiveFile();
if (!ed || !file || !/^\d{4}-\d{2}-\d{2}$/.test(file.basename)) {
  new Notice("Open today's daily note first (Alt+Shift+D), then switch activity.");
} else {
  const now = tp.date.now("HH:mm");
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
    // 1) close the block that is still open (last line with a start but no end)
    for (let i = ed.lineCount() - 1; i >= 0; i--) {
      const line = ed.getLine(i);
      if (/\[start:: ?\d{1,2}:\d{2}\]/.test(line)) {
        if (!/\[end::/.test(line)) {
          let out = line.replace(/(\[start:: ?\d{1,2}:\d{2}\])/, "$1 [end:: " + now + "]");
          if (/\[cat:: ?meeting\]/.test(line) && !/\[outcome::/.test(line)) {
            const o = await tp.system.suggester(["✅ yes: clear outcome, decision or action", "❌ no: could have been an email"], ["yes", "no"], false, "Did that meeting have a clear outcome?");
            if (o) out = out.replace(/\s+$/, "") + " [outcome:: " + o + "]";
          }
          ed.setLine(i, out);
        }
        break;
      }
    }
    // 2) who or what is causing it (only for blocked / interruption)
    let on = "";
    if (cat === "blocked" || cat === "interruption") {
      const q = cat === "blocked" ? "Waiting on who or what?" : "Who or what interrupted you?";
      const a = await tp.system.prompt(q, "", false);
      if (a) on = a.trim();
    }
    // 3) add the new line at the end of the Time log section
    const n = ed.lineCount();
    let h = -1;
    for (let i = 0; i < n; i++) { if (/^#{1,6}\s.*Time log/i.test(ed.getLine(i))) { h = i; break; } }
    let last = h >= 0 ? h : ed.lastLine();
    if (h >= 0) {
      for (let i = h + 1; i < n; i++) {
        const l = ed.getLine(i);
        if (/^#{1,6}\s/.test(l) || /^```/.test(l)) break;
        if (l.trim() !== "") last = i;
      }
    }
    const newLine = "- [start:: " + now + "] [cat:: " + cat + "]" + (on ? " [on:: " + on + "]" : "") + " ";
    ed.replaceRange("\n" + newLine, { line: last, ch: ed.getLine(last).length });
    ed.setCursor({ line: last + 1, ch: newLine.length });
  }
}
-%>

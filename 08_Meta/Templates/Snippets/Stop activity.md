<%*
const Notice = tp.obsidian.Notice;
const ed = tp.app.workspace.activeEditor ? tp.app.workspace.activeEditor.editor : null;
const file = tp.app.workspace.getActiveFile();
if (!ed || !file || !/^\d{4}-\d{2}-\d{2}$/.test(file.basename)) {
  new Notice("Open today's daily note first.");
} else {
  const now = tp.date.now("HH:mm");
  let closed = false;
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
        closed = true;
      }
      break;
    }
  }
  new Notice(closed ? "Stopped at " + now + ". Time until your next activity shows as unlogged." : "No open activity to stop.");
}
-%>

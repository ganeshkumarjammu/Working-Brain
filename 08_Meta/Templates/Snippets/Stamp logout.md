<%*
const Notice = tp.obsidian.Notice;
const path = "01_Journal/Daily/" + tp.date.now("YYYY-MM-DD") + ".md";
const f = tp.app.vault.getAbstractFileByPath(path);
if (!f) {
  new Notice("Today's daily note does not exist yet. Open it first (Alt+Shift+D).");
} else {
  const t = tp.date.now("HH:mm");
  await tp.app.fileManager.processFrontMatter(f, fm => { fm.logout = t; });
  new Notice("Logged out at " + t + ". Any open activity ends at this time.");
}
-%>

<%*
const Notice = tp.obsidian.Notice;
const path = "01_Journal/Daily/" + tp.date.now("YYYY-MM-DD") + ".md";
const f = tp.app.vault.getAbstractFileByPath(path);
if (!f) {
  new Notice("Today's daily note does not exist yet. Open it first (Alt+Shift+D).");
} else {
  const t = tp.date.now("HH:mm");
  await tp.app.fileManager.processFrontMatter(f, fm => {
    if (fm.login) {
      new Notice("Already logged in at " + fm.login + ". Edit the login property to change it.");
    } else {
      fm.login = t;
      if (!fm.login_source) fm.login_source = "self-logged";
      new Notice("Logged in at " + t);
    }
  });
}
-%>

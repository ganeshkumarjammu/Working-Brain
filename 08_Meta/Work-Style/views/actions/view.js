/* Quick-action buttons for the Home note. Every button just runs an Obsidian command,
   so nothing here needs a Buttons plugin. Command IDs come from Periodic Notes and Templater. */
const groups = [
  [
    ["📅 Today",          "periodic-notes:open-daily-note"],
    ["🗓 This week",      "periodic-notes:open-weekly-note"],
    ["🗒 This month",     "periodic-notes:open-monthly-note"],
    ["🎯 This quarter",   "periodic-notes:open-quarterly-note"],
    ["📆 This year",      "periodic-notes:open-yearly-note"],
  ],
  [
    ["🟢 Log in now",     "templater-obsidian:08_Meta/Templates/Snippets/Stamp login.md"],
    ["🔴 Log out now",    "templater-obsidian:08_Meta/Templates/Snippets/Stamp logout.md"],
    ["➕ New note from template", "templater-obsidian:create-new-note-from-template"],
  ],
];
let status = null;
for (const g of groups) {
  const row = dv.container.createEl("div");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px";
  for (const [label, id] of g) {
    const b = row.createEl("button", { text: label });
    b.style.cssText = "cursor:pointer";
    b.onclick = () => {
      const ok = dv.app.commands.executeCommandById(id);
      status.textContent = ok ? "" : "Command not available (" + id + "). Is that plugin installed and enabled? See 08_Meta/Work-Style/Setup.";
    };
  }
}
status = dv.container.createEl("div");
status.style.cssText = "font-size:0.8em;opacity:.8;min-height:1.2em";

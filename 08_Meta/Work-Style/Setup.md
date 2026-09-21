---
type: meta
tags: [meta, work-style]
---

# 🔧 Work Style setup (per device)

`.obsidian/` is per-device in this repo, so setup happens once on each machine. It takes about five minutes.

## 1. Install the plugins
Settings → Community plugins → Browse. Required: **Dataview**, **Templater**, **Calendar**, **Periodic Notes**. Optional: **Homepage** (opens Work Home on startup).

## 2. Apply the presets
From the vault folder, with Node 18+ installed:

```
node tools/setup-obsidian.cjs
```

It merges these into this device's `.obsidian/` without touching anything else: Dataview (JavaScript queries on), Templater (template folder and the four hotkey snippets), Periodic Notes (folders, formats and templates for daily to yearly, plus quarterly), Calendar (week starts on Monday) and the hotkeys. Run it again any time; it is safe to repeat. Presets are in `08_Meta/Work-Style/presets/` if you would rather copy values by hand.

## 3. Two things no file can set
- Templater → turn **on** "Trigger Templater on new file creation" (Templater stores this per device for security).
- Restart Obsidian (command palette → "Reload app without saving") so the presets load.

## 4. Periodic Notes, if you set it up by hand

| Period | Folder | Format | Template |
| --- | --- | --- | --- |
| Daily | `01_Journal/Daily` | `YYYY-MM-DD` | `08_Meta/Templates/T - Daily Note` |
| Weekly | `01_Journal/Weekly` | `GGGG-[W]WW` | `08_Meta/Templates/T - Weekly Review` |
| Monthly | `01_Journal/Monthly` | `YYYY-MM` | `08_Meta/Templates/T - Monthly Review` |
| Quarterly | `01_Journal/Quarterly` | `YYYY-[Q]Q` | `08_Meta/Templates/T - Quarterly Review` |
| Yearly | `01_Journal/Yearly` | `YYYY` | `08_Meta/Templates/T - Yearly Review` |

The weekly format is now ISO (capital `GGGG` and `WW`, weeks start on Monday). The old lowercase format depends on your locale and can number weeks differently.

## 4b. Homepage plugin (optional)
Set the homepage to `08_Meta/Dashboards/Work Home` (or `Home`) and pick Reading view.

## 5. Check that it works
Open [[08_Meta/Dashboards/Work Home|Work Home]]. To see it full of data first, install the demo (`node tools/demo.cjs install`), look around, then remove it (`node tools/demo.cjs remove`). To check the whole vault from a terminal: `node tools/check-vault.cjs`.

## If something looks off

| Symptom | Fix |
| --- | --- |
| Dashboards show code, not results | Dataview is not installed, or its JavaScript queries are off. Run the setup script again |
| A new note contains raw `<% %>` | Templater trigger is off (step 3). For an existing note run "Templater: Replace templates in the active file" |
| Weekly note number looks one week off | Calendar → Start week on → Monday, and the weekly format must be `GGGG-[W]WW` |
| A button on Work Home says "Command not available" | Periodic Notes or Templater is not installed and enabled |
| Alt+Shift hotkeys do nothing | Settings → Hotkeys, search "Templater" or "Periodic", set your own keys |
| "Section failed" message | Read it. Usually a time typed like 9.20 instead of 09:20 |
| Today shows lots of unlogged time | Today is counted up to the current minute. It shrinks as you log |

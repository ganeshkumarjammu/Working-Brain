---
type: meta
tags: [meta, work-style]
---

# 🔧 Work Style setup (per device)

`.obsidian/` is per-device in this repo, so setup happens once on each machine. It takes about five minutes.

> **Without Node.js or a terminal:** use `SETUP-MANUAL.md` in the vault's top folder. It's every step by hand in Obsidian's settings, including updating devices that already use the vault.

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

## 6. Syncing two devices by hand (git)
1. **Starting** on a device: `git pull`
2. **Leaving** a device: `git add -A` → `git commit -m "notes"` → `git pull` → `git push`
3. Once per device: `git config merge.ours.driver true`. With the rule in `.gitattributes`, a plugin settings file (`.obsidian/plugins/*/data.json`) that changed on both devices keeps this device's copy instead of stopping the pull.
4. Never switch devices with unpushed work, and don't edit the same note on both before syncing.
5. If a pull still stops: `git status`, open each listed note, keep the right text between `<<<<<<<` / `=======` / `>>>>>>>`, then `git add` → `git commit --no-edit` → `git push`. Or `git merge --abort` to undo the attempt.

## 7. Optional: SB Autopilot plugin
Auto-filing, a Kanban board of every task (it understands Work Style fields like `[project::]` and `[waiting_on::]`), a project hub, quick capture and carry-over of unfinished tasks.
1. Copy the plugin folder to `.obsidian/plugins/sb-autopilot/` and enable it.
2. Run `node tools/setup-obsidian.cjs`. It applies `presets/sb-autopilot.json`:
   - ISO weeks;
   - journal creation **off** (Periodic Notes and your hotkeys own the journal here);
   - categories for task notes, runbooks, reports, decisions and skill logs;
   - `examples` and `tools` ignored.
3. Its **Habit Tracker page** setting points to [[08_Meta/Dashboards/Habit Tracker|Habit Tracker]].

## 8. Updating a device that already uses this vault
Ctrl+P → **Obsidian Git: Pull**, then **Reload app without saving**. Nothing else changes.

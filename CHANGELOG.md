# Changelog

## Work Style 1.1

### Added
- **Log time into a specific task**, four ways: shared `[ticket::]`, a time line nested under the task, `[for:: task name]`, or inside the task's own note. Each task gets its actual time, start and finish.
- **Task notes** (`T - Task Note`, `03_Projects/Tasks`, `type: task` or `#task`): own Work log with dated lines (`[date:: ]`), checklist, proof, and a *Time on this task* section. TaskNotes plugin notes and its timer (`timeEntries`) count too.
- **Alt+Shift+S** asks "Which task?" in the daily note (checkbox task or task note), and works inside task notes. Switch and Stop close the open block wherever it is today.
- Engine: `tasknote` section; task-note time joins each day; finished task notes join estimate accuracy; timeline shows "↳ task"; carried-over `[>]` tasks are not counted twice.
- **Habit Tracker** page (`08_Meta/Dashboards`): all daily properties in one table.
- **Where Things Go** guide (`08_Meta`).
- `.gitattributes`: plugin `data.json` merges keep this device's copy; Setup section for syncing by hand.
- Optional **SB Autopilot** preset (`presets/sb-autopilot.json`), applied by `setup-obsidian.cjs` only when the plugin is installed.
- Checker: list nesting in the Dataview runtime (like Obsidian), new "Time logged into tasks" checks, snippet tests for task logging.

### Changed
- Demo data: every time line has start **and** end. Task notes (one with a TaskNotes timer), nested and `[for::]` logging, a carry-over and a Book note in the new format. Day totals are unchanged.
- `T - Book Note`: to-read → reading → finished / abandoned, reading log, actions, no duplicate table.
- `T - Meeting`: `(me)`/`(them)` replaced by plain tasks and `[waiting_on::]`. Empty `[[ ]]` links removed from templates.

## Work Style edition

A work log, proof and reporting layer added on top of the Second Brain, using its existing structure and
conventions (PARA folders, `type:` frontmatter, `T - ` templates, per-device `.obsidian`).

### Added
- **Work log** block in `T - Daily Note`: login/logout, time log, waiting on others, wins, repeated tasks
- **Work Home** dashboard and **8 reports** (`01_Journal/Reports`), each driven by a `period` property
- **Insights engine** (`08_Meta/Work-Style/views/insights`): time by category, leaks, blockers by person, meetings,
  timesheet, estimate accuracy with corrections, task ledger with start/finish, proof register, best hours,
  weekly trend chart, repeated-work queue, wins, learning and teach-back debt, skills, projects, decisions
- Auto sections in the Weekly, Monthly, Yearly reviews and in Career & Work / Skills & Craft
- New templates: `T - Quarterly Review`, `T - Runbook`, `T - Report`; new folders `01_Journal/Quarterly`,
  `01_Journal/Reports`, `04_Resources/Runbooks`
- Hotkey snippets (Templater): switch activity, stop, stamp login, stamp logout
- `tools/`: `setup-obsidian.cjs` (per-device presets), `demo.cjs` (install/remove sample data),
  `check-vault.cjs` (runs the vault through the real Dataview engine) and a GitHub Action
- `examples/demo-data`: six weeks of sample data
- Docs: Work Style Guide, Setup, Cheat Sheet, Config, Dataview Cookbook, First 30 Days (Work)

### Changed
- Weekly notes use ISO weeks (`GGGG-[W]WW`, Monday start) instead of the locale-dependent `gggg-[W]ww`.
  Old weekly notes keep working as long as they have a `week_start` property or an ISO-style name
- Templates now read the date from the note's file name instead of "today", so notes created for another day
  (for example from the Calendar plugin) get the right date and links
- `T - Permanent Note`: optional `skill`, `taught`, `taught_on` for work learning and teach-back
- `T - Project`, `T - Skill Learning Log`, `T - Decision Log`, `T - Meeting`, `T - Person`: optional work fields
- README and START-HERE no longer claim `.obsidian/` is tracked (it has been per-device since the earlier change)
- `.gitignore`: tools cache, demo bookkeeping, and `08_Meta/Attachments/Proofs/`

### Fixed
- Removed stale Spaced Repetition schedule comments (`<!--SR:...-->`) that were baked into `T - Permanent Note`
  and would have been copied into every new note

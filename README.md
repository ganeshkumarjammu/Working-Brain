# 🧠 Second Brain + 💼 Work Style — an Obsidian vault template

![SecondBrain](/08_Meta/Attachments/Second-brain.png)

A ready-to-use Obsidian vault that combines **PARA** (Projects / Areas / Resources / Archive) with a **Zettelkasten** note pipeline (Fleeting → Literature → Permanent) and a journaling loop (Daily / Weekly / Monthly / Yearly).

On top of that sits **Work Style**: a work log that runs inside the same daily note and turns it into
proof of your work — hours, outcomes, time lost and why, estimate accuracy, repeated tasks, learning and
skill growth — with reports you can send or export.

It ships with 18 templates, 6 Dataview dashboards, 8 ready reports, 3 MOCs, 10 pre-built life Areas,
and a tag vocabulary that's deliberately small. Everything is plain Markdown — no lock-in, no database.

> New here? The vault explains itself: open [`START-HERE.md`](START-HERE.md) first, then
> [`08_Meta/First 30 Days.md`](08_Meta/First%2030%20Days.md).

---

## New: Work Style — a second brain that proves your work

The second brain turns what you *encounter* into what you can *use*. Work Style turns what you *do at
work* into what you can *prove*. Same vault, same daily note, same review loop.

| You log (2 seconds each) | The vault works out |
| --- | --- |
| Login and logout, then one line per activity (`Alt+Shift+S`) | Hours, deep-work share, meetings, breaks, **unlogged time** |
| `blocked` / `interruption` blocks with who or what caused them | **Time wasted**, split into "caused by others" and "mine to fix", per person |
| Tasks with an estimate, later a proof link | **Estimate accuracy** per task type, the correction to apply, overrun causes, proof coverage |
| Repeated tasks, wins, what you learned | A runbook queue, a wins and proof register, teach-back debt, skill evidence |

- **Work Home** (`08_Meta/Dashboards/Work Home`) — today, this week, leaks, estimates, proof, growth, trend
- **8 reports** in `01_Journal/Reports` — weekly status, monthly performance, quarterly evidence pack,
  timesheet and attendance, time waste, estimation and delivery, proof register, skills and learning.
  Change one `period` property, then export to PDF
- **Auto sections** inside your Weekly, Monthly, Quarterly and Yearly reviews, and inside the Career & Work
  and Skills & Craft Areas
- A **Dataview Cookbook** with every Dataview feature running on your own notes

Start with [`08_Meta/Work-Style/Work Style Guide`](08_Meta/Work-Style/Work%20Style%20Guide.md), then
[`First 30 Days (Work)`](08_Meta/Work-Style/First%2030%20Days%20%28Work%29.md). Want to see it full first?
`node tools/demo.cjs install` adds six weeks of sample data; `node tools/demo.cjs remove` takes it out.

> **Privacy.** A work log is evidence about your job. Keep the repo private, log *links* to tickets and PRs
> instead of pasting company code, customer data or documents, and check your employment agreement.
> `08_Meta/Attachments/Proofs/` is git-ignored by default for the same reason.

---

## Quick start

### 1. Get the files

```bash
git clone https://github.com/ganeshkumarjammu/second-brain.git MyBrain
cd MyBrain
rm -rf .git          # optional: start your own history instead of inheriting this one
git init             # if you want your notes version-controlled (recommended)
```

Or just download the ZIP and unzip it wherever you keep your notes.

A [`.gitignore`](.gitignore) is included and tuned for daily use: `.obsidian/` is per-device (so two
machines can run different themes and plugins off one repo), and only your notes, the Spaced Repetition
data and the Soft Paper theme are tracked. It has commented-out sections for attachments and private
folders if you want them excluded.

> **Keep it private.** If you push your own vault back to GitHub, make the repo private — this
> becomes your journal, your finances, and your notes about people.

### 2. Open it in Obsidian

1. Install [Obsidian](https://obsidian.md) (free, all platforms).
2. **Open folder as vault** → pick the folder you just cloned.
3. Trust the author when prompted (needed to enable community plugins).

`.obsidian/` is per-device, so set these once on each machine (Settings → Files & Links and Templater):

| Setting | Value |
| --- | --- |
| New note location | `00_Inbox` |
| Attachment folder | `08_Meta/Attachments` |
| Template folder | `08_Meta/Templates` |
| Daily notes folder / format | `01_Journal/Daily` · `YYYY-MM-DD` |
| Daily note template | `08_Meta/Templates/T - Daily Note` |
| Link format | Wikilinks, shortest path, auto-update on rename |

### 3. Install the plugins

Settings → Community plugins → turn off Restricted mode → Browse.

**Required — the vault is half-broken without these two:**

- **Dataview** — every dashboard in `08_Meta/Dashboards` is a Dataview query. Without it you'll see
  raw code blocks instead of live lists.
- **Templater** — every file in `08_Meta/Templates` uses `<% tp.date.now(...) %>` syntax. Obsidian's
  built-in Templates plugin will *not* render it.

**Strongly recommended:**

- **Calendar** + **Periodic Notes** — click a day to open its note; wires up Weekly/Monthly/Quarterly/Yearly
  (see config table below). Work Style needs these two as well, so treat them as required.
- **Omnisearch** — search that actually finds things.
- **Advanced Tables**, **Style Settings** + a theme (Minimal / Border).

**Optional:** QuickAdd (global capture hotkey), 
[Spaced Repetition](https://www.youtube.com/watch?v=DwSNZEW6jCU) (turn Permanent notes into flashcards), 
Kanban, Excalidraw, Git (auto-backup your vault).

### 4. Configure Templater, Periodic Notes and Work Style

The fast way, from the vault folder (Node 18+):

```bash
node tools/setup-obsidian.cjs      # merges the presets into this device's .obsidian, safe to re-run
```

It sets Dataview (JavaScript queries on — they are **off** by default), Templater's template folder and the
four Work Style hotkey snippets, Periodic Notes (all five periods), Calendar (week starts Monday) and the
hotkeys. Then do the two things no file can set: in **Templater** enable **Trigger Templater on new file
creation**, and reload Obsidian.

By hand instead? **Templater** → Template folder location: `08_Meta/Templates` → enable **Trigger Templater
on new file creation**. **Periodic Notes** → enable each and point it at:

| Period | Folder | Format | Template |
| --- | --- | --- | --- |
| Daily | `01_Journal/Daily` | `YYYY-MM-DD` | `08_Meta/Templates/T - Daily Note` |
| Weekly | `01_Journal/Weekly` | `GGGG-[W]WW` | `08_Meta/Templates/T - Weekly Review` |
| Monthly | `01_Journal/Monthly` | `YYYY-MM` | `08_Meta/Templates/T - Monthly Review` |
| Quarterly | `01_Journal/Quarterly` | `YYYY-[Q]Q` | `08_Meta/Templates/T - Quarterly Review` |
| Yearly | `01_Journal/Yearly` | `YYYY` | `08_Meta/Templates/T - Yearly Review` |

The weekly format is now ISO (`GGGG-[W]WW`, weeks start Monday). The old lowercase `gggg-[W]ww` depends on
your locale and can number weeks differently, which breaks week-based reports. Full setup and hotkeys:
[`08_Meta/Work-Style/Setup`](08_Meta/Work-Style/Setup.md).

### 5. Make Home your landing page

Open [`08_Meta/Dashboards/Home.md`](08_Meta/Dashboards/Home.md), right-click the tab → **Pin**.
(Or install the Homepage plugin and point it there.) Work has its own page:
[`Work Home`](08_Meta/Dashboards/Work%20Home.md), linked from Home.

---

## What's inside

```
00_Inbox/          Everything lands here first. Empty it weekly.
01_Journal/        Daily, Weekly, Monthly, Quarterly, Yearly notes + Reports — logbook + reviews.
02_Areas/          10 life domains with no end date (Health, Career, Money, ...).
03_Projects/       Active/ and Someday/ — things with a finish line.
04_Resources/      Reference by topic: Books, Articles, Courses, Mental Models, Quotes, Runbooks, ...
05_Notes/          The actual brain: Fleeting → Literature → Permanent, plus Questions.
06_People/         One note per person who matters.
07_Archive/        Finished or dead. Never delete, just archive.
08_Meta/           Templates, Dashboards, MOCs, Attachments, Work-Style (guides + engine).
tools/             Optional: setup, demo data and vault checks (Node). Not needed to use the vault.
examples/          Sample data for the demo (installed on request, never by default).
START-HERE.md      The system explained in one page. Read this.
```

Every folder contains an `_About …` note explaining what belongs there and what doesn't, so you can
never guess wrong about where something goes.

### Templates (`08_Meta/Templates`)

`T - Daily Note` · `T - Weekly Review` · `T - Monthly Review` · `T - Quarterly Review` · `T - Yearly Review` ·
`T - Project` · `T - Area` · `T - Permanent Note` · `T - Literature Note` · `T - Fleeting Note` ·
`T - Question` · `T - Book Note` · `T - Person` · `T - Meeting` · `T - Decision Log` ·
`T - Skill Learning Log` · `T - Runbook` · `T - Report`

### Dashboards (`08_Meta/Dashboards`)

- **Home** — inbox, active projects, next actions, open questions, stale fleeting notes, orphans
- **Work Home** — the Work Style command center: today, week, leaks, estimates, proof, growth, trend
- **Projects** · **Knowledge** · **Reading** · **Review Hub**

### MOCs (`08_Meta/MOCs`)

**Master MOC** · **Thinking Toolkit** · **How to Take Smart Notes**

### Work Style (`08_Meta/Work-Style`)

`Work Style Guide` · `Setup` · `Cheat Sheet` · `Config` · `First 30 Days (Work)` · `Dataview Cookbook` ·
`views/insights` (the engine behind every work dashboard and report) · `presets/`

---

## Conventions worth keeping

Dashboards query on frontmatter, so the queries only work if you keep these fields. Work Style finds
projects, skills, decisions and learning notes by `type`, so they can live in any folder:

| Note type | Key frontmatter |
| --- | --- |
| Project | `type: project`, `status: active\|someday\|done`, `area`, `deadline`, `priority`, `impact` |
| Area | `type: area`, `review-cadence` |
| Question | `type: question`, `status: open\|answered` |
| Book | `status: reading\|read\|shelved`, `author`, `started` |
| Skill | `type: skill`, `level: beginner\|advanced beginner\|competent\|proficient\|expert`, `target` |
| Decision | `type: decision`, `status: decided\|reviewed`, `review_on`, `result` |
| Runbook | `type: runbook`, `status: draft\|stable\|automated` |
| Daily (work) | `login`, `logout`, `login_source`, `work_mode`, `day_type: work\|leave\|holiday\|sick\|off` |
| Work learning note | a Permanent or Literature note with a `skill` property; optional `taught`, `taught_on` |

Naming:

- Daily `2026-08-03` · Weekly `2026-W32` (ISO, weeks start Monday) · Monthly `2026-08` · Quarterly `2026-Q3`
- Permanent notes are a **claim**, not a topic → `Compounding beats intensity.md`
- Literature notes → `Book - Deep Work - Cal Newport.md`
- Projects → `Ship portfolio site (Sep 2026).md`

Tags stay small on purpose — `#type/*`, `#area/*`, `#status/*`, `#priority/high`. Folders say where
it lives, tags say what it is, links say how it relates.

---

## Making it yours

- **Rename or delete Areas** you don't care about (`02_Areas/`) — 10 is a starting point, not a rule.
  If you rename one, update its `#area/*` tag too.
- **Delete the sample note** `05_Notes/Permanent/Compounding beats intensity.md` once you've seen the
  shape of a Permanent note.
- **Keep the `_About` notes** at first; delete them when the system is muscle memory.
- **Don't restructure before day 30.** Run it as-is for a month, then change one thing.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Dashboards show a code block instead of a table | Install & enable **Dataview** |
| New notes contain literal `<% tp.date.now(...) %>` | Install **Templater**, set its folder to `08_Meta/Templates`, enable *Trigger Templater on new file creation* |
| Dataview tables are empty | Your notes are missing the frontmatter fields above (`status`, `type`, ...) |
| `[[…]]` links look like plain text | Settings → Files & Links → **Use [[Wikilinks]]** on |
| Weekly/Monthly notes don't open | Periodic Notes isn't enabled for that period — see the table above |
| Vault opens but plugins are off | You skipped "Trust author" — Settings → Community plugins → turn off Restricted mode |
| Work dashboards show code or nothing | Dataview's **JavaScript queries** are off by default. Run `node tools/setup-obsidian.cjs`, or enable *Enable JavaScript Queries* in Dataview's settings |
| Weekly report numbers look one week off | Weekly format must be `GGGG-[W]WW` and Calendar's week must start on Monday |
| Work numbers are all zero | Nothing is logged yet. Stamp a login and switch an activity, or try `node tools/demo.cjs install` |

---

## Checking the vault (optional)

`tools/` holds a small Node toolkit. You never need it to use the vault, but it makes changes safe:

```bash
npm install --prefix tools
node tools/check-vault.cjs --demo   # frontmatter, templates, hotkey snippets, every Dataview query and dashboard
node tools/demo.cjs install         # try the dashboards with sample data (remove it again before committing)
```

The check runs your notes through the real Dataview engine (pinned to 0.5.68) without opening Obsidian, and a
GitHub Action (`.github/workflows/vault-check.yml`) runs it on every push. If this is your personal vault, you
can delete `.github/`.

---

## License

[MIT No Attribution (MIT-0)](LICENSE) — copy it, fork it, sell it, strip it for parts. You are not
required to keep a copyright notice or credit anyone.

That said: **a link back is appreciated.** It costs nothing and it's how the next person finds this.
It matters — just not enough to be a condition of using it.

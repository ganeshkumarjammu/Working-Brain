# 🧠 Second Brain — an Obsidian vault template

![[08_Meta/Attachments/Second-brain.png]]

A ready-to-use Obsidian vault that combines **PARA** (Projects / Areas / Resources / Archive) with a
**Zettelkasten** note pipeline (Fleeting → Literature → Permanent) and a journaling loop
(Daily / Weekly / Monthly / Yearly).

It ships with 15 templates, 5 Dataview dashboards, 3 MOCs, 10 pre-built life Areas, and a tag
vocabulary that's deliberately small. Everything is plain Markdown — no lock-in, no database.

> New here? The vault explains itself: open [`START-HERE.md`](START-HERE.md) first, then
> [`08_Meta/First 30 Days.md`](08_Meta/First%2030%20Days.md).

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

A [`.gitignore`](.gitignore) is included and tuned for daily use: it ignores only machine-local
churn (`.obsidian/workspace.json`, caches, OS junk) and keeps your vault config committed, so a
fresh clone on another machine comes up already configured. It has commented-out sections for
attachments and private folders if you want them excluded.

> **Keep it private.** If you push your own vault back to GitHub, make the repo private — this
> becomes your journal, your finances, and your notes about people.

### 2. Open it in Obsidian

1. Install [Obsidian](https://obsidian.md) (free, all platforms).
2. **Open folder as vault** → pick the folder you just cloned.
3. Trust the author when prompted (needed to enable community plugins).

The `.obsidian/` folder is included, so core settings are already correct:

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

- **Calendar** + **Periodic Notes** — click a day to open its note; wires up Weekly/Monthly/Yearly
  (see config table below).
- **Omnisearch** — search that actually finds things.
- **Advanced Tables**, **Style Settings** + a theme (Minimal / Border).

**Optional:** QuickAdd (global capture hotkey), Spaced Repetition (turn Permanent notes into
flashcards), Kanban, Excalidraw, Git (auto-backup your vault).

### 4. Configure Templater and Periodic Notes

**Templater** → Template folder location: `08_Meta/Templates` → enable **Trigger Templater on new
file creation**. (Without that last toggle, templates insert literal `<% %>` text.)

**Periodic Notes** → enable each and point it at:

| Period | Folder | Format | Template |
| --- | --- | --- | --- |
| Daily | `01_Journal/Daily` | `YYYY-MM-DD` | `08_Meta/Templates/T - Daily Note` |
| Weekly | `01_Journal/Weekly` | `gggg-[W]ww` | `08_Meta/Templates/T - Weekly Review` |
| Monthly | `01_Journal/Monthly` | `YYYY-MM` | `08_Meta/Templates/T - Monthly Review` |
| Yearly | `01_Journal/Yearly` | `YYYY` | `08_Meta/Templates/T - Yearly Review` |

### 5. Make Home your landing page

Open [`08_Meta/Dashboards/Home.md`](08_Meta/Dashboards/Home.md), right-click the tab → **Pin**.
(Or install the Homepage plugin and point it there.)

---

## What's inside

```
00_Inbox/          Everything lands here first. Empty it weekly.
01_Journal/        Daily, Weekly, Monthly, Yearly notes — logbook + reviews.
02_Areas/          10 life domains with no end date (Health, Career, Money, ...).
03_Projects/       Active/ and Someday/ — things with a finish line.
04_Resources/      Reference by topic: Books, Articles, Courses, Mental Models, Quotes, ...
05_Notes/          The actual brain: Fleeting → Literature → Permanent, plus Questions.
06_People/         One note per person who matters.
07_Archive/        Finished or dead. Never delete, just archive.
08_Meta/           Templates, Dashboards, MOCs, Attachments.
START-HERE.md      The system explained in one page. Read this.
```

Every folder contains an `_About …` note explaining what belongs there and what doesn't, so you can
never guess wrong about where something goes.

### Templates (`08_Meta/Templates`)

`T - Daily Note` · `T - Weekly Review` · `T - Monthly Review` · `T - Yearly Review` ·
`T - Project` · `T - Area` · `T - Permanent Note` · `T - Literature Note` · `T - Fleeting Note` ·
`T - Question` · `T - Book Note` · `T - Person` · `T - Meeting` · `T - Decision Log` ·
`T - Skill Learning Log`

### Dashboards (`08_Meta/Dashboards`)

- **Home** — inbox, active projects, next actions, open questions, stale fleeting notes, orphans
- **Projects** · **Knowledge** · **Reading** · **Review Hub**

### MOCs (`08_Meta/MOCs`)

**Master MOC** · **Thinking Toolkit** · **How to Take Smart Notes**

---

## Conventions worth keeping

Dashboards query on frontmatter, so the queries only work if you keep these fields:

| Note type | Key frontmatter |
| --- | --- |
| Project | `type: project`, `status: active\|someday\|done`, `area`, `deadline`, `priority` |
| Area | `type: area`, `review-cadence` |
| Question | `type: question`, `status: open\|answered` |
| Book | `status: reading\|read\|shelved`, `author`, `started` |

Naming:

- Daily `2026-08-03` · Weekly `2026-W32` · Monthly `2026-08`
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

---

## License

[MIT No Attribution (MIT-0)](LICENSE) — copy it, fork it, sell it, strip it for parts. You are not
required to keep a copyright notice or credit anyone.

That said: **a link back is appreciated.** It costs nothing and it's how the next person finds this.
It matters — just not enough to be a condition of using it.

---
type: meta
tags: [meta]
---

# 🧭 Where things go — one rule, no overlaps

> **The folder says what a note IS. The `area:` / `project:` link says what it's ABOUT. Fields in the time log say what HAPPENED.**
> A note has exactly one home folder. It never lives in a folder because of its topic.

A book about system design goes in `04_Resources/Books` (it *is* a book) with `area: "[[Skills and Craft]]"` (it's *about* your craft). It shows up there automatically, and it's never copied.

---

## The order to ask in (first "yes" wins)

| # | Ask | Yes → | Folder |
|---|---|---|---|
| 1 | Is it today's work (time, tasks, wins)? | **Daily note** → 💼 Work log | `01_Journal/Daily` |
| 2 | Did it happen at a time, with people? | **Meeting** | `type: meeting`, linked to its project and people |
| 3 | Is it one piece of work worth its own note (several days, a checklist, notes)? | **Task note** | `03_Projects/Tasks` (`type: task`) |
| 4 | Committed, with a finish line, many tasks? | **Project** | `03_Projects/Active` |
| 5 | Is it about one person? | **Person** | `06_People` |
| 6 | Steps you repeat at work? | **Runbook** | `04_Resources/Runbooks` |
| 7 | What *someone else* said (book, article, course, video)? | **Source** | `04_Resources/<Books…>` |
| 8 | Your own idea, stated as one sentence? | **Permanent** | `05_Notes/Permanent` |
| 9 | A responsibility you keep forever? (rare) | **Area** | `02_Areas/<Area>` (hub note only) |
| — | Not sure | **Inbox** | `00_Inbox` |

## The confusing pairs, settled
- **Task in the daily note vs task note:** a one-sitting job is a checkbox in today's note. Work that spans days, has a checklist or needs its own notes gets a **task note** (`T - Task Note`). Its time is logged in its own Work log and still counts in each day's numbers.
- **Project vs Area:** does it end? *Export Rewrite* ends, so it's a project. *Career and Work* never ends, so it's an area.
- **Runbook vs Permanent note:** a runbook is *how to do X again*. A permanent note is *what you understood*.
- **Report vs Review:** reviews (`Weekly`, `Monthly`, `Quarterly`) are your reflection. Reports (`01_Journal/Reports`) are numbers you export or share.

## Logging time (start AND end, every line)
```
- [start:: 09:20] [end:: 09:50] [cat:: meeting] [outcome:: yes] Standup
- [start:: 10:05] [end:: 11:20] [cat:: deep-work] [ticket:: PRJ-1042] Fix export   ← ticket
- [ ] Fix export bug [est:: 90]
    - [start:: 11:30] [end:: 12:10] [cat:: deep-work] Tests                         ← nested under the task
- [start:: 14:00] [end:: 14:50] [cat:: deep-work] [for:: Fix export bug] Review     ← [for:: task name]
```
**Inside a task note**, lines carry the date: `- [date:: 2026-09-17] [start:: 09:53] [end:: 11:40] [cat:: deep-work] …`
`Alt+Shift+S` does all of this for you: from the daily note, pick the task under "Which task?". In a task note, it logs right there.

## Books
`04_Resources/Books/Book - Title - Author.md`, with `status: to-read | reading | finished | abandoned`. The template follows your reading: before (why) → during (reading log, highlights) → after (3 sentences, verdict, what you'll DO).

## Habits
Your habits are the properties of your daily note. **[[08_Meta/Dashboards/Habit Tracker|🔁 Habit Tracker]]** shows them all in one table.

## Syncing two devices by hand
Pull before you start, and add / commit / pull / push when you leave. Never switch devices with unpushed work. See [[08_Meta/Work-Style/Setup|Setup]] → *Syncing by hand*.

Related: [[START-HERE]] · [[08_Meta/FAQ|FAQ]] · [[08_Meta/Work-Style/Cheat Sheet|Cheat Sheet]]

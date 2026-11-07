---
type: meta
tags: [meta, work-style]
---
# Cheat Sheet

Everything is plain text in your daily note. The dashboards read these fields, so spelling matters. Fields are a name and a value with two colons between them, wrapped in square brackets, on the same line as the thing they describe (see the examples below).

## Time log line (one per activity)
The easy way: press Alt+Shift+S (Switch activity). It closes the previous block at the current time, asks for the category and starts the next one.

```
- [start:: 09:20] [end:: 09:50] [cat:: meeting] [outcome:: yes] Standup and sprint sync
- [start:: 10:05] [end:: 12:15] [cat:: deep-work] [project:: Export Rewrite] Fix report export bug [proof:: PR 482]
- [start:: 12:15] [end:: 12:45] [cat:: blocked] [on:: Sam (DB access)] Waiting for read access
- [start:: 12:45] [end:: 13:10] [cat:: interruption] [on:: Support team] Urgent unrelated question
```

| Field | Meaning |
|---|---|
| start / end | 24-hour HH:mm. Write **both** on every line (Alt+Shift+S adds the end for you when you switch). If end is missing, the block ends when the next one starts (or at logout) |
| cat | deep-work, meeting, admin, learning, break, lunch, blocked, interruption, rework, drift, other |
| on | Who or what caused a blocked or interruption block. Builds the "who costs me time" table |
| outcome | yes or no, for meetings. Was there a decision, action or answer? |
| project | Name of a note in Projects. Builds per-project time |
| proof | Link, ticket, PR number, screenshot name |
| ticket | Ticket id. Ties the time to a task (see below) |
| for | Added by Alt+Shift+S when you pick a task without a ticket |
| date | Only inside a task note: the day this line belongs to |

Time between one block ending and the next starting shows up as unlogged time. That is intentional.

## Tasks
```
- [ ] Fix report export bug [type:: bugfix] [est:: 90] [project:: Export Rewrite]
- [x] Fix report export bug [type:: bugfix] [est:: 90] [actual:: 150] [cause:: unclear-req] [proof:: PR 482]
```
est and actual are minutes. type groups estimates (feature, bugfix, review, meeting-prep, ...). cause explains an overrun (unclear-req, blocked, underestimated, interrupted, scope-change).

## Tickets: automatic actual time, start and finish
Put the same ticket id on a task and on the time-log lines you spend on it. Skip the actual field on the task. The vault adds up the logged minutes and shows when the work started and finished.
```
- [x] Fix report export bug [type:: bugfix] [est:: 90] [ticket:: PRJ-1042] [proof:: PR 482]
- [start:: 10:05] [end:: 11:20] [cat:: deep-work] [ticket:: PRJ-1042] Reproduce and fix
- [start:: 14:00] [end:: 14:50] [cat:: deep-work] [ticket:: PRJ-1042] Tests and review changes
```
Use one ticket per task.

## Logging time into a specific task
Press **Alt+Shift+S** → pick the activity → **pick the task** (or Esc for none). That's it.
- A task in today's note: the line is linked to it for you.
- A task note: the line is written into that note.

## Task notes (one note per bigger task)
Create with `T - Task Note` (lives in `03_Projects/Tasks`, `type: task`). The TaskNotes plugin's `#task` notes count too, and so does its timer (`timeEntries`).
```
---
type: task
status: in-progress      # open · in-progress · done
project: "[[Export Rewrite]]"
ticket: PRJ-1053
est: 240                 # minutes
work_type: feature
completed:               # date, when done
---
## 💼 Work log
### ⏱ Time log
- [date:: 2026-09-17] [start:: 09:53] [end:: 11:40] [cat:: deep-work] Refactoring saved searches
```
- **Alt+Shift+S inside a task note** logs right there (dated), and closes whatever is still open today in the daily note or another task note. **Alt+Shift+E** stops it from either place.
- That time **counts in that day's numbers** (timeline, categories, timesheet), so keep a daily note for each day you work (the checks warn you otherwise).
- The note's own *Time on this task* section shows its total, the estimate and every block.

## Carried-over tasks
An unfinished task moved to a later day is marked `- [>]` in the old note, and the copy in today's note ends with `↪ [[2026-09-16]]`. `[>]` tasks are not counted as open or done.

## Days off
Set the day_type property in the daily note to leave, holiday, sick or off. That day is removed from the attendance count so it does not lower your "days logged".

## Waiting on someone
```
- [ ] Get DB read access [waiting_on:: Sam] [since:: 2026-09-14]
```

## Wins (the evidence file)
```
- [win:: Cut nightly job from 40 to 12 minutes] [impact:: saves 2.3 h/week] [kind:: impact] [proof:: PR 471] [project:: Export Rewrite]
```
kind can be impact, delivery, improvement, praise, learning. Use praise for thanks received: paste who said what in the win text.

## Learned and repeated
```
- [learned:: CORS preflight: why OPTIONS is sent first]
- [repeat:: Rotate staging API keys] [min:: 30]
```
The second time you log the same repeat name you are told to write a runbook. Name the runbook note exactly the same.

## Note types
| Template | Lives in | Purpose |
|---|---|---|
| T - Project | 03_Projects | Goal, success measures, and time and wins per project (auto) |
| T - Permanent Note | 05_Notes/Permanent | One idea in your own words. Add a skill property and a teach-back to track it as work learning |
| T - Runbook | 04_Resources/Runbooks | Step-by-step guide for repeated work |
| T - Decision Log | anywhere (type: decision) | Why you chose X, review date, how it turned out |
| T - Skill Learning Log | 02_Areas/Skills-and-Craft | Level, target, evidence (from links) |
| T - Meeting | anywhere (type: meeting) | Purpose, decisions, actions, outcome |
| T - Person | 06_People | Who they are, plus the time they block (auto) |
| T - Report | 01_Journal/Reports | A custom report with a period property |
| T - Task Note | 03_Projects/Tasks | One bigger task: checklist, its own Work log, time on this task (auto) |
| T - Book Note | 04_Resources/Books | to-read → reading → finished / abandoned, reading log, actions |

Use Templater's "Create new note from template" (button on Work Home) and choose the template. Link skills from Permanent notes, projects and wins with normal wiki links (the skill property on a note counts as a link) so the Skills table can count evidence.

## Hotkeys
| Keys | Action |
|---|---|
| Alt+Shift+I | Stamp login time (today's note) |
| Alt+Shift+O | Stamp logout time |
| Alt+Shift+S | Switch activity (closes the previous block, starts a new one) |
| Alt+Shift+E | Stop the current activity without starting another |
| Alt+Shift+D | Open today's daily note |
| Alt+Shift+W | Open this week's note |
| Alt+Shift+H | Open your homepage (needs the Homepage plugin) |

Rebind any of them in Settings > Hotkeys.

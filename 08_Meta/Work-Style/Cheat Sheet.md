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
| start / end | 24-hour HH:mm. If end is missing, the block ends when the next one starts (or at logout) |
| cat | deep-work, meeting, admin, learning, break, lunch, blocked, interruption, rework, drift, other |
| on | Who or what caused a blocked or interruption block. Builds the "who costs me time" table |
| outcome | yes or no, for meetings. Was there a decision, action or answer? |
| project | Name of a note in Projects. Builds per-project time |
| proof | Link, ticket, PR number, screenshot name |
| ticket | Ticket id. Ties the time to a task (see below) |

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

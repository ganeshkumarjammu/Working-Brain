---
type: meta
tags: [meta, work-style]
# Thresholds, category groups and folder names used by every work dashboard. Edit values, keep the names.
folder_daily: 01_Journal/Daily
folder_runbooks: 04_Resources/Runbooks
folder_people: 06_People
folder_notes: 05_Notes
value_cats: [deep-work, learning]
overhead_cats: [meeting, admin]
leak_cats: [blocked, interruption, rework, drift]
external_leak_cats: [blocked, interruption]
rest_cats: [break, lunch]
deep_work_target_pct: 50
unaccounted_alert_min: 30
est_ok_tolerance_pct: 25
overrun_ratio: 1.5
runbook_after_repeats: 2
proof_target_pct: 80
skill_stale_days: 45
teach_back_days: 14
workday_target_min: 480
off_day_types: [leave, holiday, sick, off]
---
# ⚙️ Work Style Config

The dashboards read the properties above. Change a number here and every dashboard follows.

| Property | What it controls |
|---|---|
| folder_daily | Where daily notes live (the time log is read from here) |
| folder_runbooks | Where runbooks live, so repeated tasks can be matched to them |
| folder_people | Where person notes live, so blockers link to them |
| folder_notes | Where Permanent and Literature notes live (work learning is read from here) |
| value_cats | Categories counted as deep, valuable work (used for the deep-work %) |
| overhead_cats | Necessary but not core work (meetings, admin) |
| leak_cats | Categories counted as wasted time |
| external_leak_cats | Leaks caused by others or by systems (blocked, interruption). The rest of the leaks are "mine to fix" |
| rest_cats | Breaks. Lunch is removed from the working day before percentages are calculated |
| deep_work_target_pct | Deep-work share you are aiming for (cards turn green above it) |
| unaccounted_alert_min | Unlogged minutes in a day before it is flagged |
| est_ok_tolerance_pct | An estimate counts as accurate when actual time is within this % of it |
| overrun_ratio | Actual / estimate at which a task is listed as an overrun |
| runbook_after_repeats | Times a task is repeated before you are told to write a runbook |
| proof_target_pct | Share of finished tasks that should carry a proof link |
| skill_stale_days | Days without new evidence before a skill is marked stale |
| teach_back_days | Days before an unshared learning note counts as teach-back debt |
| workday_target_min | Expected net minutes per working day, used by the timesheet (480 = 8 hours) |
| off_day_types | Values of the day_type property that mean a day off. These days are removed from attendance |

To add your own category (for example "code-review"), use it in the time log, then add its name to value_cats, overhead_cats or leak_cats. Unknown categories are shown as neutral.

Projects, skills, decisions and learning notes are found by their type property (project, skill, decision, permanent, literature), so they can live anywhere in the vault.

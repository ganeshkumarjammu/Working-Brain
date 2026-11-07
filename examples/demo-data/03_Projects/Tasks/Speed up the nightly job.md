---
type: task
status: in-progress
created: 2026-08-12
project: "[[Nightly Job Speedup]]"
ticket:
est: 1620
work_type: performance
due: 2026-09-30
completed:
proof:
tags: [task]
---

# ✅ Speed up the nightly job

**Done when:** the nightly job finishes in under 15 minutes for a week.

## 📋 Checklist
- [x] Profile the slowest steps
- [x] Batch the inserts
- [ ] Parallelise the export step

## 💼 Work log
### ⏱ Time log
- [date:: 2026-08-12] [start:: 17:34] [end:: 17:59] [cat:: deep-work] Writing tests for dark mode charts
- [date:: 2026-08-13] [start:: 14:40] [end:: 15:55] [cat:: deep-work] Investigating CSV encoding
- [date:: 2026-08-14] [start:: 11:52] [end:: 12:27] [cat:: deep-work] [proof:: PR 434] Debugging retry storm
- [date:: 2026-08-14] [start:: 16:45] [end:: 17:36] [cat:: deep-work] Investigating broken PDF footer
- [date:: 2026-08-17] [start:: 10:11] [end:: 11:53] [cat:: deep-work] Investigating role-based access
- [date:: 2026-08-17] [start:: 12:47] [end:: 13:34] [cat:: deep-work] Debugging retry storm
- [date:: 2026-08-17] [start:: 17:28] [end:: 18:17] [cat:: deep-work] [proof:: PR 452] Refactoring duplicate emails
- [date:: 2026-08-18] [start:: 11:36] [end:: 12:21] [cat:: deep-work] Implementing bulk import
- [date:: 2026-08-24] [start:: 15:03] [end:: 16:13] [cat:: deep-work] Implementing cache invalidation
- [date:: 2026-08-24] [start:: 16:30] [end:: 17:49] [cat:: deep-work] Refactoring audit log view
- [date:: 2026-09-07] [start:: 16:34] [end:: 17:17] [cat:: deep-work] Refactoring export filters
- [date:: 2026-09-07] [start:: 17:27] [end:: 18:16] [cat:: deep-work] Debugging pagination off-by-one
- [date:: 2026-09-08] [start:: 11:10] [end:: 12:30] [cat:: deep-work] Debugging CSV encoding
- [date:: 2026-09-10] [start:: 11:30] [end:: 12:23] [cat:: deep-work] Refactoring slow search
- [date:: 2026-09-10] [start:: 13:21] [end:: 14:03] [cat:: deep-work] Implementing retry storm
- [date:: 2026-09-10] [start:: 17:38] [end:: 18:13] [cat:: deep-work] Writing tests for slow search
- [date:: 2026-09-14] [start:: 14:50] [end:: 15:35] [cat:: deep-work] Refactoring CSV encoding
- [date:: 2026-09-14] [start:: 16:03] [end:: 17:19] [cat:: deep-work] Writing tests for saved searches
- [date:: 2026-09-15] [start:: 14:58] [end:: 16:13] [cat:: deep-work] Writing tests for dark mode charts
- [date:: 2026-09-15] [start:: 16:13] [end:: 16:54] [cat:: deep-work] Refactoring role-based access
- [date:: 2026-09-16] [start:: 13:59] [end:: 15:02] [cat:: deep-work] Refactoring CSV encoding
- [date:: 2026-09-16] [start:: 16:59] [end:: 17:56] [cat:: deep-work] Implementing bulk import

### 🗒 Notes while working
- The slowest step is the per-row insert; batching cut it by 60%

## 🏆 Proof
-

## 📊 Time on this task (auto)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { show: ["tasknote"] })
```

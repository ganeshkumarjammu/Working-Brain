---
type: task
status: open
created: <% tp.date.now("YYYY-MM-DD") %>
project:
ticket:
est:
work_type:
due:
completed:
proof:
tags: [task]
---

# ✅ <% tp.file.title %>

**Done when:**
<!-- One note per bigger task. est = minutes. Finished: status: done, completed: date, proof: PR / link.
     work_type groups estimates (feature, bugfix, review, …). Works with the TaskNotes plugin's #task tag too. -->

## 📋 Checklist
- [ ]

## 💼 Work log
<!-- Alt+Shift+S in THIS note logs time here (each line carries [date:: ]). From the daily note, pick this task under "Which task?". -->
### ⏱ Time log

### 🗒 Notes while working
-

## 🏆 Proof
-

## 📊 Time on this task (auto)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { show: ["tasknote"] })
```

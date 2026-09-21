---
type: daily
date: <% moment(tp.file.title, "YYYY-MM-DD").format("YYYY-MM-DD") %>
week: <% moment(tp.file.title, "YYYY-MM-DD").format("GGGG-[W]WW") %>
mood:
energy:
focus:
login:
login_source:
logout:
work_mode:
day_type: work
tags: [journal/daily]
---

# <% moment(tp.file.title, "YYYY-MM-DD").format("dddd, DD MMMM YYYY") %>

← [[<% moment(tp.file.title, "YYYY-MM-DD").subtract(1, "day").format("YYYY-MM-DD") %>]] | [[<% moment(tp.file.title, "YYYY-MM-DD").format("GGGG-[W]WW") %>|Week]] | [[<% moment(tp.file.title, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD") %>]] →

## 🎯 Top 3 outcomes today
- [ ]
- [ ]
- [ ]

## 📋 Other tasks
- [ ]

## 💼 Work log
<!-- Skip this whole block on days you don't work. Alt+Shift+I log in · Alt+Shift+S switch activity · Alt+Shift+E stop · Alt+Shift+O log out. Field guide: 08_Meta/Work-Style/Cheat Sheet -->
### ⏱ Time log

### 🚧 Waiting on others

### 🏆 Work wins & proof

### 🔁 Repeated today

## 📓 Log
<!-- timestamped as the day happens -->
-

## 💡 Ideas & sparks
<!-- tag every idea #idea so it shows up on the Home dashboard. promote the good ones to 05_Notes/Fleeting -->
- #idea 

## 📚 Learned today
<!-- one concrete thing. if blank, the day taught you nothing — fix that tomorrow -->
-

## 🧱 Blockers / friction
-

## 🙏 Grateful for
-

## 🌙 Reflection
**Win of the day:**
**What drained me:**
**One thing to do differently tomorrow:**

**Score /10:**

## 📊 Work numbers (auto)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "day", show: ["cards", "timeline", "categories", "leaks", "checks"], h: 3 })
```

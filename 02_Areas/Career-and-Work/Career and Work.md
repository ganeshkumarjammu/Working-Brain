---
type: area
tags: [type/area, area/career]
review-cadence: monthly
---

# 💼 Career & Work

## 🎯 The standard
- Doing work that is visibly valuable, not just busy
- Growing in skill and reputation each quarter
- Not the smartest person in the room
- Compensation reflects value delivered

## 📊 Current state
**Role:**
**Score /10:**
**Trending:**
**Last reviewed:**

## 🎯 12-month vision
**Title / scope:**
**Skills I'll have:**
**Proof I'll be able to point to:**

## 🏆 Wins log — anything that doesn't happen at your desk (manual)
| Date | What I did | Impact (numbers if possible) |
|---|---|---|
|  |  |  |

## 📈 Work this quarter (auto from your daily notes)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "thisquarter", show: ["cards", "chart"], h: 3 })
```
## 🏆 Wins log (auto) — the same list, filled in for you
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last180", show: ["wins"], limit: 12, h: 3 })
```
→ Everything in one place: [[08_Meta/Dashboards/Work Home|Work Home]] · export [[01_Journal/Reports/Quarterly Evidence Pack|Quarterly Evidence Pack]]

## 🎯 Goals this quarter
- [ ] 

## 🚀 Projects
```dataview
TABLE WITHOUT ID file.link AS "Project", deadline AS "Due", status AS "Status"
FROM "03_Projects" WHERE contains(string(area), "Career")
```

## 👥 Key people
```dataview
LIST FROM "06_People" SORT file.mtime DESC LIMIT 10
```

## 🧭 Career questions to revisit quarterly
- Am I building leverage, or just trading hours?
- Would I hire current-me for the job I want in 2 years? What's missing?
- Who is one level ahead of me, and what do they do that I don't?
- If I lost this job tomorrow, what would I actually have — skills, network, proof?
- Is my work compounding, or resetting every year?

## 💬 Feedback received
| Date | From | What they said | What I did about it |
|---|---|---|---|
|  |  |  |  |

## 📝 Notes in this area
```dataview
LIST FROM #area/career SORT file.mtime DESC LIMIT 20
```

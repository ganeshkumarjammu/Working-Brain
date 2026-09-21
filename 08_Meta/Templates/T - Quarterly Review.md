---
type: quarterly
quarter: <% moment(tp.file.title, "YYYY-[Q]Q").format("YYYY-[Q]Q") %>
tags: [journal/quarterly]
---

# <% moment(tp.file.title, "YYYY-[Q]Q").format("[Q]Q YYYY") %>

← [[<% moment(tp.file.title, "YYYY-[Q]Q").subtract(1, "quarter").format("YYYY-[Q]Q") %>]] | [[<% moment(tp.file.title, "YYYY-[Q]Q").format("YYYY") %>|Year]] | [[<% moment(tp.file.title, "YYYY-[Q]Q").add(1, "quarter").format("YYYY-[Q]Q") %>]] →

> The quarterly review is the re-aim (2 hours). Checklist: [[08_Meta/Dashboards/Review Hub|Review Hub]]. For a performance review or raise conversation, export the [[01_Journal/Reports/Quarterly Evidence Pack|Quarterly Evidence Pack]].

## 🎯 Goals for this quarter (write at the start)
- 
- 
- 

## 📈 Growth over the quarter
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "quarter", show: ["cards", "chart"], h: 4 })
```
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "quarter", show: ["trend"], h: 4 })
```

## 🏆 Wins and proof
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "quarter", show: ["wins"], limit: 40, h: 4 })
```

## 🚚 Delivery
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "quarter", show: ["ledger", "estimates"], limit: 40, h: 4 })
```

## 🧭 Projects, decisions, skills, learning
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "quarter", show: ["projects", "decisions", "skills", "learning"], h: 4 })
```

## ✍️ My review
- Goals met, partly met, missed (with evidence links):
- What can I do now that I couldn't do three months ago:
- Feedback received (who, what):
- Repeated pattern across the three monthly reviews:
- The two weakest Areas, and my plan:
- Goals for next quarter:

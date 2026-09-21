---
type: dashboard
tags: [meta/dashboard, work-style]
cssclasses: [dashboard]
---
# 💼 Work Home

Everything on this page is calculated from the Work log blocks in your daily notes. There is nothing to maintain here. New to it? Read [[08_Meta/Work-Style/Work Style Guide|the Work Style Guide]]. Field reference: [[08_Meta/Work-Style/Cheat Sheet|Cheat Sheet]]. Every Dataview feature with live examples: [[08_Meta/Work-Style/Dataview Cookbook|Dataview Cookbook]]. Back to [[08_Meta/Dashboards/Home|🏠 Home]].

```dataviewjs
await dv.view("08_Meta/Work-Style/views/actions")
```

## 📄 Reports (ready to send or export)
[[01_Journal/Reports/Weekly Status Report|Weekly Status Report]] · [[01_Journal/Reports/Monthly Performance Report|Monthly Performance Report]] · [[01_Journal/Reports/Quarterly Evidence Pack|Quarterly Evidence Pack]] · [[01_Journal/Reports/Timesheet and Attendance Report|Timesheet and Attendance Report]] · [[01_Journal/Reports/Time Waste Report|Time Waste Report]] · [[01_Journal/Reports/Estimation and Delivery Report|Estimation and Delivery Report]] · [[01_Journal/Reports/Proof Register|Proof Register]] · [[01_Journal/Reports/Skills and Learning Report|Skills and Learning Report]]

## Today
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "today", show: ["cards", "timeline"], h: 3 })
```

## To do and waiting
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "today", show: ["tasks", "waiting"], h: 3 })
```

## This week
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "thisweek", show: ["cards", "categories", "days"], h: 3 })
```

## ⏳ Time wasted (last 30 days)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last30", show: ["cards", "leaks", "blockers", "meetings"], h: 3 })
```

## 🎯 Estimation accuracy (last 90 days)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last90", show: ["estimates"], h: 3 })
```

## 🔁 Repeated work (last 90 days)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last90", show: ["repeats"], h: 3 })
```

## 🏆 Proof: wins and recognition (last 90 days)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last90", show: ["wins"], limit: 10, h: 3 })
```

## 📚 Growth
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last30", show: ["skills", "learning"], h: 3 })
```

## 🧭 Projects and decisions
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "today", show: ["projects", "decisions"], h: 3 })
```

## 📈 Month-by-month trend
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "today", show: ["trend"], months: 6, h: 3 })
```

## ⏱ Timesheet (this month)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "thismonth", show: ["timesheet"], h: 3 })
```

## 📉 Weekly trend
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "today", show: ["chart", "patterns"], h: 3 })
```

## 🧾 Task ledger (last 30 days)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last30", show: ["ledger", "proofs"], limit: 12, h: 3 })
```

## 🩺 Log hygiene (last 14 days)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last14", show: ["checks"], h: 3 })
```

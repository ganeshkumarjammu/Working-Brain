---
type: report
period: thisquarter
prepared_by:
tags: [journal/report]
---
# Quarterly Evidence Pack

Everything you need for a performance review or a raise conversation: outcomes, proof links, growth and trend.

To change the period, edit the period property above. Allowed values: thisweek, thismonth, thisquarter, thisyear, last7, last14, last30, last90, last180, or a custom span written like 2026-09-01..2026-09-30. Fill in prepared_by if you want your name on the report. Export: switch to Reading view, open the tab menu (the three dots at the top right) and choose Export to PDF. To send only the numbers, use the copy button in the manager update.

[[08_Meta/Dashboards/Work Home|Work Home]] · [[08_Meta/Work-Style/Dataview Cookbook|Dataview Cookbook]]

## At a glance
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["header", "cards", "chart"] })
```

## Month by month
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["trend"] })
```

## Wins
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["wins"], limit: 60 })
```

## Delivery
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["ledger"], limit: 60 })
```

## Proof register
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["proofs"], limit: 80 })
```

## Projects and decisions
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["projects", "decisions"] })
```

## Skills and learning
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["skills", "learning"] })
```

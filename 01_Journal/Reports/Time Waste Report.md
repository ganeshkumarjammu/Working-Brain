---
type: report
period: last30
prepared_by:
tags: [journal/report]
---
# Time Waste Report

Where time leaked, who or what caused it, and which meetings had no outcome. Use it to start a process conversation with facts.

To change the period, edit the period property above. Allowed values: thisweek, thismonth, thisquarter, thisyear, last7, last14, last30, last90, last180, or a custom span written like 2026-09-01..2026-09-30. Fill in prepared_by if you want your name on the report. Export: switch to Reading view, open the tab menu (the three dots at the top right) and choose Export to PDF. To send only the numbers, use the copy button in the manager update.

[[08_Meta/Dashboards/Work Home|Work Home]] · [[08_Meta/Work-Style/Dataview Cookbook|Dataview Cookbook]]

## At a glance
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["header", "cards", "chart"] })
```

## Leaks
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["leaks"] })
```

## Who or what is costing time
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["blockers"] })
```

## Meetings
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["meetings"] })
```

## When I do my best work
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["patterns"] })
```

---
type: report
period: last90
prepared_by:
tags: [journal/report]
---
# Skills and Learning Report

Skill levels against targets, the evidence behind them, what you learned and taught, and what you repeat.

To change the period, edit the period property above. Allowed values: thisweek, thismonth, thisquarter, thisyear, last7, last14, last30, last90, last180, or a custom span written like 2026-09-01..2026-09-30. Fill in prepared_by if you want your name on the report. Export: switch to Reading view, open the tab menu (the three dots at the top right) and choose Export to PDF. To send only the numbers, use the copy button in the manager update.

[[08_Meta/Dashboards/Work Home|Work Home]] · [[08_Meta/Work-Style/Dataview Cookbook|Dataview Cookbook]]

## At a glance
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["header"] })
```

## Skills
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["skills"] })
```

## Learning and teaching
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["learning"] })
```

## Repeated work
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["repeats"] })
```

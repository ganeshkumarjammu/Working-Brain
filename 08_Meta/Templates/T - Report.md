---
type: report
period: last30
prepared_by:
tags: [journal/report]
---

# <% tp.file.title %>

Change `period` above: thisweek, thismonth, thisquarter, thisyear, last7, last14, last30, last90, last180, or a custom span like 2026-09-01..2026-09-30. Export: Reading view, tab menu, Export to PDF.

```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["header", "cards", "leaks", "ledger"], limit: 20 })
```

---
type: runbook
status: stable
created: 2026-08-28
aliases: []
tags: [type/runbook]
---

# 📘 Weekly report export

**When to use it:** every Friday
**Typical time:** 20 min

## Steps
1. Run the export job
2. Check row counts
3. Send to the team lead

## Usage (auto)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { show: ["runbook"], h: 3 })
```

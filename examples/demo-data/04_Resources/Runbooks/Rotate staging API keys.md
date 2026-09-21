---
type: runbook
status: draft
created: 2026-09-08
aliases: []
tags: [type/runbook]
---

# 📘 Rotate staging API keys

**Typical time:** 30 min

## Steps
1. Generate new key
2. Update vault secret
3. Restart staging

## Usage (auto)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { show: ["runbook"], h: 3 })
```

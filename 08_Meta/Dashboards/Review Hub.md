---
type: dashboard
tags: [meta/dashboard]
---

# 🔁 Review Hub

The system only works if you close the loop. This page is the loop.

| Cadence | Time | Purpose |
|---|---|---|
| Daily | 10 min | Steer |
| Weekly | 30 min | Clear + correct |
| Monthly | 60 min | Audit + rebalance |
| Quarterly | 2 hr | Re-aim |
| Yearly | half day | Redefine |

---

## 📅 Recent dailies
```dataview
TABLE WITHOUT ID file.link AS "Day", mood AS "Mood", energy AS "Energy"
FROM "01_Journal/Daily"
SORT file.name DESC
LIMIT 10
```

## 🗓 Weekly reviews
```dataview
LIST
FROM "01_Journal/Weekly"
SORT file.name DESC
LIMIT 8
```

## 🌙 Monthly reviews
```dataview
LIST
FROM "01_Journal/Monthly"
SORT file.name DESC
LIMIT 12
```

---

## 🧾 Quarterly review checklist
- [ ] Read the last 3 monthly reviews back to back — what pattern repeats?
- [ ] Score all 10 Areas; pick the 2 weakest to focus on
- [ ] Kill every project that hasn't moved in 6 weeks (be ruthless, archive don't delete)
- [ ] Reread all Permanent notes created this quarter — merge duplicates, prune weak ones
- [ ] Review [[08_Meta/Dashboards/Knowledge|Knowledge]] orphans and link them
- [ ] Check decision logs whose "check back on" date has passed — was my reasoning good?
- [ ] Update the 12-month vision in each Area note
- [ ] Ask: *what am I still pretending not to know?*

## 📉 Health-of-system check
| Signal | Healthy | Mine |
|---|---|---|
| Inbox at end of week | 0 items |  |
| Permanent notes / month | 8+ |  |
| Fleeting notes >7 days old | 0 |  |
| Active projects | 3–5 |  |
| Areas scored ≤2 | 0 |  |
| Daily notes written / week | 5+ |  |

If more than two rows are unhealthy, the problem isn't discipline — it's that the system is too heavy. Cut something.

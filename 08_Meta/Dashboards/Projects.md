---
type: dashboard
tags: [meta/dashboard]
---

# 🚀 Projects Dashboard

> Cap yourself at **3–5 active projects**. More than that and none of them move.

## 🔥 Active
```dataview
TABLE WITHOUT ID file.link AS "Project", area AS "Area", deadline AS "Due", priority AS "Pri"
FROM "03_Projects"
WHERE status = "active"
SORT deadline ASC
```

## ⏳ Overdue or due soon
```dataview
TABLE WITHOUT ID file.link AS "Project", deadline AS "Due"
FROM "03_Projects"
WHERE status = "active" AND deadline AND deadline <= date(today) + dur(14 days)
SORT deadline ASC
```

## ⏭️ All open next actions
```dataview
TASK
FROM "03_Projects"
WHERE !completed
GROUP BY file.link
```

## 🧊 Stalled — untouched for 3+ weeks
```dataview
TABLE WITHOUT ID file.link AS "Project", file.mtime AS "Last touched"
FROM "03_Projects"
WHERE status = "active" AND file.mtime <= date(today) - dur(21 days)
SORT file.mtime ASC
```
> Stalled means one of three things: it's not actually important, the next action isn't defined, or you're afraid of it. Diagnose which, then act or archive.

## 💤 Someday / maybe
```dataview
LIST
FROM "03_Projects/Someday"
```

## ✅ Completed
```dataview
TABLE WITHOUT ID file.link AS "Project", deadline AS "Was due"
FROM "03_Projects" OR "07_Archive"
WHERE status = "done"
SORT file.mtime DESC
LIMIT 20
```

---

## Before starting any new project, answer:
1. What's the outcome, in one observable sentence?
2. What's the deadline? (No deadline = not a project, it's a wish)
3. Which Area does this serve?
4. What am I dropping to make room for it?
5. What's the very next physical action?

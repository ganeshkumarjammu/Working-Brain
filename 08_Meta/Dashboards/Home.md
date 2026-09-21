---
type: dashboard
tags: [meta/dashboard]
cssclasses: [dashboard]
---

# 🏠 Home

> [!tip] Pin this note (right-click the tab → Pin) and make it your startup note.
> Settings → Appearance won't do it — use the **Homepage** community plugin, or just pin.

## 🚦 Quick capture
```button
```
- ➕ [[00_Inbox/Inbox|Open Inbox]]
- 📅 Today's note → `Ctrl+P` "Daily notes: Open today"

---

## 💼 Work — this week
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "thisweek", show: ["cards"], h: 3 })
```
→ [[08_Meta/Dashboards/Work Home|Work Home]] · [[01_Journal/Reports/Weekly Status Report|Weekly Status Report]] · [[08_Meta/Work-Style/Work Style Guide|Work Style Guide]]

---

## 🔥 Inbox — process to zero weekly
```dataview
LIST
FROM "00_Inbox"
SORT file.ctime ASC
```

## 🚀 Active projects
```dataview
TABLE WITHOUT ID
  file.link AS "Project",
  area AS "Area",
  deadline AS "Due",
  priority AS "Priority"
FROM "03_Projects"
WHERE status = "active"
SORT deadline ASC
```

## ⏭️ Next actions across all projects
```dataview
TASK
FROM "03_Projects"
WHERE !completed
GROUP BY file.link
```

## 📋 Loose tasks — daily notes, areas, inbox
<!-- tasks that don't belong to a project. if this list grows past ~15, you're capturing more than you're doing -->
```dataview
TASK
FROM "01_Journal" OR "02_Areas" OR "00_Inbox"
WHERE !completed
SORT file.cday DESC
```

## 💡 All ideas — every `#idea` ever captured
<!-- write ideas as: - #idea the thing. review these monthly: promote, or delete -->
```dataview
LIST
FROM #idea
SORT file.cday DESC
LIMIT 50
```

## 🧭 Areas
```dataview
TABLE WITHOUT ID file.link AS "Area", review-cadence AS "Review"
FROM "02_Areas"
WHERE type = "area"
SORT file.name ASC
```

## 🧠 Recently distilled (Permanent notes)
```dataview
LIST
FROM "05_Notes/Permanent"
SORT file.mtime DESC
LIMIT 10
```

## ❓ Open questions
```dataview
LIST
FROM "05_Notes/Questions"
WHERE status = "open"
SORT file.mtime DESC
```

## 📚 Currently reading
```dataview
TABLE WITHOUT ID file.link AS "Book", author AS "Author", started AS "Started"
FROM "04_Resources/Books"
WHERE status = "reading"
```

## ⚠️ Fleeting notes older than 7 days — promote or delete
```dataview
LIST
FROM "05_Notes/Fleeting"
WHERE file.cday <= date(today) - dur(7 days)
SORT file.cday ASC
```

## 🕸 Orphans — notes with no links in or out
```dataview
LIST
FROM "05_Notes"
WHERE length(file.inlinks) = 0 AND length(file.outlinks) = 0
LIMIT 15
```

---

**Jump to:** [[START-HERE]] · [[08_Meta/Dashboards/Work Home|💼 Work Home]] · [[08_Meta/FAQ|❓ FAQ]] · [[08_Meta/Dashboards/Review Hub|🔁 Reviews]] · [[08_Meta/Dashboards/Knowledge|🧠 Knowledge]] · [[08_Meta/Dashboards/Reading|📚 Reading]] · [[08_Meta/MOCs/Master MOC|🗺 Master MOC]]

---
type: dashboard
tags: [meta/dashboard]
---

# 🧠 Knowledge Dashboard

Where raw input becomes actual understanding.

## The pipeline
`Capture → Fleeting → Literature → Permanent → Expressed`

| Stage | Count |
|---|---|
| Fleeting | `$= dv.pages('"05_Notes/Fleeting"').length` |
| Literature | `$= dv.pages('"05_Notes/Literature"').length` |
| Permanent | `$= dv.pages('"05_Notes/Permanent"').length` |
| Questions | `$= dv.pages('"05_Notes/Questions"').length` |

*(Inline JS counts require Dataview's "Enable JavaScript Queries" + "Enable Inline JavaScript Queries" settings.)*

---

## 🌱 Fleeting — needs processing
```dataview
LIST
FROM "05_Notes/Fleeting"
SORT file.cday ASC
```

## 📖 Literature notes
```dataview
TABLE WITHOUT ID file.link AS "Note", author AS "Author", area AS "Area"
FROM "05_Notes/Literature"
SORT file.mtime DESC
LIMIT 20
```

## 💎 Permanent notes
```dataview
TABLE WITHOUT ID file.link AS "Idea", area AS "Area", confidence AS "Confidence"
FROM "05_Notes/Permanent"
SORT file.mtime DESC
```

## 🔗 Most-connected ideas (your hubs)
```dataview
TABLE WITHOUT ID file.link AS "Note", length(file.inlinks) AS "Backlinks"
FROM "05_Notes/Permanent"
SORT length(file.inlinks) DESC
LIMIT 10
```

## 🕳 Weakly connected — go link these
```dataview
TABLE WITHOUT ID file.link AS "Note", length(file.outlinks) AS "Links out"
FROM "05_Notes/Permanent"
WHERE length(file.outlinks) < 2
SORT file.mtime DESC
```

## ❓ Open questions
```dataview
TABLE WITHOUT ID file.link AS "Question", area AS "Area", status AS "Status"
FROM "05_Notes/Questions"
SORT status ASC
```

## 🧩 Mental models
```dataview
LIST
FROM "04_Resources/Mental-Models"
SORT file.name ASC
```

---

## 🎲 Serendipity — pick a random old note and reread it
```dataview
LIST
FROM "05_Notes/Permanent"
WHERE file.mtime <= date(today) - dur(30 days)
SORT file.mtime ASC
LIMIT 3
```
> Rereading old notes is not nostalgia. It's how you notice that two ideas you learned months apart are actually the same idea.

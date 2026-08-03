---
type: dashboard
tags: [meta/dashboard]
---

# 📚 Reading Dashboard

## 📖 Currently reading
```dataview
TABLE WITHOUT ID file.link AS "Title", author AS "Author", started AS "Started"
FROM "04_Resources/Books"
WHERE status = "reading"
```

## ✅ Finished
```dataview
TABLE WITHOUT ID file.link AS "Title", author AS "Author", finished AS "Finished", rating AS "★"
FROM "04_Resources/Books"
WHERE status = "finished"
SORT finished DESC
```

## 📥 To read
```dataview
TABLE WITHOUT ID file.link AS "Title", author AS "Author", area AS "Area"
FROM "04_Resources/Books"
WHERE status = "to-read"
```

## 🗞 Articles
```dataview
TABLE WITHOUT ID file.link AS "Article", author AS "Author", file.cday AS "Saved"
FROM "04_Resources/Articles"
SORT file.cday DESC
LIMIT 25
```

## 🎧 Videos & podcasts
```dataview
LIST
FROM "04_Resources/Videos-and-Podcasts"
SORT file.cday DESC
LIMIT 20
```

## 🎓 Courses
```dataview
TABLE WITHOUT ID file.link AS "Course", status AS "Status"
FROM "04_Resources/Courses"
```

---

## Rules that make reading actually pay off

1. **No note, no read.** If a book doesn't produce at least one Literature note, you didn't read it — you looked at it.
2. **Quit books.** 50 pages in, if it isn't earning attention, stop. Sunk cost is not a reading strategy.
3. **Every finished book owes you one action.** Write it in the "What I will actually DO" section.
4. **Re-read the greats.** One re-read of a great book beats three new mediocre ones.
5. **Read across areas.** All your best ideas will come from colliding two fields.

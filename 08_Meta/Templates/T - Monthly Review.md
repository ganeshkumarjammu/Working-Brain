---
type: monthly
month: <% moment(tp.file.title, "YYYY-MM").format("YYYY-MM") %>
tags: [journal/monthly]
---

# <% moment(tp.file.title, "YYYY-MM").format("MMMM YYYY") %>

← [[<% moment(tp.file.title, "YYYY-MM").subtract(1, "month").format("YYYY-MM") %>]] | [[<% moment(tp.file.title, "YYYY-MM").format("YYYY-[Q]Q") %>|Quarter]] | [[<% moment(tp.file.title, "YYYY-MM").add(1, "month").format("YYYY-MM") %>]] →

## 📖 The month in one paragraph


## 🏆 Top 3 accomplishments
1.
2.
3.

## 📉 Top 3 disappointments — and what they taught me
1.
2.
3.

## 🚀 Projects
**Completed:**
**Started:**
**Killed (and why):**
**Stalled (be honest about why):**

## 💼 Work review (auto)
### The month in numbers
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "month", show: ["cards", "chart", "categories", "days"], h: 4 })
```

### Where time leaked
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "month", show: ["leaks", "blockers", "meetings"], h: 4 })
```

### Delivery and estimation pattern
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "month", show: ["ledger", "estimates"], limit: 30, h: 4 })
```

### Repeated work, wins, learning
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "month", show: ["repeats", "wins", "learning"], h: 4 })
```

### Skills, projects, decisions
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "month", show: ["skills", "projects", "decisions"], h: 4 })
```

**Estimate correction factors I will apply next month:**
**Skills to move up a level (edit the level in the skill notes):**
**Decisions to revisit:**

## 🧠 Intellectual growth
**Books/courses finished:**
**Best idea I encountered:**
**Belief I changed my mind about:**
**Skill measurably better than last month:**

## 🔗 Permanent notes written
```dataview
LIST
FROM "05_Notes/Permanent"
WHERE file.cday >= date(today) - dur(30 days)
SORT file.cday DESC
```

## 🩺 Area audit
Which area did I neglect most?
What is the cost of continuing to neglect it?

## 💰 Money
**In / Out / Saved:**
**Biggest waste:**
**Best purchase:**

## 🎯 Next month
**Theme for the month:**
**3 outcomes:**
1.
2.
3.
**One habit to install:**
**One thing to stop doing:**

---
type: monthly
month: <% tp.date.now("YYYY-MM") %>
tags: [journal/monthly]
---

# <% tp.date.now("MMMM YYYY") %>

← [[<% tp.date.now("YYYY-MM", "P-1M") %>]] | [[<% tp.date.now("YYYY") %>|Year]] | [[<% tp.date.now("YYYY-MM", "P1M") %>]] →

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

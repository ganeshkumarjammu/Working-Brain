---
type: area
created: <% tp.date.now("YYYY-MM-DD") %>
tags: [type/area]
review-cadence: monthly
---

# <% tp.file.title %>

## 🎯 Standard I hold myself to
<!-- Areas don't have deadlines, they have STANDARDS. What does "maintained well" look like here? -->


## 📊 Current state (be honest)
**Score /10:**
**Trending:** up / flat / down
**Last reviewed:**

## 🎯 12-month vision


## 🔁 Habits & routines that serve this area
- 

## 📈 Metrics I track
| Metric | Current | Target |
|---|---|---|
|  |  |  |

## 🚀 Active projects
```dataview
LIST
FROM #type/project
WHERE contains(area, this.file.name) AND status = "active"
```

## 📝 Notes in this area
```dataview
LIST
WHERE contains(area, this.file.name) AND type != "project"
SORT file.mtime DESC
LIMIT 20
```

## 📚 Key resources
- [[ ]]

## 🪞 Review prompts
- What's the bottleneck in this area right now?
- What am I doing here out of habit rather than intention?
- What would a 10/10 in this area cost me?

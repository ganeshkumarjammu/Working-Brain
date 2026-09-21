---
type: project
status: active
created: <% tp.date.now("YYYY-MM-DD") %>
deadline:
area:
priority: medium
impact:
stakeholder:
tags: [type/project, status/active]
---

# 🚀 <% tp.file.title %>

## 🎯 Outcome
<!-- What is TRUE when this is done? One sentence, observable, no weasel words. -->


## Why this matters
<!-- If you can't answer this, don't start it. -->


## Definition of done
- [ ] 
- [ ] 

## ⏭️ Next action
<!-- The very next physical action. "Plan the thing" is not an action. -->
- [ ] 

## 📋 Tasks
- [ ] 
- [ ] 

## 🚧 Blockers & risks
| Risk | Likelihood | Mitigation |
|---|---|---|
|  |  |  |

## 📚 Resources
- [[ ]]

## 📓 Progress log
### <% tp.date.now("YYYY-MM-DD") %>
- Created

## 🏁 Retrospective (fill in when closing)
**Shipped? y/n:**
**What went well:**
**What I'd do differently:**
**Time estimated vs actual:**
**Lesson to carry forward:** → promote to [[ ]]

## ⏱ Time & proof (auto)
<!-- Log time to this project by adding a project field with exactly this note's name to time-log lines and tasks in the daily note. See 08_Meta/Work-Style/Cheat Sheet. -->
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { show: ["project"], h: 3 })
```

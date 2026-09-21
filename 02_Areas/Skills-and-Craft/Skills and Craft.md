---
type: area
tags: [type/area, area/skills]
review-cadence: monthly
---

# 🛠 Skills & Craft

> Knowledge you can't *do* anything with is trivia. This area is where knowing becomes doing.

## 🎯 The standard
- 1–2 skills in deliberate practice at any time (not five)
- Every skill has a project attached — practice without output is a hobby
- I can name my current level and the evidence for it

## 📊 Current state
**Score /10:**
**Last reviewed:**

## 🎯 Skill portfolio
| Skill | Level | In practice? | Project using it |
|---|---|---|---|
|  |  |  |  |

## 🧭 Skill stack strategy
> Rare combinations beat single excellence. You don't need to be top 1% at one thing — top 25% at three complementary things is rarer and more valuable.

**My intended combination:**
- 
- 
- 

## 📚 Skill logs
```dataview
TABLE WITHOUT ID file.link AS "Skill", level AS "Level"
FROM #type/skill
SORT file.mtime DESC
```

## 🧭 Skill growth (auto: levels, targets, evidence)
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last90", show: ["skills", "learning"], h: 3 })
```

## 🧪 Deliberate practice rules
1. Practice at the edge of ability — comfortable practice is just repetition
2. Get feedback fast; without feedback you rehearse your mistakes
3. Isolate the weakest sub-skill and drill it
4. Track failures, not just hours
5. Ship regularly — a deadline teaches faster than a tutorial

## 🪞 Review prompts
- Which skill have I plateaued on, and what specifically am I avoiding practicing?
- What's a skill that would make everything else easier? (usually writing, or communication)
- Am I collecting tutorials instead of building?

## 📝 Notes in this area
```dataview
LIST FROM #area/skills SORT file.mtime DESC LIMIT 20
```

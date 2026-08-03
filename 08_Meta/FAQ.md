---
type: meta
tags: [meta]
---

# ❓ FAQ — the questions that come up while using this vault

Short answers. If an answer here contradicts a habit you've built, trust the habit — the system exists to serve you, not the other way round.

---

## Where do ideas, todos, and random thoughts go?

**Todos** → today's Daily Note, under `## 📋 Other tasks`. If the todo belongs to a bigger effort, it goes in that project's note in `03_Projects` instead.

**Ideas** → today's Daily Note, under `## 💡 Ideas & sparks`, written as `- #idea the thing`. The tag is what makes it findable later. If an idea survives the week and still feels good, promote it to its own file in `05_Notes/Fleeting`.

**Random thoughts / anything else** → [[00_Inbox/Inbox|Inbox]]. That's the catch-all.

The rule: **if you can't file it in 5 seconds, it goes in the Inbox.** You don't decide what a thought *is* at the moment you have it — you just dump it. Sorting happens once a week, not continuously. An inbox you hesitate over is an inbox you stop using.

Most of what you capture gets deleted at review time. That's the system working, not failing.

---

## What's the difference between an idea, a task, a project, and an area?

The difference is **commitment** and **whether it ends**.

| | Ends? | How many steps? | Committed? |
|---|---|---|---|
| **Idea** | — | — | No |
| **Task** | Yes | One | Yes |
| **Project** | Yes | Many | Yes |
| **Area** | Never | Ongoing | Yes |

**Idea** — a thought you haven't committed to. No action attached. *"Maybe I should learn Rust."* You might never do it. Ideas cost nothing to keep and nothing to drop.

**Task** — one action, one sitting. *"Email the landlord."* It has no parts. You either did it or you didn't.

**Project** — a finish line plus multiple tasks to reach it. *"Ship my portfolio site by September."* You can't do it in one sitting, and you can tell clearly when it's done.

**Area** — never finishes. *"Health."* *"Career."* There's no done; you just maintain it forever. Lives in `02_Areas`.

Ideas graduate. Idea → you decide to actually do it → it becomes a **task** (one step) or a **project** (many steps).

---

## When should I use the Projects folder?

Use `03_Projects` when **both** are true:

1. You can name the moment it's finished
2. Getting there takes more than one task

If it's one action → it's a task. Put it in your daily note.
If it never ends → it's an Area, not a project.
If you haven't actually decided to do it → leave it as an idea, or park it in `03_Projects/Someday`.

**Quick test:**

| Thing | What it is | Why |
|---|---|---|
| Ship portfolio site (Sep 2026) | Project | Ends, many steps |
| Fix the footer link | Task | One action |
| Get better at design | Area | Never ends |
| Redesign my homepage | Project | Ends, many steps |
| Maybe learn Rust someday | Idea | Not committed |

---

## How do I see all my tasks and ideas from every day at once?

Tasks and ideas behave differently here, because they're written differently.

Both are already wired up on [[08_Meta/Dashboards/Home|🏠 Home]]. Open it and scroll.

### Tasks
Tasks are checkboxes (`- [ ]`), and Dataview finds checkboxes anywhere in the vault. Home has two task sections:

- **Next actions across all projects** — tasks inside `03_Projects`
- **Loose tasks** — everything else: daily notes, areas, inbox

Between them, every unfinished checkbox in the vault appears somewhere. Nothing gets lost in an old daily note.

### Ideas
Ideas are plain bullets, not checkboxes — Dataview can't grab "bullets under a heading." So ideas are found by **tag**, not by location:

```markdown
- #idea build a CLI that reads my daily notes
```

The `#idea` tag is what puts it in the **All ideas** list on Home. An untagged idea is invisible to that list — it still lives in your daily note, but you'll never see it again unless you go looking.

The daily note template now starts that line for you with `- #idea ` already typed.

**Why tag instead of making ideas checkboxes?** A checkbox implies you've committed to doing it. An idea is explicitly *not* committed — see the table above. Tagging keeps ideas and todos in separate lists, which is the whole point.

---

**Related:** [[START-HERE]] · [[00_Inbox/Inbox|📥 Inbox]] · [[08_Meta/Dashboards/Home|🏠 Home]] · [[08_Meta/First 30 Days|🗓 First 30 Days]]

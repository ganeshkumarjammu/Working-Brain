---
type: meta
tags: [meta]
---

# 📥 Inbox

**Rule: capture fast, sort later.** Anything you can't file in 5 seconds goes here.
Empty this to zero every week. Non-negotiable — an inbox that's never emptied stops being trusted, and an untrusted inbox stops being used.

## Quick capture
<!-- Dump lines here. Process during the weekly review. -->
- 

---

## Processing decision tree
For each item ask: **what is this, and what do I do with it?**

| It is... | Send it to |
|---|---|
| A task | today's Daily Note or a Project |
| A commitment with an end date | `03_Projects` |
| An ongoing responsibility | `02_Areas` |
| Notes about a source | `05_Notes/Literature` |
| A half-formed idea | `05_Notes/Fleeting` |
| A finished thought | `05_Notes/Permanent` |
| Something I don't know | `05_Notes/Questions` |
| Reference material | `04_Resources` |
| About a person | `06_People` |
| No longer relevant | delete — genuinely, delete it |

**Default to delete.** Most captured things are not worth keeping. A vault of 200 useful notes beats one of 5,000 unread ones.

## Loose files sitting in the Inbox folder
```dataview
LIST
FROM "00_Inbox"
WHERE file.name != "Inbox"
SORT file.ctime ASC
```

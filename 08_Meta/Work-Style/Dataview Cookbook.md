---
type: meta
tags: [meta, work-style]
---
# Dataview Cookbook

Every block on this page is live: it runs against your own notes and updates as you log. Switch to **Reading view** to see results. Copy any block into a note of your own and change it.

Owner:: Me

That line above is a page-level inline field (the note now has an owner property). The query in section 11 reads it back.

**Where things live in this vault:** daily notes `01_Journal/Daily`, projects `03_Projects`, skills and decisions are found by their type property, Permanent notes `05_Notes/Permanent`, reports `01_Journal/Reports`.

**Contents:** 1 Data model · 2 Sources · 3 LIST · 4 TABLE · 5 WHERE, SORT, LIMIT · 6 GROUP BY · 7 FLATTEN and the time log · 8 TASK · 9 CALENDAR · 10 Functions · 11 Inline queries · 12 DataviewJS · 13 Build your own report · 14 Section catalog of the insights engine · 15 Gotchas

## 1. What Dataview can see
Dataview reads four kinds of data. Nothing has to be set up.

| Kind | Where it comes from | Example in this vault |
|---|---|---|
| Implicit file fields | Every note has them automatically | file.name, file.day, file.folder, file.tags, file.inlinks, file.lists, file.tasks |
| Properties | The YAML block at the top | login, logout, work_mode, focus, level, status |
| Inline fields | Written in the text as key, two colons, value | Owner on this page |
| List-item and task fields | Square-bracket fields on a list line | start, end, cat, est, actual, ticket, proof, win |

```dataview
TABLE
  file.folder AS "Folder",
  length(file.lists) AS "List items",
  length(file.tasks) AS "Tasks",
  length(file.outlinks) AS "Links out",
  length(file.inlinks) AS "Links in"
FROM "01_Journal/Daily"
SORT file.name DESC
LIMIT 3
```

## 2. Sources: the FROM clause
By folder:
```dataview
LIST
FROM "03_Projects"
```
By tag (tags in a note's properties count too), combined with OR:
```dataview
LIST
FROM #type/project OR #type/skill
LIMIT 8
```
Notes that link to this note (incoming links):
```dataview
LIST
FROM [[Home]]
LIMIT 5
```
Notes that Home links out to:
```dataview
LIST
FROM outgoing([[Home]])
```
Combine with AND and exclude with a minus sign:
```dataview
LIST
FROM #journal/daily AND -"08_Meta/Templates"
LIMIT 3
```

## 3. LIST
Plain list with filter, sort and limit:
```dataview
LIST
FROM "01_Journal/Daily"
WHERE file.day >= date(today) - dur(10 days)
SORT file.day DESC
```
Show a value next to each note:
```dataview
LIST login + " → " + logout
FROM "01_Journal/Daily"
WHERE login AND logout
SORT file.day DESC
LIMIT 5
```
Without the default link, so you write your own text:
```dataview
LIST WITHOUT ID "**" + file.name + "** worked " + work_mode
FROM "01_Journal/Daily"
WHERE work_mode = "remote"
SORT file.day DESC
LIMIT 5
```
Grouped list, one bullet per group with its notes underneath:
```dataview
LIST rows.file.link
FROM "01_Journal/Daily"
WHERE work_mode
GROUP BY work_mode
```

## 4. TABLE
Columns, aliases and a filter:
```dataview
TABLE login AS "In", logout AS "Out", work_mode AS "Where", focus AS "Focus", energy AS "Energy"
FROM "01_Journal/Daily"
WHERE file.day >= date(today) - dur(14 days) AND login
SORT file.day DESC
```
Without the file column, with computed columns (choice is if / then / else):
```dataview
TABLE WITHOUT ID
  file.link AS "Day",
  dateformat(file.day, "cccc") AS "Weekday",
  choice(focus >= 4, "🟢 focused", choice(focus >= 3, "🟡 ok", "🔴 scattered")) AS "Focus",
  default(day_type, "work") AS "Type"
FROM "01_Journal/Daily"
WHERE focus OR day_type
SORT file.day DESC
LIMIT 10
```
Date arithmetic gives a duration:
```dataview
TABLE WITHOUT ID
  file.link AS "Day",
  date(today) - file.day AS "How long ago"
FROM "01_Journal/Daily"
SORT file.day DESC
LIMIT 4
```

## 5. WHERE, SORT and LIMIT
Multiple sort keys, a date property and combined conditions. Fridays only:
```dataview
TABLE work_mode AS "Where", focus AS "Focus"
FROM "01_Journal/Daily"
WHERE file.day.weekday = 5 AND focus
SORT focus DESC, file.day DESC
LIMIT 6
```
Text matching with regular expressions, September notes only:
```dataview
LIST
FROM "01_Journal/Daily"
WHERE regextest("^2026-09-1", file.name)
SORT file.name ASC
```
Missing values: WHERE login keeps notes that have a login, WHERE !login keeps the ones without (days off, empty notes):
```dataview
TABLE day_type AS "Day type"
FROM "01_Journal/Daily"
WHERE !login
SORT file.day DESC
LIMIT 5
```

## 6. GROUP BY and aggregates
Inside a group, `rows` holds the notes. Functions like sum, average, min, max and length work on lists of values, and `rows.focus` collects that field from every row.
```dataview
TABLE WITHOUT ID
  work_mode AS "Where",
  length(rows) AS "Days",
  round(average(rows.focus), 1) AS "Avg focus",
  round(average(rows.energy), 1) AS "Avg energy"
FROM "01_Journal/Daily"
WHERE work_mode
GROUP BY work_mode
```
Group by a computed value, here the ISO week. Note the date format uses Luxon tokens (yyyy, kkkk, WW), not the moment tokens Obsidian uses elsewhere.
```dataview
TABLE WITHOUT ID
  week AS "Week",
  length(rows) AS "Days logged",
  round(average(rows.focus), 1) AS "Avg focus"
FROM "01_Journal/Daily"
WHERE focus
GROUP BY dateformat(file.day, "kkkk-'W'WW") AS week
SORT week DESC
```
By month:
```dataview
TABLE WITHOUT ID
  month AS "Month",
  length(rows) AS "Days",
  max(rows.energy) AS "Best energy"
FROM "01_Journal/Daily"
WHERE energy
GROUP BY dateformat(file.day, "yyyy-MM") AS month
SORT month DESC
```

## 7. FLATTEN: querying lines inside notes
The time log, tasks and wins are list items. `FLATTEN file.lists AS l` turns every list item into its own row, and then you filter on its fields.

Every time you were blocked, and by whom:
```dataview
TABLE WITHOUT ID
  file.link AS "Day", l.start AS "From", l.end AS "To", l.on AS "Waiting on"
FROM "01_Journal/Daily"
FLATTEN file.lists AS l
WHERE l.cat = "blocked"
SORT file.day DESC
LIMIT 8
```
How many blocks per category, across all days:
```dataview
TABLE WITHOUT ID cat AS "Category", length(rows) AS "Blocks"
FROM "01_Journal/Daily"
FLATTEN file.lists AS l
WHERE l.cat
GROUP BY l.cat AS cat
SORT length(rows) DESC
```
Minutes from start and end times. Times are text, so put them on a date first, subtract, and read the minutes:
```dataview
TABLE WITHOUT ID
  file.link AS "Day",
  l.cat AS "Category",
  (date("2000-01-01T" + l.end) - date("2000-01-01T" + l.start)).minutes AS "Minutes"
FROM "01_Journal/Daily"
FLATTEN file.lists AS l
WHERE l.cat = "meeting" AND l.start AND l.end
SORT file.day DESC
LIMIT 6
```
Estimate accuracy by task type. Inside a group after FLATTEN, the flattened item is `rows.t`:
```dataview
TABLE WITHOUT ID
  type AS "Type",
  length(rows) AS "Tasks",
  round(average(rows.t.est)) AS "Avg estimate (min)",
  round(average(rows.t.actual)) AS "Avg actual (min)",
  round(sum(rows.t.actual) / sum(rows.t.est), 2) AS "Actual ÷ estimate"
FROM "01_Journal/Daily"
FLATTEN file.tasks AS t
WHERE t.completed AND t.est AND t.actual
GROUP BY t.type AS type
SORT length(rows) DESC
```
Repeated tasks and the minutes they cost:
```dataview
TABLE WITHOUT ID
  task AS "Repeated task",
  length(rows) AS "Times",
  sum(rows.l.min) AS "Total minutes"
FROM "01_Journal/Daily"
FLATTEN file.lists AS l
WHERE l.repeat
GROUP BY l.repeat AS task
SORT sum(rows.l.min) DESC
```
Your wins, with proof:
```dataview
TABLE WITHOUT ID file.link AS "Day", l.win AS "Win", l.impact AS "Impact", l.proof AS "Proof"
FROM "01_Journal/Daily"
FLATTEN file.lists AS l
WHERE l.win
SORT file.day DESC
LIMIT 8
```

## 8. TASK queries
TASK returns real checkboxes you can tick from the results.

Open tasks from the last two weeks, excluding ones you are waiting on others for:
```dataview
TASK
FROM "01_Journal/Daily"
WHERE !completed AND file.day >= date(today) - dur(14 days) AND !waiting_on
```
The same, grouped by day:
```dataview
TASK
FROM "01_Journal/Daily"
WHERE !completed AND file.day >= date(today) - dur(14 days) AND !waiting_on
GROUP BY file.link
```
Waiting on somebody:
```dataview
TASK
FROM "01_Journal/Daily"
WHERE !completed AND waiting_on
```
Finished tasks that overran their estimate by 50% or more:
```dataview
TASK
FROM "01_Journal/Daily"
WHERE completed AND est AND actual AND actual >= est * 1.5
SORT file.day DESC
LIMIT 8
```
Finished tasks that have no proof yet:
```dataview
TASK
FROM "01_Journal/Daily"
WHERE completed AND !proof
SORT file.day DESC
LIMIT 8
```

## 9. CALENDAR
Each dot is a note on that day.
```dataview
CALENDAR file.day
FROM "01_Journal/Daily"
```
Only the days you scored focus 4 or better:
```dataview
CALENDAR file.day
FROM "01_Journal/Daily"
WHERE focus >= 4
```
Any date property works, for example when Permanent notes were written:
```dataview
CALENDAR created
FROM "05_Notes/Permanent"
```

## 10. Functions
Dates and durations:
```dataview
TABLE WITHOUT ID
  date(today) AS "date(today)",
  dateformat(date(today), "cccc d LLLL yyyy") AS "dateformat",
  date(today) - dur(7 days) AS "today minus 7 days",
  dur(1 hour 30 minutes) AS "dur",
  date(today).weekday AS "weekday number",
  date(2026-01-15) AS "date literal"
FROM "08_Meta/Work-Style"
WHERE file.name = "Config"
```
Text:
```dataview
TABLE WITHOUT ID
  upper("worklog") AS "upper",
  lower("WORKLOG") AS "lower",
  replace("a-b-c", "-", "+") AS "replace",
  regexreplace("task 42", "[0-9]+", "N") AS "regexreplace",
  split("deep-work", "-") AS "split",
  substring("worklog", 0, 4) AS "substring",
  padleft("7", 3, "0") AS "padleft",
  startswith("deep-work", "deep") AS "startswith",
  contains("Dataview", "view") AS "contains"
FROM "08_Meta/Work-Style"
WHERE file.name = "Config"
```
Numbers and lists:
```dataview
TABLE WITHOUT ID
  round(3.14159, 2) AS "round",
  sum([1, 2, 3]) AS "sum",
  average([2, 4, 9]) AS "average",
  max([4, 9, 2]) AS "max",
  sort([3, 1, 2]) AS "sort",
  reverse([1, 2, 3]) AS "reverse",
  unique([1, 1, 2]) AS "unique",
  length(["a", "b"]) AS "length",
  filter([1, 2, 3, 4], (x) => x > 2) AS "filter",
  map([1, 2, 3], (x) => x * 10) AS "map",
  any([1, 2], (x) => x > 1) AS "any",
  all([1, 2], (x) => x > 1) AS "all"
FROM "08_Meta/Work-Style"
WHERE file.name = "Config"
```
Conditions, defaults and types:
```dataview
TABLE WITHOUT ID
  choice(true, "yes", "no") AS "choice",
  default(null, "fallback") AS "default",
  typeof(date(today)) AS "typeof date",
  number("42") + 1 AS "number",
  string(42) + "!" AS "string",
  regextest("^a", "abc") AS "regextest",
  nonnull([null, 1, null, 2]) AS "nonnull"
FROM "08_Meta/Work-Style"
WHERE file.name = "Config"
```
Functions you can use in expressions, in one list: all, any, array, average, ceil, choice, contains, containsword, currencyformat, date, dateformat, default, display, dur, durationformat, econtains, elink, embed, endswith, extract, filter, firstvalue, flat, floor, hash, icontains, join, ldefault, length, link, list, localtime, lower, map, max, maxby, meta, min, minby, none, nonnull, number, object, padleft, padright, product, reduce, regexmatch, regexreplace, regextest, replace, reverse, round, slice, sort, split, startswith, string, striptime, substring, sum, trunc, truncate, typeof, unique, upper.

## 11. Inline queries
Inline queries sit inside a sentence and start with an equals sign in backticks. This note is called `= this.file.name`, today is `= dateformat(date(today), "cccc d LLLL yyyy")`, it has an owner: `= this.owner`, and today is `= choice(date(today).weekday >= 6, "a weekend day", "a working day")`.

Inline JavaScript starts with a dollar and equals. You have `$= dv.pages('"01_Journal/Daily"').length` daily notes, `$= dv.pages('"01_Journal/Reports"').length` reports and `$= dv.pages('"05_Notes/Permanent"').length` permanent notes.

## 12. DataviewJS
DataviewJS blocks run JavaScript with the `dv` object. Nothing appears unless you call a render method such as dv.table, dv.list, dv.taskList, dv.header, dv.paragraph, dv.span or dv.el.

**12.1 Pages, filter, sort, table** (the same as a TABLE query, but you control everything):
```dataviewjs
const rows = dv.pages('"01_Journal/Daily"')
  .where(p => p.login && p.file.day >= dv.luxon.DateTime.now().minus({ days: 10 }))
  .sort(p => p.file.day, "desc")
  .limit(6)
  .map(p => [p.file.link, p.login, p.logout, p.work_mode ?? "–"]);
dv.table(["Day", "In", "Out", "Where"], rows);
```
**12.2 Group by and count** (notes per folder):
```dataviewjs
const groups = dv.pages().groupBy(p => p.file.folder || "(vault root)");
dv.table(["Folder", "Notes"], groups.sort(g => g.rows.length, "desc").map(g => [g.key, g.rows.length]));
```
**12.3 Lists and headers**:
```dataviewjs
dv.header(4, "Work learning notes (with a skill property) not yet taught to anyone");
const debt = dv.pages('"05_Notes"').where(p => p.skill && p.taught !== true).sort(p => p.created, "asc");
debt.length ? dv.list(debt.map(p => p.file.link)) : dv.paragraph("Nothing to teach back. 🎉");
```
**12.4 Task lists** (open tasks with the day as a group):
```dataviewjs
const open = dv.pages('"01_Journal/Daily"').file.tasks.where(t => !t.completed && !t.waiting_on && t.text.trim() !== "").limit(12);
dv.taskList(open, true);
```
**12.5 Read the time log and compute minutes** (what the engine does under the hood):
```dataviewjs
const toMin = t => { const m = String(t).match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
const totals = {};
for (const p of dv.pages('"01_Journal/Daily"')) {
  for (const l of p.file.lists.where(l => l.start && l.end && l.cat)) {
    const min = toMin(l.end) - toMin(l.start);
    if (min > 0) totals[l.cat] = (totals[l.cat] || 0) + min;
  }
}
const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([cat, min]) => [cat, (min / 60).toFixed(1) + " h"]);
dv.table(["Category", "Time with explicit end"], rows);
```
**12.6 Custom HTML: a tiny bar chart** (dv.container is a real HTML element):
```dataviewjs
const counts = {};
for (const p of dv.pages('"01_Journal/Daily"').where(p => p.work_mode)) counts[p.work_mode] = (counts[p.work_mode] || 0) + 1;
const max = Math.max(1, ...Object.values(counts));
const box = dv.container.createEl("div");
for (const [k, v] of Object.entries(counts)) {
  const row = box.createEl("div"); row.style.cssText = "display:flex;align-items:center;gap:8px;margin:2px 0";
  row.createEl("span", { text: k }).style.width = "70px";
  const bar = row.createEl("div"); bar.style.cssText = "height:14px;border-radius:4px;background:var(--interactive-accent);width:" + (v / max * 220) + "px";
  row.createEl("span", { text: String(v) + " days" });
}
```
**12.7 Dates and durations with Luxon**:
```dataviewjs
const now = dv.luxon.DateTime.now();
dv.paragraph("Today is " + now.toFormat("cccc d LLLL yyyy") + ". This ISO week is " + now.toFormat("kkkk-'W'WW") + ". End of quarter is in " + Math.round(now.endOf("quarter").diff(now, "days").days) + " days.");
```
**12.8 Run a DQL query from JavaScript** (dv.execute renders it; dv.query returns the data so you can post-process it):
```dataviewjs
await dv.execute('TABLE focus, energy FROM "01_Journal/Daily" WHERE focus SORT file.day DESC LIMIT 3');
const res = await dv.query('TABLE focus FROM "01_Journal/Daily" WHERE focus');
if (res.successful) {
  const vals = res.value.values.map(r => r[1]);
  dv.paragraph("Average focus across all days: " + (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
}
```
**12.9 Call the insights engine** (the same engine behind Home and the reports; see the catalog below):
```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "last30", show: ["cards", "leaks"], h: 4 })
```

Other methods you can use: dv.page(path), dv.pagePaths(source), dv.current(), dv.array(list), dv.date(text), dv.duration(text), dv.fileLink(path, embed, label), dv.markdownTable / markdownList / markdownTaskList (return text instead of rendering), dv.io.load(path) / dv.io.csv(path) (read a file), dv.func.* (every function from section 10), dv.value.* (type checks and comparisons).

## 13. Build your own report
1. Copy any note from `01_Journal/Reports` (or create one from the T - Report template) and rename it.
2. Set its period property to one of: thisweek, thismonth, thisquarter, thisyear, last7, last14, last30, last90, last180, or a custom span such as 2026-09-01..2026-09-30.
3. Edit the show list in each block to pick sections (catalog below). Add your own dataview or dataviewjs blocks anywhere between them.
4. Export: Reading view, tab menu (three dots), **Export to PDF**.

A minimal report skeleton (the outer fence has four backticks so the inner blocks show as text):
````
---
type: report
period: last30
prepared_by: Your Name
---
# My report

```dataviewjs
await dv.view("08_Meta/Work-Style/views/insights", { range: "report", show: ["header", "cards", "leaks", "ledger"], limit: 20 })
```
````

## 14. Section catalog of the insights engine
Call: await dv.view("08_Meta/Work-Style/views/insights", { range: "...", show: ["...", "..."] }). Options: h (heading level), titles (false hides headings), limit (rows), weeks (chart length), months (trend length).

| Section | What it shows | Best ranges |
|---|---|---|
| header | Period, working days, date generated, prepared by | report |
| cards | KPI tiles: deep work, meetings, leaks, unlogged, interruptions, focus blocks, estimate accuracy, proof coverage, wins (with change vs the previous period) | any |
| chart | Weekly trend graph of deep work, time leaked, unlogged | any |
| timeline | Every activity and every gap, in order | day, today |
| categories | Time by category with bars | any |
| leaks | Time wasted, who caused it, biggest single leaks | any |
| blockers | Who or what costs you time | any |
| meetings | Meeting count, hours, outcome rate | any |
| days | One row per day | week, month |
| timesheet | Login, logout, lunch, net hours, target difference, evidence source, weekly totals | month |
| estimates | Accuracy per task type, corrections to apply, overruns and causes | last90, quarter |
| ledger | Every finished task with estimate, actual, start, finish and proof | week, month |
| repeats | Repeated work and whether a runbook exists | last90 |
| wins | Wins, impact and proof | any |
| proofs | Register of every proof link | last90, quarter |
| patterns | Best weekday and best hours for deep work | last30, last90 |
| learning | Learning notes, teach-backs, teach-back debt | month |
| skills | Skill level, target, evidence, staleness | any |
| projects | Active projects, deadlines, time logged | any |
| decisions | Recent decisions and reviews due | any |
| trend | Month-by-month improvement table | today, quarter, year |
| tasks | Open tasks | today |
| waiting | Tasks waiting on other people | today |
| checks | What to fix in your log | any |
| manager | Copy-and-send status message | week |
| project | Time and proof for the current project note | (in a project) |
| runbook | Usage stats for the current runbook note | (in a runbook) |
| evidence | Notes that link to the current skill note | (in a skill) |

Ranges: day, today, week, month, quarter, year (read from the note's own name, for example a weekly note called 2026-W38), last7, last14, last30, last90, last180, thisweek, thismonth, thisquarter, thisyear, report (read from the note's period property), custom (options from and to).

## 15. Gotchas
- **Date formats:** DQL dateformat and DataviewJS luxon use yyyy, dd, LLL, kkkk, WW. The moment tokens used by Templater and Periodic Notes are YYYY, DD, MMM, GGGG. Mixing them is the most common reason for wrong output.
- **file.day** exists only if the file name is a date, like a daily note. Use created or date properties for other notes.
- **Missing values:** WHERE x drops notes where x is empty. Use default(x, 0) when you want to keep them.
- **Times are text:** 09:20 is stored as the text "09:20". Compute minutes in DataviewJS, or put the time on a date as in section 7. If a property such as login ever shows as a number like 542 (some setups read 09:02 in a property as minutes), put quotes around it in the property.
- **Field names:** keys are case-insensitive in queries; spaces become hyphens. A field called waiting_on is read as waiting_on. Keep one spelling everywhere.
- **Lines vs pages:** a field in square brackets on a list line belongs to that line. A field on its own paragraph line belongs to the page.
- **Nothing shows up?** Dataview needs Reading or Live Preview mode, an indexed vault (wait a few seconds after opening) and, for DataviewJS, the "Enable JavaScript Queries" setting on.
- **Confidentiality:** queries only read your vault. If you export a report to PDF, check it before sending it outside.

/* ============================================================================
   WORK STYLE INSIGHTS ENGINE
   Used by the Work dashboard, the journal notes (Daily to Yearly), the reports, and Project,
   Runbook, Skill and Person notes.

   Call from any note:
     await dv.view("08_Meta/Work-Style/views/insights", { range: "week", show: ["cards", "categories"] })

   range:  day | today | week | month | quarter | year
           last7 | last14 | last30 | last90 | last180
           thisweek | thismonth | thisquarter | thisyear
           ("day/week/month/quarter/year" read the period from the note's own file name)

           report  = reads the period from the note's own "period" property, e.g. thisweek, thismonth,
                     thisquarter, last30 ... or a custom span like 2026-09-01..2026-09-30
           custom  = uses opts.from and opts.to (YYYY-MM-DD)

   show:   header, cards, chart, timeline, categories, leaks, blockers, meetings, days, timesheet,
           estimates, ledger, repeats, wins, proofs, patterns, learning, skills, projects,
           decisions, trend, tasks, waiting, checks, manager, project, runbook, evidence, person

   Extra options: h (heading level, default 3), titles:false, limit, months, weeks, days

   Tweak thresholds and folder names in 08_Meta/Work-Style/Config.md.
   Projects, skills, decisions and learning notes are found by their "type" property (project, skill,
   decision, permanent, literature), so they can live in any folder. Daily notes, runbooks and people
   are found by folder (see the F block below).
   ============================================================================ */

const F = { daily: "01_Journal/Daily", runbooks: "04_Resources/Runbooks", people: "06_People", notes: "05_Notes",
            config: "08_Meta/Work-Style/Config" };

const opts = input || {};
const DT = dv.luxon.DateTime;
const A = x => (x == null ? [] : (typeof x.array === "function" ? x.array() : Array.from(x)));
const isNum = v => typeof v === "number" && isFinite(v);
const sum = arr => arr.reduce((s, x) => s + x, 0);
const avg = arr => (arr.length ? sum(arr) / arr.length : 0);
const median = arr => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/* ---------- config ---------- */
const cfgPage = dv.page(F.config) || {};
for (const [k, key] of [["daily", "folder_daily"], ["runbooks", "folder_runbooks"], ["people", "folder_people"], ["notes", "folder_notes"]]) {
  if (cfgPage[key] != null && String(cfgPage[key]).trim()) F[k] = String(cfgPage[key]).trim().replace(/\/+$/, "");
}
const num = (v, d) => (isNum(v) ? v : d);
const lst = (v, d) => (v == null ? d : A(Array.isArray(v) ? v : v).map(s => String(s).toLowerCase().trim()));
const CFG = {
  value:    lst(cfgPage.value_cats,    ["deep-work", "learning"]),
  overhead: lst(cfgPage.overhead_cats, ["meeting", "admin"]),
  leak:     lst(cfgPage.leak_cats,     ["blocked", "interruption", "rework", "drift"]),
  external: lst(cfgPage.external_leak_cats, ["blocked", "interruption"]),
  rest:     lst(cfgPage.rest_cats,     ["break", "lunch"]),
  deepTarget:   num(cfgPage.deep_work_target_pct, 50),
  unacctAlert:  num(cfgPage.unaccounted_alert_min, 30),
  estTol:       num(cfgPage.est_ok_tolerance_pct, 25),
  overrun:      num(cfgPage.overrun_ratio, 1.5),
  runbookAfter: num(cfgPage.runbook_after_repeats, 2),
  proofTarget:  num(cfgPage.proof_target_pct, 80),
  staleDays:    num(cfgPage.skill_stale_days, 45),
  teachDebtDays:num(cfgPage.teach_back_days, 14),
  workday:      num(cfgPage.workday_target_min, 480),
  offTypes:     lst(cfgPage.off_day_types, ["leave", "holiday", "sick", "off"]),
};
const ICON = { "deep-work": "🧠", meeting: "📅", admin: "🗂️", learning: "📚", break: "☕", lunch: "🍽️",
               blocked: "⛔", interruption: "⚡", rework: "🔁", drift: "🌀", unaccounted: "❓", other: "▫️" };
const ic = c => (ICON[c] || "▫️") + " " + c;
const kindOf = c => CFG.value.includes(c) ? "value" : CFG.overhead.includes(c) ? "overhead" : CFG.leak.includes(c) ? "leak" : CFG.rest.includes(c) ? "rest" : c === "unaccounted" ? "leak" : "other";

const lc = v => String(v == null ? "" : v).toLowerCase().trim();
const byType = (...types) => A(dv.pages()).filter(p => types.includes(lc(p.type)));
const LEVELS = { beginner: 1, "advanced beginner": 2, "advanced-beginner": 2, competent: 3, proficient: 4, expert: 5 };
const levelNum = v => { if (v == null || v === "") return 0; if (typeof v === "number") return v; const k = lc(v); return LEVELS[k] != null ? LEVELS[k] : (parseFloat(k) || 0); };
const secName = l => (l && l.section && l.section.subpath ? String(l.section.subpath).toLowerCase() : "");
// "work learning notes" = permanent / literature notes that carry a skill property (opt-in, so personal notes are never counted)
const learningNotes = () => byType("permanent", "literature", "learning").filter(p => p.skill != null && nameOf(p.skill) !== "");
let PEOPLE = null;
function personLink(text) {      // "Sam (DB access)" -> link to 06_People/Sam ... if such a person note exists
  if (!text) return "";
  if (!PEOPLE) PEOPLE = A(dv.pages('"' + F.people + '"')).map(p => ({ n: p.file.name.toLowerCase(), p }));
  const m = String(text).match(/^\s*([^(]*?)\s*(\(.*\))?\s*$/); const base = (m ? m[1] : String(text)).toLowerCase(), rest = m && m[2] ? " " + m[2] : "";
  let hit = PEOPLE.find(x => x.n === base); if (!hit) { const c = PEOPLE.filter(x => x.n.startsWith(base + " ")); if (c.length === 1) hit = c[0]; }
  return hit ? "[[" + hit.p.file.path.replace(/\.md$/, "") + "|" + hit.p.file.name + "]]" + rest : String(text);
}

/* ---------- formatting ---------- */
const hhmm = m => (m == null || !isFinite(m)) ? "–" : String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(Math.round(m % 60)).padStart(2, "0");
const mins = m => { m = Math.round(m || 0); return m >= 60 ? Math.floor(m / 60) + "h " + String(m % 60).padStart(2, "0") + "m" : m + "m"; };
const hrs = m => ((m || 0) / 60).toFixed(1) + "h";
const pct0 = x => Math.round(x || 0) + "%";
const bar = (p, n = 10) => { const k = Math.round(clamp(p || 0, 0, 100) / 100 * n); return "█".repeat(k) + "░".repeat(n - k); };
const dots = (lvl, max = 5) => "●".repeat(clamp(Math.round(lvl || 0), 0, max)) + "○".repeat(max - clamp(Math.round(lvl || 0), 0, max));
const toneColor = t => t === "good" ? "var(--color-green)" : t === "warn" ? "var(--color-orange)" : t === "bad" ? "var(--color-red)" : "var(--background-modifier-border)";
const toneHigh = (v, target) => v >= target ? "good" : v >= target * 0.7 ? "warn" : "bad";
const toneLow = (v, good, bad) => v <= good ? "good" : v <= bad ? "warn" : "bad";
const cleanText = t => String(t == null ? "" : t).replace(/\[[A-Za-z_][\w-]*::[^\]]*\]/g, "").replace(/\([A-Za-z_][\w-]*::[^)]*\)/g, "").replace(/\s+/g, " ").trim();
const nameOf = v => { if (v == null) return ""; if (v.path) return String(v.path).split("/").pop().replace(/\.md$/, ""); return String(v).replace(/\[\[|\]\]/g, "").split("|")[0].trim(); };

const toMin = v => {
  if (v == null || v === "") return null;
  if (isNum(v)) return v >= 0 && v < 1440 ? v : null;             // YAML can read 09:02 as 542 (= minutes already)
  if (typeof v === "object" && v.hour !== undefined && v.minute !== undefined) return v.hour * 60 + v.minute;   // luxon DateTime
  if (typeof v === "object" && v.hours !== undefined) return v.hours * 60 + (v.minutes || 0);                    // luxon Duration
  const m = String(v).match(/^\s*(\d{1,2}):(\d{2})/);
  return m ? (+m[1]) * 60 + (+m[2]) : null;
};
const dateOf = v => { if (!v) return null; if (v.toISODate) return v; if (typeof v === "string") { const d = DT.fromISO(v.slice(0, 10)); return d.isValid ? d : null; } return null; };

/* ---------- time / ranges ---------- */
const now = DT.now();
const today = now.startOf("day");
const todayISO = today.toISODate();
const nowMin = now.hour * 60 + now.minute;
const cur = dv.current();
const curName = cur && cur.file ? cur.file.name : "";

const pageDay = p => {
  if (!p || !p.file) return null;
  if (p.file.day && p.file.day.toISODate) return p.file.day.startOf("day");
  const m = String(p.file.name).match(/^\d{4}-\d{2}-\d{2}/);
  if (m) { const d = DT.fromISO(m[0]); return d.isValid ? d : null; }
  return null;
};
const pageDate = p => pageDay(p) || dateOf(p.created) || dateOf(p.date) || (p.file && p.file.mtime && p.file.mtime.toISODate ? p.file.mtime : null);

function mkRange(s, e, key) {
  s = s.startOf("day"); e = e.startOf("day");
  const sameYear = s.year === e.year;
  const label = s.equals(e) ? s.toFormat("ccc d LLL yyyy")
    : (sameYear ? s.toFormat("d LLL") : s.toFormat("d LLL yyyy")) + " – " + e.toFormat("d LLL yyyy");
  return { key, s, e, sISO: s.toISODate(), eISO: e.toISODate(), days: Math.round(e.diff(s, "days").days) + 1, label };
}
function resolveRange(key, depth = 0) {
  const k = String(key || "day");
  const curDay = pageDay(cur);
  let m;
  if (k === "report") {
    const per = String(cur && cur.period != null ? cur.period : "thisweek").trim();
    const c = per.match(/^(\d{4}-\d{2}-\d{2})\s*(?:\.\.|to|–)\s*(\d{4}-\d{2}-\d{2})$/i);
    if (c) return mkRange(DT.fromISO(c[1]), DT.fromISO(c[2]), "custom");
    return depth > 0 || per === "report" ? mkRange(today.startOf("week"), today.startOf("week").plus({ days: 6 }), "thisweek") : resolveRange(per, depth + 1);
  }
  if (k === "custom") { const a = DT.fromISO(String(opts.from || todayISO)), b = DT.fromISO(String(opts.to || opts.from || todayISO)); return mkRange(a.isValid ? a : today, b.isValid ? b : today, "custom"); }
  if (k === "day") return mkRange(curDay || today, curDay || today, k);
  if (k === "today") return mkRange(today, today, k);
  if (k === "week") {
    const ws = cur && cur.week_start ? dateOf(cur.week_start) : null;
    const s = ws ? ws.startOf("day") : (m = curName.match(/^(\d{4})-W(\d{2})$/i)) ? DT.fromObject({ weekYear: +m[1], weekNumber: +m[2], weekday: 1 }) : (curDay || today).startOf("week");
    return mkRange(s, s.plus({ days: 6 }), k);
  }
  if (k === "month") {
    const s = (m = curName.match(/^(\d{4})-(\d{2})$/)) ? DT.fromObject({ year: +m[1], month: +m[2], day: 1 }) : (curDay || today).startOf("month");
    return mkRange(s, s.plus({ months: 1 }).minus({ days: 1 }), k);
  }
  if (k === "quarter") {
    const s = (m = curName.match(/^(\d{4})-Q([1-4])$/i)) ? DT.fromObject({ year: +m[1], month: (+m[2] - 1) * 3 + 1, day: 1 }) : (curDay || today).startOf("quarter");
    return mkRange(s, s.plus({ months: 3 }).minus({ days: 1 }), k);
  }
  if (k === "year") {
    const s = (m = curName.match(/^(\d{4})$/)) ? DT.fromObject({ year: +m[1], month: 1, day: 1 }) : (curDay || today).startOf("year");
    return mkRange(s, s.plus({ years: 1 }).minus({ days: 1 }), k);
  }
  if (k === "thisweek")    { const s = today.startOf("week");    return mkRange(s, s.plus({ days: 6 }), k); }
  if (k === "thismonth")   { const s = today.startOf("month");   return mkRange(s, s.plus({ months: 1 }).minus({ days: 1 }), k); }
  if (k === "thisquarter") { const s = today.startOf("quarter"); return mkRange(s, s.plus({ months: 3 }).minus({ days: 1 }), k); }
  if (k === "thisyear")    { const s = today.startOf("year");    return mkRange(s, s.plus({ years: 1 }).minus({ days: 1 }), k); }
  if ((m = k.match(/^last(\d+)$/))) { const n = +m[1]; return mkRange(today.minus({ days: n - 1 }), today, k); }
  return mkRange(today, today, "today");
}
function prevOf(r) {
  const k = r.key; let m;
  if (r.days <= 1) return null;
  if (k === "week" || k === "thisweek") return mkRange(r.s.minus({ days: 7 }), r.e.minus({ days: 7 }), "prev");
  if (k === "month" || k === "thismonth") { const s = r.s.minus({ months: 1 }); return mkRange(s, s.plus({ months: 1 }).minus({ days: 1 }), "prev"); }
  if (k === "quarter" || k === "thisquarter") { const s = r.s.minus({ months: 3 }); return mkRange(s, s.plus({ months: 3 }).minus({ days: 1 }), "prev"); }
  if (k === "year" || k === "thisyear") { const s = r.s.minus({ years: 1 }); return mkRange(s, s.plus({ years: 1 }).minus({ days: 1 }), "prev"); }
  if ((m = k.match(/^last(\d+)$/))) { const n = +m[1]; return mkRange(r.s.minus({ days: n }), r.e.minus({ days: n }), "prev"); }
  if (k === "custom") return mkRange(r.s.minus({ days: r.days }), r.s.minus({ days: 1 }), "prev");
  return null;
}
let OFF = null;   // ISO dates marked day_type: leave / holiday / sick / off in the daily note
function offDays() {
  if (!OFF) OFF = new Set(ALL_DAILY.filter(x => CFG.offTypes.includes(String(x.p.day_type == null ? "" : x.p.day_type).toLowerCase().trim())).map(x => x.d.toISODate()));
  return OFF;
}
function workdaysIn(r) {
  let n = 0, off = 0; const end = r.e < today ? r.e : today; const O = offDays();
  for (let d = r.s; d <= end; d = d.plus({ days: 1 })) if (d.weekday <= 5) { if (O.has(d.toISODate())) off++; else n++; }
  return { n, off };
}

/* ---------- data: one analysed object per daily note ---------- */
const ALL_DAILY = A(dv.pages('"' + F.daily + '"')).map(p => ({ p, d: pageDay(p) })).filter(x => x.d)
  .sort((a, b) => a.d.toMillis() - b.d.toMillis());

function analyzeDay(p, d) {
  const iso = d.toISODate();
  const isToday = iso === todayISO;
  const items = A(p.file.lists);
  const flags = [];

  let ents = items.filter(l => l.start != null && String(l.start) !== "").map(l => ({
    start: toMin(l.start), end: toMin(l.end), cat: String(l.cat == null ? "other" : l.cat).toLowerCase().trim() || "other",
    text: cleanText(l.text), on: l.on == null ? "" : nameOf(l.on), outcome: l.outcome == null ? "" : String(l.outcome).toLowerCase(),
    proof: l.proof == null ? "" : String(l.proof), project: l.project == null ? "" : nameOf(l.project),
    ticket: l.ticket == null ? "" : String(l.ticket).trim()
  })).filter(e => e.start != null).sort((a, b) => a.start - b.start);

  let login = toMin(p.login), logout = toMin(p.logout);
  const openEnd = logout != null ? logout : (isToday ? nowMin : null);
  for (let i = 0; i < ents.length; i++) {
    const e = ents[i];
    if (e.end == null) {
      const nx = ents[i + 1];
      e.end = nx ? nx.start : openEnd;
      if (e.end == null) { e.end = e.start; flags.push("open block from " + hhmm(e.start) + " has no end and no logout"); }
    }
    e.min = e.end - e.start;
    if (e.min < 0) { flags.push("end before start (" + hhmm(e.start) + "–" + hhmm(e.end) + ")"); e.min = 0; }
  }
  const firstStart = ents.length ? ents[0].start : null;
  const lastEnd = ents.length ? Math.max(...ents.map(e => e.end)) : null;
  if (login == null && firstStart != null) { login = firstStart; flags.push("no login time (using first activity)"); }
  if (login != null && firstStart != null && firstStart < login) login = firstStart;
  if (logout == null && lastEnd != null) {
    if (isToday) logout = Math.max(nowMin, lastEnd); else { logout = lastEnd; flags.push("no logout time (using last activity)"); }
  }
  if (logout != null && lastEnd != null && lastEnd > logout) logout = lastEnd;

  const span = (login != null && logout != null && logout > login) ? logout - login : 0;
  const byCat = {};
  ents.forEach(e => { byCat[e.cat] = (byCat[e.cat] || 0) + e.min; });
  let lunch = byCat["lunch"] || 0;
  if (!lunch && isNum(p.lunch_min)) lunch = p.lunch_min;
  const logged = sum(ents.filter(e => e.cat !== "lunch").map(e => e.min));
  const workable = Math.max(0, span - lunch);
  const unaccounted = Math.max(0, workable - logged);
  if (span > 0 && logged > workable + 5) flags.push("logged time exceeds the day (overlapping blocks?)");
  if (unaccounted > CFG.unacctAlert) flags.push(mins(unaccounted) + " unlogged");

  // gaps (explicit ends or stop/start breaks) for the timeline
  const gaps = []; let cursor = login;
  for (const e of ents) { if (cursor != null && e.start - cursor >= 3) gaps.push({ s: cursor, e: e.start }); cursor = Math.max(cursor == null ? 0 : cursor, e.end); }
  if (cursor != null && logout != null && logout - cursor >= 3) gaps.push({ s: cursor, e: logout });

  const tasks = A(p.file.tasks).map(t => ({
    completed: !!t.completed, text: cleanText(t.text), est: t.est, actual: t.actual, type: String(t.type == null ? "other" : t.type).toLowerCase(),
    cause: t.cause == null ? "" : String(t.cause), proof: t.proof == null ? "" : String(t.proof), project: t.project == null ? "" : nameOf(t.project),
    ticket: t.ticket == null ? "" : String(t.ticket).trim(),
    waiting_on: t.waiting_on == null ? "" : nameOf(t.waiting_on), since: dateOf(t.since), iso, day: d, page: p
  })).filter(t => t.text);

  return { iso, day: d, page: p, ents, byCat, login, logout, span, lunch, workable, logged, unaccounted, gaps, flags, items, tasks,
           hasData: ents.length > 0 || span > 0 };
}
const DAY_CACHE = new Map();
const analysed = x => { const k = x.p.file.path; if (!DAY_CACHE.has(k)) DAY_CACHE.set(k, analyzeDay(x.p, x.d)); return DAY_CACHE.get(k); };

function aggregate(days) {
  const a = { n: 0, span: 0, workable: 0, logged: 0, unacct: 0, byCat: {}, ents: [], interr: 0, focus: 0, longest: 0,
              meet: { n: 0, min: 0, yes: 0, no: 0 } };
  for (const d of days) {
    if (!d.hasData) continue;
    a.n++; a.span += d.span; a.workable += d.workable; a.logged += d.logged; a.unacct += d.unaccounted;
    for (const [c, m] of Object.entries(d.byCat)) a.byCat[c] = (a.byCat[c] || 0) + m;
    for (const e of d.ents) {
      const x = Object.assign({ iso: d.iso, page: d.page }, e); a.ents.push(x);
      if (e.cat === "interruption") a.interr++;
      if (e.cat === "deep-work") { if (e.min >= 60) a.focus++; a.longest = Math.max(a.longest, e.min); }
      if (e.cat === "meeting") { a.meet.n++; a.meet.min += e.min; if (["yes", "y", "true"].includes(e.outcome)) a.meet.yes++; else if (["no", "n", "false"].includes(e.outcome)) a.meet.no++; }
    }
  }
  const sc = list => sum(list.map(c => a.byCat[c] || 0));
  a.deep = sc(CFG.value); a.over = sc(CFG.overhead); a.ext = sc(CFG.external);
  a.own = sc(CFG.leak) - a.ext + a.unacct; a.leak = a.ext + a.own;
  a.deepPct = a.workable ? a.deep / a.workable * 100 : 0;
  a.leakPct = a.workable ? a.leak / a.workable * 100 : 0;
  a.unacctPerDay = a.n ? a.unacct / a.n : 0;
  return a;
}
// Time-log lines and tasks that share a ticket id give every task an automatic "actual", start and finish.
let TI = null;
function ticketInfo() {
  if (TI) return TI; TI = new Map();
  for (const x of ALL_DAILY) for (const e of analysed(x).ents) {
    if (!e.ticket) continue; const k = e.ticket.toLowerCase();
    const v = TI.get(k) || { min: 0, days: new Set(), first: null, last: null, text: e.text };
    v.min += e.min; v.days.add(x.d.toISODate());
    const f = x.d.toISODate() + " " + hhmm(e.start), l = x.d.toISODate() + " " + hhmm(e.end);
    if (!v.first || f < v.first.k) v.first = { k: f, iso: x.d.toISODate(), t: e.start };
    if (!v.last || l > v.last.k) v.last = { k: l, iso: x.d.toISODate(), t: e.end };
    TI.set(k, v);
  }
  return TI;
}
const effActual = t => isNum(t.actual) ? t.actual : (t.ticket && ticketInfo().has(t.ticket.toLowerCase()) ? ticketInfo().get(t.ticket.toLowerCase()).min : null);
const estRows = tasks => tasks.map(t => Object.assign({}, t, { actual: effActual(t) })).filter(t => t.completed && isNum(t.est) && t.est > 0 && isNum(t.actual) && t.actual > 0);
function estStats(rows) {
  if (!rows.length) return null;
  const errs = rows.map(r => Math.abs(r.actual - r.est) / r.est * 100);
  const within = errs.filter(e => e <= CFG.estTol).length;
  return { n: rows.length, within, withinPct: within / rows.length * 100, mape: avg(errs), med: median(rows.map(r => r.actual / r.est)),
           est: sum(rows.map(r => r.est)), actual: sum(rows.map(r => r.actual)) };
}
const PCACHE = new Map();
function periodData(r) {
  const key = r.sISO + "|" + r.eISO;
  if (PCACHE.has(key)) return PCACHE.get(key);
  const days = ALL_DAILY.filter(x => { const i = x.d.toISODate(); return i >= r.sISO && i <= r.eISO; }).map(analysed);
  const agg = aggregate(days);
  const tasks = days.flatMap(d => d.tasks);
  const items = days.flatMap(d => d.items.map(l => ({ l, iso: d.iso, day: d.day, page: d.page })));
  const out = { r, days, agg, tasks, items, est: estStats(estRows(tasks)) };
  PCACHE.set(key, out); return out;
}

/* ---------- rendering helpers ---------- */
const HL = opts.h || 3;
const hd = t => { if (opts.titles !== false) dv.header(HL, t); };
const say = t => dv.paragraph("_" + t + "_");
const dlink = (iso, text) => { const x = ALL_DAILY.find(z => z.d.toISODate() === iso); return x ? dv.fileLink(x.p.file.path, false, text || DT.fromISO(iso).toFormat("ccc d LLL")) : (text || iso); };
const LIM = opts.limit || 10;

function renderCards(cards) {
  const grid = dv.container.createEl("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:6px 0 14px";
  for (const c of cards) {
    const box = grid.createEl("div");
    box.style.cssText = "border:1px solid var(--background-modifier-border);border-left:5px solid " + toneColor(c.tone) + ";background:var(--background-secondary);border-radius:8px;padding:8px 10px";
    const l = box.createEl("div", { text: c.label }); l.style.cssText = "font-size:0.72em;opacity:.7;text-transform:uppercase;letter-spacing:.05em";
    const v = box.createEl("div", { text: String(c.value) }); v.style.cssText = "font-size:1.45em;font-weight:700;line-height:1.25";
    if (c.sub) { const s = box.createEl("div", { text: c.sub }); s.style.cssText = "font-size:0.75em;opacity:.75"; }
  }
}
const deltaTxt = (cur, prev, unit, goodUp) => {
  if (prev == null || !isFinite(prev)) return "";
  const d = cur - prev; if (Math.abs(d) < 0.5) return " · = prev";
  const arrow = d > 0 ? "▲" : "▼"; const good = goodUp ? d > 0 : d < 0;
  return " · " + arrow + " " + Math.abs(Math.round(d)) + unit + " vs prev " + (good ? "✓" : "");
};

/* ============================ SECTIONS ============================ */
const S = {};

S.cards = (P, PP, R) => {
  const a = P.agg;
  if (!a.n) return say("No time logged in this period yet. Stamp your login (Alt+Shift+I) and start an activity (Alt+Shift+S).");
  const cards = [];
  const proofTasks = P.tasks.filter(t => t.completed);
  const withProof = proofTasks.filter(t => t.proof).length;
  const proofPct = proofTasks.length ? withProof / proofTasks.length * 100 : null;
  if (R.days === 1) {
    const d = P.days[0];
    cards.push({ label: "In → Out", value: hhmm(d.login) + " → " + hhmm(d.logout), sub: hrs(d.span) + " on the clock" });
    cards.push({ label: "Deep work", value: pct0(a.deepPct), sub: hrs(a.deep) + " · target " + CFG.deepTarget + "%", tone: toneHigh(a.deepPct, CFG.deepTarget) });
    cards.push({ label: "Meetings", value: hrs(a.meet.min), sub: a.meet.n + " meeting" + (a.meet.n === 1 ? "" : "s") });
    cards.push({ label: "Time leaked", value: hrs(a.leak), sub: "others " + mins(a.ext) + " · me " + mins(a.own), tone: toneLow(a.leakPct, 10, 25) });
    cards.push({ label: "Unlogged", value: mins(a.unacct), sub: "not in the time log", tone: toneLow(a.unacct, 15, CFG.unacctAlert) });
    cards.push({ label: "Interruptions", value: a.interr, sub: "logged today", tone: toneLow(a.interr, 3, 6) });
    cards.push({ label: "Focus blocks", value: a.focus, sub: "≥60 min · longest " + mins(a.longest), tone: a.focus >= 1 ? "good" : "warn" });
    cards.push({ label: "Tasks done", value: proofTasks.length, sub: proofPct == null ? "" : pct0(proofPct) + " with proof", tone: proofPct == null ? "" : toneHigh(proofPct, CFG.proofTarget) });
  } else {
    const { n: wd, off: offN } = workdaysIn(R);
    const pa = PP && PP.agg.n ? PP.agg : null;
    cards.push({ label: "Days logged", value: a.n + " / " + wd, sub: "working days so far" + (offN ? " · " + offN + " off" : ""), tone: wd ? toneHigh(a.n / wd * 100, 90) : "" });
    cards.push({ label: "Avg day", value: hrs(a.span / a.n), sub: "login → logout" });
    cards.push({ label: "Deep work", value: pct0(a.deepPct), sub: hrs(a.deep) + " · target " + CFG.deepTarget + "%" + deltaTxt(a.deepPct, pa && pa.deepPct, " pts", true), tone: toneHigh(a.deepPct, CFG.deepTarget) });
    cards.push({ label: "Meetings", value: hrs(a.meet.min), sub: a.meet.n + (a.meet.n === 1 ? " meeting" : " meetings") + (a.meet.yes + a.meet.no ? " · " + pct0(a.meet.no / (a.meet.yes + a.meet.no) * 100) + " no outcome" : "") });
    cards.push({ label: "Time leaked", value: pct0(a.leakPct), sub: hrs(a.leak) + " · others " + hrs(a.ext) + " / me " + hrs(a.own) + deltaTxt(a.leakPct, pa && pa.leakPct, " pts", false), tone: toneLow(a.leakPct, 10, 25) });
    cards.push({ label: "Unlogged / day", value: mins(a.unacctPerDay), sub: "total " + hrs(a.unacct) + deltaTxt(a.unacctPerDay, pa && pa.unacctPerDay, " min", false), tone: toneLow(a.unacctPerDay, 15, CFG.unacctAlert) });
    cards.push({ label: "Interruptions", value: a.interr, sub: (a.interr / a.n).toFixed(1) + " per day", tone: toneLow(a.interr / a.n, 3, 6) });
    cards.push({ label: "Focus blocks", value: a.focus, sub: "≥60 min · longest " + mins(a.longest), tone: a.focus / a.n >= 0.5 ? "good" : "warn" });
    cards.push({ label: "Estimate accuracy", value: P.est ? pct0(P.est.withinPct) : "–", sub: P.est ? P.est.n + " tasks within ±" + CFG.estTol + "%" : "log est + actual on tasks", tone: P.est ? toneHigh(P.est.withinPct, 70) : "" });
    cards.push({ label: "Proof coverage", value: proofPct == null ? "–" : pct0(proofPct), sub: withProof + " of " + proofTasks.length + " done tasks", tone: proofPct == null ? "" : toneHigh(proofPct, CFG.proofTarget) });
    cards.push({ label: "Wins logged", value: P.items.filter(x => x.l.win != null).length, sub: "in this period" });
  }
  renderCards(cards);
};

S.timeline = (P) => {
  hd("Timeline");
  if (!P.days.length || !P.days[0].hasData) return say("Nothing logged yet.");
  const d = P.days[0]; const rows = [];
  const seq = [];
  d.ents.forEach(e => seq.push({ t: e.start, kind: "e", e }));
  d.gaps.forEach(g => seq.push({ t: g.s, kind: "g", g }));
  seq.sort((x, y) => x.t - y.t);
  for (const x of seq) {
    if (x.kind === "e") { const e = x.e;
      rows.push([hhmm(e.start), hhmm(e.end), mins(e.min), ic(e.cat), [e.text, e.project ? "· " + e.project : "", e.on ? "· on " + e.on : ""].filter(Boolean).join(" "), e.proof || ""]);
    } else rows.push([hhmm(x.g.s), hhmm(x.g.e), mins(x.g.e - x.g.s), "❓ unlogged", "_gap: nothing recorded_", ""]);
  }
  dv.table(["From", "To", "Length", "Category", "What", "Proof"], rows);
  if (d.flags.length) dv.paragraph("⚠️ " + d.flags.join(" · "));
};

S.categories = (P) => {
  hd("Where the time went");
  const a = P.agg; if (!a.n) return say("Nothing logged yet.");
  const cats = Object.entries(a.byCat).map(([c, m]) => [c, m]);
  if (a.unacct > 0) cats.push(["unaccounted", a.unacct]);
  cats.sort((x, y) => y[1] - x[1]);
  const rows = cats.map(([c, m]) => { const p = c === "lunch" ? null : (a.workable ? m / a.workable * 100 : 0);
    return [ic(c), mins(m), p == null ? "—" : pct0(p), p == null ? "" : bar(p, 12), kindOf(c)]; });
  dv.table(["Category", "Time", "% of working time", "", "Type"], rows);
};

S.leaks = (P) => {
  hd("Time wasted — where it leaked");
  const a = P.agg; if (!a.n) return say("Nothing logged yet.");
  const rows = [];
  for (const c of CFG.leak) {
    const m = a.byCat[c] || 0; if (!m) continue;
    const n = a.ents.filter(e => e.cat === c).length;
    rows.push([ic(c), CFG.external.includes(c) ? "others / system" : "me (fixable)", n, mins(m), mins(m / a.n) + "/day", a.workable ? pct0(m / a.workable * 100) : ""]);
  }
  if (a.unacct > 0) rows.push([ic("unaccounted"), "me (log more)", P.days.filter(d => d.unaccounted > 0).length + " days", mins(a.unacct), mins(a.unacct / a.n) + "/day", pct0(a.unacct / a.workable * 100)]);
  if (!rows.length) { say("No leaks recorded. Either it was a very clean stretch, or activities need honest categories (blocked, interruption, rework, drift)."); }
  else dv.table(["Leak", "Caused by", "Times", "Total", "Average", "% of day"], rows);
  dv.paragraph("**Outside my control** (waiting, interrupted): " + hrs(a.ext) + "  ·  **Within my control** (rework, drift, unlogged): " + hrs(a.own) + "  ·  **Total leaking:** " + pct0(a.leakPct) + " of working time");
  const worst = a.ents.filter(e => CFG.leak.includes(e.cat)).sort((x, y) => y.min - x.min).slice(0, LIM);
  if (worst.length) {
    dv.header(HL + 1, "Biggest single leaks");
    dv.table(["Day", "When", "Type", "Length", "What", "On / because of"], worst.map(e => [dlink(e.iso), hhmm(e.start) + "–" + hhmm(e.end), ic(e.cat), mins(e.min), e.text, personLink(e.on)]));
  }
};

S.blockers = (P) => {
  hd("Who / what is costing me time");
  const ex = P.agg.ents.filter(e => CFG.external.includes(e.cat));
  if (!ex.length) return say("No blocked or interrupted time logged.");
  const g = new Map();
  for (const e of ex) { const k = e.cat + "|" + (e.on || "(not specified)"); const v = g.get(k) || { cat: e.cat, on: e.on || "(not specified)", n: 0, m: 0, max: 0, last: "" };
    v.n++; v.m += e.min; v.max = Math.max(v.max, e.min); if (e.iso > v.last) v.last = e.iso; g.set(k, v); }
  const rows = [...g.values()].sort((x, y) => y.m - x.m).map(v => [personLink(v.on), ic(v.cat), v.n, mins(v.m), mins(v.max), dlink(v.last)]);
  dv.table(["Who / what", "Type", "Times", "Total", "Longest", "Last time"], rows);
  if (ex.some(e => !e.on)) say("Tip: add [on:: name or system] to blocked and interruption lines so this table can name the cause.");
};

S.meetings = (P) => {
  hd("Meetings");
  const m = P.agg.meet; if (!m.n) return say("No meetings logged.");
  const rated = m.yes + m.no;
  dv.paragraph("**" + m.n + "** meetings · **" + hrs(m.min) + "** · with clear outcome: **" + m.yes + "** · without: **" + m.no + "**" + (m.n - rated ? " · not rated: " + (m.n - rated) : "") + (rated ? " → " + pct0(m.no / rated * 100) + " of rated meetings had no outcome" : ""));
  const no = P.agg.ents.filter(e => e.cat === "meeting" && ["no", "n", "false"].includes(e.outcome)).sort((x, y) => y.min - x.min).slice(0, LIM);
  if (no.length) dv.table(["Day", "Meeting with no outcome", "Length"], no.map(e => [dlink(e.iso), e.text, mins(e.min)]));
};

S.days = (P) => {
  hd("Day by day");
  const days = P.days.filter(d => d.hasData); if (!days.length) return say("Nothing logged yet.");
  const rows = days.slice().reverse().map(d => { const b = d.byCat; const sc = l => sum(l.map(c => b[c] || 0));
    const deep = sc(CFG.value), leak = sc(CFG.leak) + d.unaccounted; const dp = d.workable ? deep / d.workable * 100 : 0;
    return [dlink(d.iso), hhmm(d.login), hhmm(d.logout), hrs(d.span), hrs(deep), hrs(sc(CFG.overhead.filter(c => c === "meeting"))), hrs(leak), mins(d.unaccounted), pct0(dp) + " " + bar(dp, 6), d.flags.length ? "⚠️ " + d.flags.length : ""]; });
  dv.table(["Day", "In", "Out", "On clock", "Deep", "Meetings", "Leaked", "Unlogged", "Deep %", "Flags"], rows);
};

S.estimates = (P) => {
  hd("Estimation accuracy");
  const rows = estRows(P.tasks); const st = P.est;
  if (!st) return say("No finished tasks with both [est:: minutes] and [actual:: minutes] in this period.");
  dv.paragraph("**" + st.n + "** tasks · estimated **" + hrs(st.est) + "**, actually took **" + hrs(st.actual) + "** · typical error **±" + Math.round(st.mape) + "%** · within ±" + CFG.estTol + "%: **" + pct0(st.withinPct) + "** · median actual/estimate: **" + st.med.toFixed(2) + "×**");
  const g = new Map(); rows.forEach(r => { if (!g.has(r.type)) g.set(r.type, []); g.get(r.type).push(r); });
  const trs = [...g.entries()].sort((x, y) => y[1].length - x[1].length).map(([type, rs]) => { const s = estStats(rs);
    const advice = rs.length < 3 ? "need ≥3 tasks" : (s.med > 1.15 ? "× " + s.med.toFixed(1) + " on your estimate" : s.med < 0.85 ? "you over-estimate — × " + s.med.toFixed(1) : "well calibrated");
    return [type, s.n, mins(avg(rs.map(r => r.est))), mins(avg(rs.map(r => r.actual))), s.med.toFixed(2) + "×", pct0(s.withinPct), advice]; });
  dv.table(["Task type", "Tasks", "Avg estimate", "Avg actual", "Actual ÷ est", "Within tolerance", "Correction to apply"], trs);
  const over = rows.filter(r => r.actual / r.est >= CFG.overrun).sort((x, y) => y.actual / y.est - x.actual / x.est);
  if (over.length) {
    const causes = new Map(); over.forEach(r => { const c = r.cause || "(no cause noted)"; causes.set(c, (causes.get(c) || 0) + 1); });
    dv.paragraph("**Overruns ≥ " + CFG.overrun + "×:** " + over.length + " — causes: " + [...causes.entries()].sort((x, y) => y[1] - x[1]).map(([c, n]) => c + " (" + n + ")").join(", "));
    dv.table(["Day", "Task", "Est", "Actual", "×", "Cause"], over.slice(0, LIM).map(r => [dlink(r.iso), r.text, mins(r.est), mins(r.actual), (r.actual / r.est).toFixed(1), r.cause]));
  }
};

S.repeats = (P) => {
  hd("Repeated work → runbook / automation queue");
  const reps = P.items.filter(x => x.l.repeat != null && String(x.l.repeat).trim() !== "");
  if (!reps.length) return say("Nothing tagged with [repeat:: name] yet. Whenever you redo a manual task, add it under 🔁 Repeated today.");
  const runbooks = A(dv.pages('"' + F.runbooks + '"')).map(p => ({ p, names: [p.file.name, ...A(p.aliases)].map(s => String(s).toLowerCase().trim()) }));
  const g = new Map();
  for (const x of reps) { const name = nameOf(x.l.repeat); const k = name.toLowerCase(); const v = g.get(k) || { name, n: 0, m: 0, last: "", days: new Set() };
    v.n++; v.m += isNum(x.l.min) ? x.l.min : 0; v.days.add(x.iso); if (x.iso > v.last) v.last = x.iso; g.set(k, v); }
  const rows = [...g.entries()].map(([k, v]) => { const rb = runbooks.find(r => r.names.includes(k)); const avgm = v.m / v.n;
    let status = rb ? "📘 " + dv.fileLink(rb.p.file.path, false, "runbook") : (v.n >= CFG.runbookAfter ? "⚠️ write a runbook" : "watch");
    if (v.n >= 3 && avgm >= 15) status += " · 🤖 automate?";
    return { v, row: [v.name, v.n, v.m ? mins(v.m) : "–", v.m ? mins(avgm) : "–", dlink(v.last), status] }; }).sort((x, y) => y.v.m - x.v.m || y.v.n - x.v.n);
  dv.table(["Repeated task", "Times", "Total time", "Avg time", "Last done", "Status"], rows.map(r => r.row));
};

S.wins = (P) => {
  hd("Wins & recognition");
  const w = P.items.filter(x => x.l.win != null && String(x.l.win).trim() !== "").sort((a, b) => b.iso.localeCompare(a.iso));
  if (!w.length) return say("No wins logged in this period. Add [win:: what changed] [impact:: numbers] [proof:: link] in the daily note.");
  const withProof = w.filter(x => x.l.proof != null && String(x.l.proof).trim()).length;
  const KIND = { impact: "📈", praise: "🙌", delivery: "📦", improvement: "🔧", learning: "🎓" };
  dv.paragraph("**" + w.length + "** wins · **" + withProof + "** with proof (" + pct0(withProof / w.length * 100) + ")");
  dv.table(["Day", "Win", "Impact", "Proof"], w.slice(0, opts.limit || 15).map(x => [dlink(x.iso), (KIND[String(x.l.kind || "").toLowerCase()] || "🏆") + " " + String(x.l.win), x.l.impact == null ? "" : String(x.l.impact), x.l.proof == null ? "" : String(x.l.proof)]));
};

S.learning = (P, PP, R) => {
  hd("Learning & teaching");
  const notes = learningNotes().map(p => ({ p, d: pageDate(p) })).filter(x => x.d);
  const inR = notes.filter(x => { const i = x.d.toISODate(); return i >= R.sISO && i <= R.eISO; }).sort((a, b) => b.d.toMillis() - a.d.toMillis());
  const learnedLines = P.items.filter(x => (x.l.learned != null && String(x.l.learned).trim() !== "") || (!x.l.task && secName(x.l).includes("learned today") && cleanText(x.l.text) !== ""));
  const taught = inR.filter(x => x.p.taught === true).length;
  dv.paragraph("**" + inR.length + "** learning notes · **" + learnedLines.length + "** learned-today lines · taught to someone: **" + taught + "**" + (inR.length ? " (" + pct0(taught / inR.length * 100) + ")" : ""));
  if (inR.length) dv.table(["Note", "Skill", "Confidence", "Taught back?", "Written"], inR.slice(0, opts.limit || 15).map(x => [x.p.file.link, x.p.skill == null ? "" : nameOf(x.p.skill), x.p.confidence == null ? "" : (isNum(x.p.confidence) ? dots(x.p.confidence) : String(x.p.confidence)), x.p.taught === true ? "✅ " + (dateOf(x.p.taught_on) ? dateOf(x.p.taught_on).toFormat("d LLL") : "") : "—", x.d.toFormat("d LLL")]));
  const debt = notes.filter(x => x.p.taught !== true && today.diff(x.d, "days").days >= CFG.teachDebtDays).sort((a, b) => a.d.toMillis() - b.d.toMillis());
  if (debt.length && (R.key === "today" || R.key.startsWith("last") || R.key.startsWith("this"))) {
    dv.paragraph("**Teach-back debt** (notes older than " + CFG.teachDebtDays + " days never explained to anyone): " + debt.slice(0, 6).map(x => String(x.p.file.link)).join(" · ") + (debt.length > 6 ? " … +" + (debt.length - 6) : ""));
  }
};

S.skills = () => {
  hd("Skills");
  const sk = byType("skill").filter(p => p.level != null);
  if (!sk.length) return say("No skill notes yet. Create one from the T - Skill Learning Log template.");
  const rows = sk.map(p => {
    const inl = A(p.file.inlinks).map(l => l.path); let last = null;
    for (const path of new Set(inl)) { const pg = dv.page(path); const d = pg ? pageDate(pg) : null; if (d && (!last || d > last)) last = d; }
    const since = last ? Math.round(today.diff(last.startOf("day"), "days").days) : null;
    const lvl = levelNum(p.level), tgt = p.target != null && levelNum(p.target) ? levelNum(p.target) : lvl, gap = tgt - lvl;
    const status = since != null && since > CFG.staleDays ? "💤 stale (" + since + "d)" : gap > 0 ? "⬆ growing" : "✅ at target";
    return { gap, row: [p.file.link, String(p.category != null ? p.category : (p.area != null ? nameOf(p.area) : "")), dots(lvl) + " " + lvl + "/" + tgt, new Set(inl).size, last ? last.toFormat("d LLL yyyy") : "—", status, p.next_step == null ? "" : String(p.next_step)] };
  }).sort((a, b) => b.gap - a.gap).map(r => r.row);
  dv.table(["Skill", "Area", "Level / target", "Evidence notes", "Last evidence", "Status", "Next step"], rows);
};

S.projects = () => {
  hd("Projects");
  const ps = byType("project").filter(p => p.status == null || !["done", "cancelled", "archived", "someday"].includes(lc(p.status)));
  if (!ps.length) return say("No active projects. Create one from the T - Project template.");
  const all = periodData(mkRange(ALL_DAILY.length ? ALL_DAILY[0].d : today, today, "all"));
  const rows = ps.map(p => { const nm = p.file.name.toLowerCase();
    const m = sum(all.agg.ents.filter(e => e.project.toLowerCase() === nm).map(e => e.min));
    const wins = all.items.filter(x => x.l.win != null && nameOf(x.l.project).toLowerCase() === nm).length;
    const dl = dateOf(p.deadline); const left = dl ? Math.round(dl.startOf("day").diff(today, "days").days) : null;
    return [p.file.link, p.status == null ? "" : String(p.status), p.priority == null ? "" : String(p.priority), dl ? dl.toFormat("d LLL") + (left < 0 ? " ⚠️ overdue" : " (" + left + "d)") : "—", m ? hrs(m) : "–", wins || "–", p.impact == null ? "" : String(p.impact)]; });
  dv.table(["Project", "Status", "Priority", "Deadline", "Time logged", "Wins", "Impact"], rows);
};

S.decisions = () => {
  hd("Recent decisions");
  const ds = byType("decision").map(p => ({ p, d: pageDate(p) })).filter(x => x.d).sort((a, b) => b.d.toMillis() - a.d.toMillis()).slice(0, opts.limit || 6);
  if (!ds.length) return say("No decisions recorded yet. Create one from the T - Decision Log template.");
  dv.table(["Decision", "Date", "Status", "Review on", "Result"], ds.map(x => { const rv = dateOf(x.p.review_on); const due = rv && rv <= today && String(x.p.status).toLowerCase() !== "reviewed";
    return [x.p.file.link, x.d.toFormat("d LLL yyyy"), x.p.status == null ? "" : String(x.p.status), rv ? rv.toFormat("d LLL") + (due ? " ⏰ due" : "") : "—", x.p.result == null ? "" : String(x.p.result)]; }));
};

S.trend = (P0, PP0, R0) => {
  hd("Growth trend by month");
  // year / quarter notes show their own months; everything else shows the last N months up to today
  const own = R0.key === "year" || R0.key === "thisyear" ? 12 : (R0.key === "quarter" || R0.key === "thisquarter" ? 3 : 0);
  const n = own || opts.months || 6; const rows = []; let prevDeep = null;
  const learnNotes = learningNotes().map(p => pageDate(p)).filter(Boolean);
  const runbooks = A(dv.pages('"' + F.runbooks + '"')).map(p => pageDate(p)).filter(Boolean);
  for (let i = n - 1; i >= 0; i--) {
    const s = own ? R0.s.plus({ months: n - 1 - i }) : today.startOf("month").minus({ months: i });
    if (s > today) continue;
    const r = mkRange(s, s.plus({ months: 1 }).minus({ days: 1 }), "month");
    const P = periodData(r); const a = P.agg; const inM = d => { const x = d.toISODate(); return x >= r.sISO && x <= r.eISO; };
    if (!a.n && !learnNotes.some(inM)) { rows.push([s.toFormat("LLL yyyy"), "–", "–", "–", "–", "–", "–", "–", "–"]); continue; }
    const arrow = prevDeep == null || !a.n ? "" : (a.deepPct - prevDeep > 1 ? " ▲" : a.deepPct - prevDeep < -1 ? " ▼" : " ＝");
    if (a.n) prevDeep = a.deepPct;
    rows.push([s.toFormat("LLL yyyy"), a.n, a.n ? pct0(a.deepPct) + arrow : "–", a.n ? pct0(a.leakPct) : "–", a.n ? mins(a.unacctPerDay) : "–", P.est ? "±" + Math.round(P.est.mape) + "%" : "–", P.items.filter(x => x.l.win != null).length, learnNotes.filter(inM).length, runbooks.filter(inM).length]);
  }
  dv.table(["Month", "Days logged", "Deep work", "Time leaked", "Unlogged / day", "Estimate error", "Wins", "Learning notes", "Runbooks"], rows);
};

S.tasks = () => {
  hd("Open tasks (last " + (opts.days || 14) + " days)");
  const from = today.minus({ days: (opts.days || 14) }).toISODate();
  const open = ALL_DAILY.filter(x => x.d.toISODate() >= from).flatMap(x => A(x.p.file.tasks)).filter(t => !t.completed && !t.waiting_on && cleanText(t.text));
  if (!open.length) return say("Nothing open. Nice.");
  dv.taskList(open.slice(0, opts.limit || 20), false);
};

S.waiting = () => {
  hd("Waiting on others");
  const w = ALL_DAILY.flatMap(x => analysed(x).tasks).filter(t => !t.completed && t.waiting_on);
  if (!w.length) return say("Nobody is blocking you right now (open tasks with [waiting_on:: name] appear here).");
  dv.table(["Waiting on", "For", "Since", "Days", "Note"], w.map(t => { const s = t.since || t.day; return { t, s, days: Math.round(today.diff(s.startOf("day"), "days").days) }; })
    .sort((a, b) => b.days - a.days).map(x => [personLink(x.t.waiting_on), x.t.text, x.s.toFormat("d LLL"), x.days + (x.days >= 3 ? " ⚠️" : ""), dlink(x.t.iso)]));
};

S.checks = (P) => {
  hd("Log hygiene — fix these to keep your record credible");
  const issues = [];
  for (const d of P.days) {
    d.flags.forEach(f => issues.push([dlink(d.iso), f]));
    d.tasks.filter(t => t.completed && !t.proof).forEach(t => issues.push([dlink(d.iso), "done without proof: " + t.text]));
    d.tasks.filter(t => t.completed && isNum(t.est) && !isNum(effActual(t))).forEach(t => issues.push([dlink(d.iso), "estimate but no actual (add [actual:: min] or a ticket shared with the time log): " + t.text]));
    d.ents.filter(e => e.cat === "meeting" && !e.outcome).forEach(e => issues.push([dlink(d.iso), "meeting without [outcome:: yes/no]: " + e.text]));
    d.ents.filter(e => e.cat === "blocked" && !e.on).forEach(e => issues.push([dlink(d.iso), "blocked but no [on:: who/what]: " + e.text]));
  }
  if (!issues.length) return dv.paragraph("✅ Nothing to fix — the log looks clean.");
  dv.paragraph("**" + issues.length + "** things to tidy" + (issues.length > 25 ? " (showing 25)" : ""));
  dv.table(["Day", "Issue"], issues.slice(0, 25));
};

S.manager = (P, PP, R) => {
  hd("Update for my manager (copy & send)");
  const a = P.agg; const L = [];
  L.push("Update — " + R.label); L.push("");
  const done = P.tasks.filter(t => t.completed);
  L.push("Shipped"); (done.length ? done.slice(0, 12).map(t => "• " + t.text + (t.proof ? " — " + t.proof : "")) : ["• (nothing closed yet)"]).forEach(x => L.push(x));
  const w = P.items.filter(x => x.l.win != null && String(x.l.win).trim());
  if (w.length) { L.push(""); L.push("Wins"); w.slice(0, 6).forEach(x => L.push("• " + String(x.l.win) + (x.l.impact ? " (" + String(x.l.impact) + ")" : "") + (x.l.proof ? " — " + String(x.l.proof) : ""))); }
  L.push(""); L.push("How the time went");
  if (a.n) {
    L.push("• " + a.n + " days · deep work " + hrs(a.deep) + " (" + pct0(a.deepPct) + " of working time) · meetings " + hrs(a.meet.min));
    const ex = a.ents.filter(e => CFG.external.includes(e.cat)); const g = new Map(); ex.forEach(e => g.set(e.on || e.cat, (g.get(e.on || e.cat) || 0) + e.min));
    if (ex.length) L.push("• Lost " + hrs(a.ext) + " to waiting / interruptions — " + [...g.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k, m]) => k + " " + mins(m)).join(", "));
  } else L.push("• (no time logged)");
  if (P.est) L.push("• Estimates: " + P.est.within + " of " + P.est.n + " tasks landed within ±" + CFG.estTol + "%");
  const open = P.tasks.filter(t => !t.completed && !t.waiting_on);
  L.push(""); L.push("Next"); (open.length ? open.slice(0, 5).map(t => "• " + t.text) : ["• (fill in)"]).forEach(x => L.push(x));
  const waiting = P.tasks.filter(t => !t.completed && t.waiting_on);
  if (waiting.length) { L.push(""); L.push("Blocked on"); waiting.slice(0, 5).forEach(t => L.push("• " + t.waiting_on + " — " + t.text)); }
  const text = L.join("\n");
  const wrap = dv.container.createEl("div");
  const pre = wrap.createEl("pre"); pre.textContent = text; pre.style.cssText = "white-space:pre-wrap;padding:10px;border-radius:8px;background:var(--background-secondary);border:1px solid var(--background-modifier-border)";
  const btn = wrap.createEl("button", { text: "Copy to clipboard" });
  btn.onclick = async () => { try { await navigator.clipboard.writeText(text); btn.textContent = "Copied ✓"; } catch (e) { btn.textContent = "Select the text and copy manually"; } };
};

S.project = () => {
  hd("Time & proof for this project");
  const nm = curName.toLowerCase();
  const all = periodData(mkRange(ALL_DAILY.length ? ALL_DAILY[0].d : today, today, "all"));
  const es = all.agg.ents.filter(e => e.project.toLowerCase() === nm);
  const ws = all.items.filter(x => x.l.win != null && nameOf(x.l.project).toLowerCase() === nm);
  const ts = all.tasks.filter(t => t.project.toLowerCase() === nm);
  const done = ts.filter(t => t.completed);
  renderCards([
    { label: "Time logged", value: hrs(sum(es.map(e => e.min))), sub: new Set(es.map(e => e.iso)).size + " days" },
    { label: "Tasks done", value: done.length + " / " + ts.length, sub: done.filter(t => t.proof).length + " with proof" },
    { label: "Wins", value: ws.length, sub: "tagged to this project" },
    { label: "First → last log", value: es.length ? DT.fromISO(es[0].iso).toFormat("d LLL") + " → " + DT.fromISO(es[es.length - 1].iso).toFormat("d LLL") : "–", sub: "" },
  ]);
  if (ws.length) dv.table(["Day", "Win", "Impact", "Proof"], ws.sort((a, b) => b.iso.localeCompare(a.iso)).map(x => [dlink(x.iso), String(x.l.win), x.l.impact == null ? "" : String(x.l.impact), x.l.proof == null ? "" : String(x.l.proof)]));
  if (es.length) { const byDay = new Map(); es.forEach(e => byDay.set(e.iso, (byDay.get(e.iso) || 0) + e.min));
    dv.table(["Day", "Time on project"], [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 20).map(([iso, m]) => [dlink(iso), mins(m)])); }
  else say("Tag time-log lines and tasks with [project:: " + curName + "] to see them here.");
};

S.person = () => {
  hd("Time this person blocks or interrupts");
  const me = lc(curName);
  const all = periodData(mkRange(ALL_DAILY.length ? ALL_DAILY[0].d : today, today, "all"));
  const es = all.agg.ents.filter(e => { if (!CFG.external.includes(e.cat) || !e.on) return false; const base = lc(e.on.replace(/\s*\(.*\)\s*$/, "")); return base && (me === base || me.startsWith(base + " ")); });
  if (!es.length) return say("Nothing logged against " + curName + " yet. Add an on field with their name to blocked or interruption lines in the time log.");
  renderCards([{ label: "Time blocked / interrupted", value: hrs(sum(es.map(e => e.min))), sub: es.length + " times" },
    { label: "Longest single wait", value: mins(Math.max(...es.map(e => e.min))), sub: "" },
    { label: "Last time", value: DT.fromISO(es.map(e => e.iso).sort().pop()).toFormat("d LLL yyyy"), sub: "" }]);
  dv.table(["Day", "Type", "Length", "What", "Detail"], es.sort((a, b) => b.iso.localeCompare(a.iso)).slice(0, 15).map(e => [dlink(e.iso), ic(e.cat), mins(e.min), e.text, e.on]));
};

S.runbook = () => {
  hd("Usage (auto)");
  const names = [curName, ...A(cur && cur.aliases)].map(s => String(s).toLowerCase().trim());
  const all = periodData(mkRange(ALL_DAILY.length ? ALL_DAILY[0].d : today, today, "all"));
  const us = all.items.filter(x => x.l.repeat != null && names.includes(nameOf(x.l.repeat).toLowerCase()));
  if (!us.length) return say("No [repeat:: " + curName + "] entries yet. Every time you do this task, log it under 🔁 Repeated today.");
  const ms = us.map(x => x.l.min).filter(isNum);
  renderCards([{ label: "Times used", value: us.length }, { label: "Avg time", value: ms.length ? mins(avg(ms)) : "–", sub: ms.length ? "total " + mins(sum(ms)) : "" }, { label: "Last used", value: DT.fromISO(us.map(x => x.iso).sort().pop()).toFormat("d LLL yyyy") }]);
  dv.table(["Day", "Minutes"], us.sort((a, b) => b.iso.localeCompare(a.iso)).slice(0, 10).map(x => [dlink(x.iso), isNum(x.l.min) ? mins(x.l.min) : "–"]));
};

S.evidence = () => {
  hd("Evidence of this skill (notes that link here)");
  const inl = [...new Set(A(cur && cur.file && cur.file.inlinks).map(l => l.path))].map(path => dv.page(path)).filter(Boolean);
  if (!inl.length) return say("Nothing links here yet. Link this skill from wins, learning notes and projects: [[" + curName + "]].");
  dv.table(["Note", "Kind", "Date"], inl.map(p => ({ p, d: pageDate(p) })).sort((a, b) => (b.d ? b.d.toMillis() : 0) - (a.d ? a.d.toMillis() : 0)).slice(0, 20)
    .map(x => [x.p.file.link, x.p.type == null ? (pageDay(x.p) ? "daily" : "note") : String(x.p.type), x.d ? x.d.toFormat("d LLL yyyy") : "—"]));
};

S.header = (P, PP, R) => {
  const by = cur && cur.prepared_by ? String(cur.prepared_by).trim() : "";
  dv.paragraph("**Period:** " + R.label + "  ·  **Working days logged:** " + P.agg.n + "  ·  **Generated:** " + now.toFormat("d LLL yyyy, HH:mm") + (by ? "  ·  **Prepared by:** " + by : ""));
};

S.timesheet = (P, PP, R) => {
  hd("Timesheet & attendance");
  const days = P.days.filter(d => d.hasData); if (!days.length) return say("Nothing logged in this period.");
  const T = CFG.workday, sgn = m => (m >= 0 ? "+" : "−") + mins(Math.abs(m));
  dv.table(["Day", "In", "Out", "Lunch", "Net hours", "vs " + hrs(T) + " target", "In-time source", "Mode"],
    days.slice().reverse().map(d => [dlink(d.iso), hhmm(d.login), hhmm(d.logout), d.lunch ? mins(d.lunch) : "–", hrs(d.workable), sgn(d.workable - T),
      d.page.login_source == null ? "not recorded" : String(d.page.login_source), d.page.work_mode == null ? "" : String(d.page.work_mode)]));
  const wk = new Map();
  for (const d of days) { const k = d.day.toFormat("kkkk-'W'WW"); const v = wk.get(k) || { n: 0, net: 0, ins: [], outs: [] }; v.n++; v.net += d.workable; v.ins.push(d.login); v.outs.push(d.logout); wk.set(k, v); }
  const rows = [...wk.entries()].map(([k, v]) => [k, v.n, hrs(v.net), hrs(v.n * T), sgn(v.net - v.n * T), hhmm(avg(v.ins)), hhmm(avg(v.outs))]);
  const tot = sum([...wk.values()].map(v => v.net)), tn = sum([...wk.values()].map(v => v.n));
  rows.push(["**Total**", "**" + tn + "**", "**" + hrs(tot) + "**", "**" + hrs(tn * T) + "**", "**" + sgn(tot - tn * T) + "**", "", ""]);
  dv.header(HL + 1, "By week");
  dv.table(["Week", "Days", "Net hours", "Target", "Difference", "Avg in", "Avg out"], rows);
  const indep = days.filter(d => d.page.login_source != null && !/self/i.test(String(d.page.login_source))).length;
  dv.paragraph("**" + indep + " of " + days.length + "** days have an independent login source (badge, VPN, first chat activity). Screenshot that source and store it in Attachments for the days that matter.");
};

S.ledger = (P, PP, R) => {
  hd("Task ledger — what was done, when it started and finished, how long it took");
  const TIx = ticketInfo(); const fmtAt = (iso, t) => DT.fromISO(iso).toFormat("d LLL") + " " + hhmm(t);
  const rows = [];
  const done = P.tasks.filter(t => t.completed);
  for (const t of done) {
    const info = t.ticket ? TIx.get(t.ticket.toLowerCase()) : null; const act = effActual(t);
    rows.push({ iso: t.iso, row: [dlink(t.iso), t.text, t.ticket || "–", t.type, isNum(t.est) ? mins(t.est) : "–", isNum(act) ? mins(act) + (isNum(t.actual) ? "" : " (from log)") : "–",
      isNum(act) && isNum(t.est) && t.est > 0 ? (act / t.est).toFixed(1) + "×" : "–", info ? fmtAt(info.first.iso, info.first.t) : "–", info ? fmtAt(info.last.iso, info.last.t) : "–", t.proof || ""] });
  }
  const known = new Set(P.tasks.map(t => t.ticket.toLowerCase()).filter(Boolean));
  const seen = new Set();
  for (const e of P.agg.ents) { if (!e.ticket) continue; const k = e.ticket.toLowerCase(); if (known.has(k) || seen.has(k)) continue; seen.add(k); const info = TIx.get(k);
    rows.push({ iso: e.iso, row: [dlink(e.iso), (e.text || "(time-log only)") + " _(from time log)_", e.ticket, "–", "–", mins(info.min), "–", fmtAt(info.first.iso, info.first.t), fmtAt(info.last.iso, info.last.t), e.proof || ""] }); }
  if (!rows.length) return say("No finished tasks in this period. Tick tasks off in the daily note; add [ticket:: ID] to a task and to its time-log lines to get automatic actual time, start and finish.");
  rows.sort((a, b) => b.iso.localeCompare(a.iso));
  dv.paragraph("**" + rows.length + "** items" + (rows.length > (opts.limit || 30) ? " (showing " + (opts.limit || 30) + ")" : ""));
  dv.table(["Day", "Task", "Ticket", "Type", "Estimate", "Actual", "×", "Started", "Finished", "Proof"], rows.slice(0, opts.limit || 30).map(r => r.row));
};

S.proofs = (P, PP, R) => {
  hd("Proof register");
  const rows = [];
  P.tasks.filter(t => t.completed && t.proof).forEach(t => rows.push({ iso: t.iso, kind: "✅ task", what: t.text, proof: t.proof }));
  P.items.filter(x => x.l.win != null && x.l.proof != null && String(x.l.proof).trim()).forEach(x => rows.push({ iso: x.iso, kind: "🏆 win", what: String(x.l.win), proof: String(x.l.proof) }));
  P.agg.ents.filter(e => e.proof).forEach(e => rows.push({ iso: e.iso, kind: "⏱ activity", what: e.text || ic(e.cat), proof: e.proof }));
  const missing = P.tasks.filter(t => t.completed && !t.proof).length;
  if (!rows.length) return say("No proof links recorded in this period.");
  rows.sort((a, b) => b.iso.localeCompare(a.iso));
  const c = k => rows.filter(r => r.kind === k).length;
  dv.paragraph("**" + rows.length + "** proof links: " + c("✅ task") + " on tasks, " + c("🏆 win") + " on wins, " + c("⏱ activity") + " on activities" + (missing ? " · ⚠️ " + missing + " finished tasks have no proof yet" : ""));
  dv.table(["Day", "Type", "What", "Proof"], rows.slice(0, opts.limit || 40).map(r => [dlink(r.iso), r.kind, r.what, r.proof]));
};

S.patterns = (P, PP, R) => {
  hd("When am I at my best?");
  const a = P.agg; if (a.n < 3) return say("Needs at least 3 logged days.");
  const names = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; const wd = new Map();
  for (const d of P.days.filter(x => x.hasData)) { const w = d.day.weekday; const v = wd.get(w) || { n: 0, deep: 0, work: 0, leak: 0, focus: [], energy: [] };
    v.n++; v.deep += sum(CFG.value.map(c => d.byCat[c] || 0)); v.work += d.workable; v.leak += sum(CFG.leak.map(c => d.byCat[c] || 0)) + d.unaccounted;
    if (isNum(d.page.focus)) v.focus.push(d.page.focus); if (isNum(d.page.energy)) v.energy.push(d.page.energy); wd.set(w, v); }
  dv.table(["Weekday", "Days", "Deep work", "", "Time leaked", "Avg focus (1-5)", "Avg energy (1-5)"], [...wd.entries()].sort((x, y) => x[0] - y[0]).map(([w, v]) => { const dp = v.work ? v.deep / v.work * 100 : 0;
    return [names[w], v.n, pct0(dp), bar(dp, 10), v.work ? pct0(v.leak / v.work * 100) : "–", v.focus.length ? avg(v.focus).toFixed(1) : "–", v.energy.length ? avg(v.energy).toFixed(1) : "–"]; }));
  const hours = new Array(24).fill(0);
  for (const e of a.ents.filter(e => CFG.value.includes(e.cat))) for (let m = e.start; m < e.end; m++) hours[Math.floor(m / 60) % 24]++;
  const mx = Math.max(...hours); if (!mx) return;
  const rows = []; for (let h = 6; h <= 21; h++) rows.push([String(h).padStart(2, "0") + ":00", hours[h] ? mins(hours[h] / a.n) + " avg/day" : "–", bar(hours[h] / mx * 100, 14)]);
  dv.header(HL + 1, "Deep-work minutes by hour of day");
  dv.table(["Hour", "Deep work", ""], rows);
  const top = hours.map((v, h) => ({ v, h })).sort((x, y) => y.v - x.v).slice(0, 3).filter(x => x.v).map(x => String(x.h).padStart(2, "0") + ":00").join(", ");
  dv.paragraph("**Your best hours for deep work:** " + top + ". Protect them: book meetings and admin outside these slots.");
};

S.chart = (P, PP, R) => {
  hd("Weekly trend");
  const n = opts.weeks || 8; const end = (R.e < today ? R.e : today).startOf("week"); const pts = [];
  for (let i = n - 1; i >= 0; i--) { const ws = end.minus({ weeks: i }); const pd = periodData(mkRange(ws, ws.plus({ days: 6 }), "week")); const a = pd.agg;
    pts.push({ label: "W" + ws.toFormat("WW"), ok: a.n > 0, deep: a.deepPct, leak: a.leakPct, unl: a.workable ? a.unacct / a.workable * 100 : 0 }); }
  if (pts.filter(p => p.ok).length < 2) return say("Needs at least two weeks of data.");
  const doc = dv.container.ownerDocument, NS = "http://www.w3.org/2000/svg";
  const W = 640, H = 230, L = 38, Rm = 12, T = 16, B = 30;
  const mk = (parent, tag, attrs) => { const e = doc.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const svg = mk(dv.container, "svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Weekly trend of deep work, time leaked and unlogged time" });
  svg.style.cssText = "width:100%;max-width:720px;height:auto;margin:6px 0;overflow:visible";
  const x = i => L + (W - L - Rm) * (n === 1 ? 0.5 : i / (n - 1)), y = v => T + (H - T - B) * (1 - clamp(v, 0, 100) / 100);
  for (const g of [0, 25, 50, 75, 100]) { mk(svg, "line", { x1: L, x2: W - Rm, y1: y(g), y2: y(g), stroke: "var(--background-modifier-border)", "stroke-width": 1 });
    const t = mk(svg, "text", { x: L - 6, y: y(g) + 4, "text-anchor": "end", "font-size": 11 }); t.textContent = g + "%"; t.style.fill = "var(--text-muted)"; }
  mk(svg, "line", { x1: L, x2: W - Rm, y1: y(CFG.deepTarget), y2: y(CFG.deepTarget), stroke: "var(--color-green)", "stroke-width": 1, "stroke-dasharray": "4 4", opacity: 0.6 });
  pts.forEach((p, i) => { const t = mk(svg, "text", { x: x(i), y: H - 10, "text-anchor": "middle", "font-size": 11 }); t.textContent = p.label; t.style.fill = "var(--text-muted)"; });
  const series = [["deep", "var(--color-green)", "Deep work"], ["leak", "var(--color-red)", "Time leaked"], ["unl", "var(--color-orange)", "Unlogged"]];
  for (const [key, color] of series) {
    let d = ""; pts.forEach((p, i) => { if (p.ok) d += (d && pts[i - 1] && pts[i - 1].ok ? " L" : " M") + x(i).toFixed(1) + " " + y(p[key]).toFixed(1); });
    const path = mk(svg, "path", { d: d.trim(), fill: "none", stroke: color, "stroke-width": 2.5, "stroke-linejoin": "round" });
    pts.forEach((p, i) => { if (p.ok) { const c = mk(svg, "circle", { cx: x(i), cy: y(p[key]), r: 3.5, fill: color }); const tt = mk(c, "title", {}); tt.textContent = p.label + " · " + key + " " + Math.round(p[key]) + "%"; } });
  }
  const lg = dv.container.createEl("div"); lg.style.cssText = "display:flex;gap:16px;flex-wrap:wrap;font-size:0.8em;margin-bottom:10px";
  for (const [, color, name] of series) { const s = lg.createEl("span", { text: "● " + name }); s.style.color = color; }
  lg.createEl("span", { text: "- - green line = deep-work target " + CFG.deepTarget + "%" }).style.opacity = "0.7";
};

/* ============================ RUN ============================ */
const R = resolveRange(opts.range);
const P = periodData(R);
const PP = prevOf(R) ? periodData(prevOf(R)) : null;
for (const name of (opts.show || ["cards", "categories"])) {
  const fn = S[name];
  if (!fn) { dv.paragraph("⚠️ Unknown insights section: " + name); continue; }
  try { await fn(P, PP, R); } catch (err) { dv.paragraph("⚠️ Section “" + name + "” failed: " + (err && err.message ? err.message : err)); console.error("insights:" + name, err); }
}

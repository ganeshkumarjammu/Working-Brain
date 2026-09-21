"use strict";
/* Runs REAL Dataview (the parser, query executor, DataArray and page objects from the shipped plugin bundle)
 * against the vault on disk, so dashboards can be checked without opening Obsidian.
 * Only Obsidian itself is stubbed. The plugin bundle is downloaded once into tools/.cache and pinned. */
const fs = require("fs"), path = require("path"), Module = require("module");
const yaml = require("js-yaml"); const { JSDOM } = require("jsdom");

const DATAVIEW_VERSION = process.env.DATAVIEW_VERSION || "0.5.68";
const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;

async function ensureBundle() {
  if (process.env.DATAVIEW_MAIN_JS) return process.env.DATAVIEW_MAIN_JS;
  const dest = path.join(__dirname, "..", ".cache", "dataview-" + DATAVIEW_VERSION + ".js");
  if (fs.existsSync(dest)) return dest;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const url = "https://github.com/blacksmithgu/obsidian-dataview/releases/download/" + DATAVIEW_VERSION + "/main.js";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not download Dataview " + DATAVIEW_VERSION + " from " + url + " (HTTP " + res.status + "). Set DATAVIEW_MAIN_JS to a local copy of its main.js.");
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

function loadBundle(file, now) {
  const src = fs.readFileSync(file, "utf8") + "\n;module.exports.__dv = { parseQuery, EXPRESSION, Context, executeTable, executeList, executeTask, executeCalendar, DateTime, Duration, Link, Values, DEFAULT_SETTINGS, parseInlineValue, DEFAULT_FUNCTIONS, DataviewApi };";
  const stub = new Proxy(function () {}, { get: (t, k) => (k === "__esModule" ? false : stub), construct: () => stub, apply: () => stub });
  const orig = Module._load;
  Module._load = function (req) { if (["obsidian", "electron"].includes(req) || req.startsWith("@codemirror") || req.startsWith("@lezer")) return stub; return orig.apply(this, arguments); };
  const m = new Module("/tmp/dataview-main.js"); m.filename = "/tmp/dataview-main.js"; m.paths = Module._nodeModulePaths("/tmp");
  const g = global; const saved = { window: g.window, document: g.document };
  g.window = g; g.document = { createElement: () => ({ style: {} }) };
  try { m._compile(src, "/tmp/dataview-main.js"); } catch (e) { throw new Error("Could not load the Dataview bundle (" + e.message.slice(0, 200) + "). Its internal layout may have changed; pin DATAVIEW_VERSION."); }
  finally { Module._load = orig; g.window = saved.window; g.document = saved.document; }
  const D = m.exports.__dv;
  if (now) { const fixed = D.DateTime.fromISO(now); D.DateTime.now = () => fixed; }
  return D;
}

const SKIP_DIRS = new Set([".git", ".obsidian", "node_modules", "tools", "examples", ".github", ".cache", ".trash"]);
function walk(dir, base, out) {
  for (const f of fs.readdirSync(dir)) {
    const abs = path.join(dir, f); const rel = path.posix.join(base, f);
    if (fs.statSync(abs).isDirectory()) { if (!SKIP_DIRS.has(f) && rel !== "08_Meta/Templates") walk(abs, rel, out); }
    else if (f.endsWith(".md")) out.set(rel, abs);
  }
}

async function createRuntime(opts = {}) {
  const now = opts.now || process.env.WORKSTYLE_NOW || new Date().toISOString().slice(0, 19);
  const D = loadBundle(await ensureBundle(), now); const { DateTime, Link } = D;
  const dom = new JSDOM("<div></div>");
  const HE = dom.window.HTMLElement.prototype;
  HE.createEl = function (tag, o) { o = o || {}; const e = this.ownerDocument.createElement(tag); if (o.text != null) e.textContent = o.text; if (o.cls) e.className = o.cls; this.appendChild(e); return e; };

  const fmVal = v => { if (v instanceof Date) return DateTime.fromJSDate(v, { zone: "utc" }).setZone("local", { keepLocalTime: true }); if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return DateTime.fromISO(v); if (Array.isArray(v)) return v.map(fmVal); return v; };

  /* roots: array of directories; later roots override earlier ones (e.g. [vault, demo-data]). */
  function buildIndex(roots) {
    const fileMap = new Map(); for (const r of roots) walk(r, "", fileMap);
    const files = new Set(fileMap.keys()), folders = new Set([""]), byName = {}, raw = {};
    for (const [rel, abs] of fileMap) { rel.split("/").slice(0, -1).reduce((acc, seg) => { const p = acc ? acc + "/" + seg : seg; folders.add(p); return p; }, ""); byName[path.posix.basename(rel, ".md")] = rel; raw[rel] = fs.readFileSync(abs, "utf8"); }
    const outl = {}; for (const [rel, text] of Object.entries(raw)) { outl[rel] = new Set(); for (const l of text.matchAll(/\[\[([^\]|#]+)/g)) { const t = l[1].trim(); const hit = files.has(t + ".md") ? t + ".md" : byName[t.split("/").pop()]; if (hit && hit !== rel) outl[rel].add(hit); } }
    const inl = {}; for (const [a, set] of Object.entries(outl)) for (const b of set) (inl[b] = inl[b] || new Set()).add(a);
    const pages = new Map(); const index = { pages, prefix: null, tags: null, links: null, metadataCache: null, vault: { getMarkdownFiles: () => [...files].map(p => ({ path: p })) } };
    const parseErrors = [];
    for (const [rel, text0] of Object.entries(raw)) {
      let body = text0, fm = {}; const mm = text0.match(/^---\n([\s\S]*?)\n---\n?/);
      if (mm) { try { fm = yaml.load(mm[1]) || {}; } catch (e) { parseErrors.push(rel + ": " + e.message.split("\n")[0]); } body = text0.slice(mm[0].length); }
      const name = path.posix.basename(rel, ".md"); const lists = []; let fence = false, heading = null; const hdrOffset = mm ? mm[0].split("\n").length - 1 : 0; const pageFields = {};
      body.split("\n").forEach((line, i) => {
        if (/^\s*(```|~~~)/.test(line)) { fence = !fence; return; } if (fence) return;
        const h = line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/); if (h) { heading = h[1]; return; }
        const li = line.match(/^(\s*)[-*]\s+(?:\[(.)\]\s+)?(.*)$/);
        if (li) {
          const sec = heading ? Link.header(rel, heading) : Link.file(rel);
          const it = { symbol: "-", link: Link.file(rel), section: sec, text: li[3], tags: [], line: i + hdrOffset, lineCount: 1, list: i + hdrOffset, path: rel, children: [], task: li[2] !== undefined, annotated: false, parent: undefined, blockId: undefined,
            status: li[2] !== undefined ? li[2] : undefined, checked: li[2] !== undefined && li[2] !== " ", completed: li[2] !== undefined && li[2].toLowerCase() === "x", fullyCompleted: li[2] !== undefined && li[2].toLowerCase() === "x", real: true, visual: li[3],
            position: { start: { line: i, col: 0, offset: 0 }, end: { line: i, col: line.length, offset: 0 } } };
          for (const f of li[3].matchAll(/\[([A-Za-z_][\w-]*)::\s*([^\]]*)\]/g)) { const v = D.parseInlineValue(f[2]); it[f[1]] = v; const canon = f[1].toLowerCase().replace(/\s+/g, "-"); if (!(canon in it)) it[canon] = v; }
          lists.push(it);
        } else {
          for (const f of line.matchAll(/^\s*([A-Za-z_][\w -]*)::\s*(.+)$/g)) pageFields[f[1].trim()] = D.parseInlineValue(f[2].trim());
        }
      });
      const tagSet = new Set(); (Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : []).forEach(t => { const s = "#" + String(t).replace(/^#/, ""); tagSet.add(s); s.split("/").slice(0, -1).reduce((a, seg) => { const p = a + (a ? "/" : "") + seg; if (p !== "#") tagSet.add(p); return p; }, ""); });
      const data = Object.assign({}, pageFields); for (const [k, v] of Object.entries(pageFields)) data[k.toLowerCase().replace(/\s+/g, "-")] = v;
      for (const [k, v] of Object.entries(fm)) { data[k] = fmVal(v); data[k.toLowerCase()] = data[k]; }
      const nowDt = DateTime.now();
      data.file = { name, path: rel, folder: path.posix.dirname(rel) === "." ? "" : path.posix.dirname(rel), ext: "md", link: Link.file(rel), size: text0.length, ctime: nowDt, cday: nowDt.startOf("day"), mtime: nowDt, mday: nowDt.startOf("day"),
        tags: [...tagSet], etags: [...tagSet], inlinks: [...(inl[rel] || [])].map(p => Link.file(p)), outlinks: [...(outl[rel] || [])].map(p => Link.file(p)), aliases: [], tasks: lists.filter(l => l.task), lists, starred: false };
      if (/^\d{4}-\d{2}-\d{2}$/.test(name)) data.file.day = DateTime.fromISO(name);
      pages.set(rel, { serialize: () => data, tagSet });
    }
    index.prefix = { nodeExists: f => folders.has(f), pathExists: p => files.has(p), get: folder => new Set([...files].filter(f => folder === "" || f.startsWith(folder + "/"))), resolveRelative: p => p };
    index.tags = { getInverse: tag => new Set([...pages].filter(([, v]) => [...v.tagSet].some(t => t === tag || t.startsWith(tag + "/"))).map(([p]) => p)) };
    index.links = { getInverse: name => new Set(Object.entries(outl).filter(([, s]) => byName[name] && s.has(byName[name])).map(([p]) => p)) };
    index.metadataCache = { getFirstLinkpathDest: l => { const n = String(l).replace(/\.md$/, ""); const p = files.has(l) ? l : files.has(n + ".md") ? n + ".md" : byName[n.split("/").pop()]; return p ? { path: p } : null; }, resolvedLinks: Object.fromEntries(Object.entries(outl).map(([a, s]) => [a, Object.fromEntries([...s].map(b => [b, 1]))])) };
    index.files = [...files]; index.parseErrors = parseErrors; index.roots = roots;
    return index;
  }

  const cell = v => { if (v == null) return ""; if (v instanceof D.Link) return v.display || v.path.replace(/\.md$/, "").split("/").pop(); if (D.Values.isDate(v)) return v.toISODate(); if (D.Values.isDuration(v)) return v.toHuman ? v.toHuman() : String(v); if (Array.isArray(v)) return "[" + v.map(cell).join(", ") + "]"; if (typeof v === "object") return v.text !== undefined ? String(v.text) : JSON.stringify(v).slice(0, 60); return String(v); };

  async function runQuery(index, origin, text) {
    const q = D.parseQuery(text); if (!q.successful) return { ok: false, error: "syntax: " + String(q.error).split("\n").map(x => x.trim()).filter(Boolean).slice(0, 3).join(" | ") };
    const query = q.value; let r;
    try {
      if (query.header.type === "table") r = await D.executeTable(query, index, origin, D.DEFAULT_SETTINGS);
      else if (query.header.type === "list") r = await D.executeList(query, index, origin, D.DEFAULT_SETTINGS);
      else if (query.header.type === "task") r = await D.executeTask(query, origin, index, D.DEFAULT_SETTINGS);
      else if (query.header.type === "calendar") r = await D.executeCalendar(query, index, origin, D.DEFAULT_SETTINGS);
      else return { ok: false, error: "unknown query type " + query.header.type };
    } catch (e) { return { ok: false, error: "threw: " + e.message }; }
    if (!r.successful) return { ok: false, error: "runtime: " + r.error };
    const v = r.value; const rows = query.header.type === "table" ? v.data.length : query.header.type === "list" ? v.data.length : query.header.type === "calendar" ? v.data.length : null;
    return { ok: true, type: query.header.type, rows, value: v };
  }

  function makeDv(vault, index, currentPath, out) {
    const app = { metadataCache: index.metadataCache, vault: { adapter: {} } };
    const api = new D.DataviewApi(app, index, D.DEFAULT_SETTINGS, DATAVIEW_VERSION);
    const container = dom.window.document.createElement("div"); dom.window.document.body.appendChild(container);
    const dv = Object.create(api);
    Object.assign(dv, {
      container, current: () => api.page(currentPath, ""), pages: s => api.pages(s, currentPath), page: p => api.page(p, currentPath), luxon: api.luxon,
      fileLink: (p, e, d) => D.Link.file(p, e, d),
      header: (l, t) => out.push("\n" + "#".repeat(l) + " " + t), paragraph: t => out.push(String(t)), span: t => out.push(String(t)),
      el: (tag, text) => { out.push("<" + tag + "> " + cell(text)); const e = container.createEl(tag); e.textContent = String(text); return e; },
      table: (h, rows) => { out.push("| " + h.join(" | ") + " |"); (rows.array ? rows.array() : rows).forEach(r => out.push("| " + (r.array ? r.array() : r).map(cell).join(" | ") + " |")); },
      list: rows => (rows.array ? rows.array() : rows).forEach(r => out.push("• " + cell(r))),
      taskList: (t) => { const arr = t.array ? t.array() : t; const flat = []; const w = x => x && x.rows ? (x.rows.array ? x.rows.array() : x.rows).forEach(w) : x && flat.push(x); arr.forEach(w); flat.forEach(x => out.push("  [" + (x.completed ? "x" : " ") + "] " + String(x.text).replace(/\s*\[[a-z_]+::[^\]]*\]/g, "").trim())); },
      execute: async src => { const res = await runQuery(index, currentPath, src); out.push(res.ok ? "(DQL ok: " + res.type + ")" : "DQL ERROR " + res.error); },
      view: async function (name, input) { const code = fs.readFileSync(path.join(vault, name, "view.js"), "utf8"); await new AsyncFn("dv", "input", code)(dv, input); },
    });
    return dv;
  }

  /* Executes every dataviewjs block in a note. Returns [{i, first, error, output}] */
  async function runNoteJs(vault, index, notePath, text) {
    const blocks = [...text.matchAll(/^```dataviewjs\n([\s\S]*?)^```/gm)].map(m => m[1]); const out = []; const res = [];
    const dv = makeDv(vault, index, notePath, out);
    for (let i = 0; i < blocks.length; i++) {
      const before = out.length; let error = null;
      try { await new AsyncFn("dv", blocks[i])(dv); } catch (e) { error = e.message; }
      const lines = out.slice(before); const soft = lines.find(l => /failed:|Unknown insights section/.test(l));
      res.push({ i: i + 1, first: blocks[i].trim().split("\n")[0].slice(0, 100), error: error || (soft ? soft.trim() : null), output: lines });
    }
    return res;
  }
  return { D, buildIndex, runQuery, runNoteJs, makeDv, cell, now };
}
module.exports = { createRuntime, DATAVIEW_VERSION, SKIP_DIRS };

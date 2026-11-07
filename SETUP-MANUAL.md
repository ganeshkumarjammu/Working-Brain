# Setup: the simple way

## Already using this vault on a device?
1. Ctrl+P → **Obsidian Git: Pull**
2. Ctrl+P → **Reload app without saving**

Done. Your settings, hotkeys and notes stay as they are.

---

## New device (once, about 10 minutes)
1. **Open the vault:** Obsidian → *Open folder as vault* → turn on community plugins.
2. **Install 4 plugins** (Settings → Community plugins → Browse): **Dataview**, **Templater**, **Periodic Notes**, **Calendar**.
3. **Dataview** → *Enable JavaScript Queries*: **On**
   - Template folder: `08_Meta/Templates`
   - *Trigger on new file creation*: **On**
   - Template Hotkeys → add the 4 files in `08_Meta/Templates/Snippets`
5. **Periodic Notes:**
   - Daily: folder `01_Journal/Daily`, template `08_Meta/Templates/T - Daily Note`
   - Weekly: folder `01_Journal/Weekly`, format `GGGG-[W]WW`, template `08_Meta/Templates/T - Weekly Review`
6. **Hotkeys** (Settings → Hotkeys, search "Snippets"):
   - Switch activity → **Alt+Shift+S**
   - Stop activity → **Alt+Shift+E**
   - Stamp login → **Alt+Shift+I**
   - Stamp logout → **Alt+Shift+O**
7. Ctrl+P → **Reload app without saving**

On a phone: do steps 1 to 5, then put the 4 snippets on the toolbar (Settings → Mobile → toolbar).

---

## Using it every day
| When | Press |
|---|---|
| Start the day | **Alt+Shift+I** (in today's note) |
| Change what you're doing | **Alt+Shift+S** → pick the activity → pick the task (or Esc) |
| Take a pause | **Alt+Shift+E** |
| End the day | **Alt+Shift+O** |

**A bigger task?** Make a note from the **T - Task Note** template, open it, and press **Alt+Shift+S** there. The time is logged in that note.

**See your numbers:** 08_Meta → Dashboards → **Work Home**.

---


Something not working?

| Problem | Fix |
|---|---|
| Dashboards show code | Dataview → *Enable JavaScript Queries* **On** |
| A new note shows `<% %>` | Templater → *Trigger on new file creation* **On** |
| Hotkeys do nothing | Redo steps 4 and 6 |

All other settings: `08_Meta/Work-Style/Setup.md`.
</details>

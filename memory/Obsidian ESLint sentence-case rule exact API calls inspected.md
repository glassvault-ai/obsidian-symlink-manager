---
note_id: 20260219-1905-485a3872
type: fact
status: active
tags:
- obsidian
- eslint
- sentence-case
- ui
- summary
scope: project
created_at: '2026-02-19T19:05:59.066914+00:00'
created_by: ai-agent
---

## Summary
The `obsidianmd/ui/sentence-case` ESLint rule inspects specific Obsidian API calls and DOM patterns, like `setName(text)` and `new Notice('text')`, for sentence case compliance. It preserves brand names, acronyms, and camelCase in loose mode, while skipping inline code and file paths.

---

The ui/sentence-case rule in eslint-plugin-obsidianmd inspects these specific Obsidian API calls and DOM patterns for sentence case compliance:

## METHOD_STRING_ARG_POS map (method name -> argument index)
- setName(text) — arg 0
- setDesc(text) — arg 0
- setButtonText(text) — arg 0
- setTooltip(text) — arg 0
- setPlaceholder(text) — arg 0
- setText(text) — arg 0
- setTitle(text) — arg 0
- addRibbonIcon(icon, tooltip, callback) — arg 1 (tooltip)
- addOption(value, label) — arg 1 (label, for DropdownComponent)

## Other patterns checked
- new Notice('text') — first argument
- addCommand({ name: 'text' }) — the name property in the command object
- createEl(tag, { text: '...', title: '...' }) — text and title in options object
- createEl options attr object: aria-label, aria-description, title, placeholder
- setAttribute('aria-label', 'text') — value of text-bearing attributes
- Direct assignments: el.textContent = '...', el.innerText = '...', el.title = '...'
- getDisplayText() method implementations — return string values

## What it enforces
First letter of each sentence uppercase, all other words lowercase, EXCEPT:
- Brands preserved as-is (Obsidian, iOS, macOS, GitHub, npm, LaTeX, etc — ~58 defaults)
- Acronyms stay uppercase (API, URL, JSON, HTML, CSS, ID, UI, OK, etc — ~70 defaults)
- camelCase/PascalCase tokens preserved in loose mode (default)
- Skips: inline code with backticks, HTML tags, template placeholders, file paths, keyboard shortcuts, version numbers, ALL_CAPS identifiers

## Config in recommended
'obsidianmd/ui/sentence-case': ['error', { enforceCamelCaseLower: true }]

Source: /tmp/package/dist/lib/rules/ui/sentenceCase.js (lines 98-108 for METHOD_STRING_ARG_POS)

Related:
[[eslint-plugin-obsidianmd Official Obsidian Community Plugin ESLint Rules]]
[[Obsidian ESLint require() and Electron access for desktop-only plugins]]
---
note_id: 20260219-1905-9ba36af8
type: fact
status: active
tags:
- obsidian
- eslint
- community-plugin
- tooling
- summary
scope: project
created_at: '2026-02-19T19:05:37.930289+00:00'
created_by: ai-agent
---

## Summary
Use `eslint-plugin-obsidianmd` (v0.1.9) for official Obsidian community plugin ESLint rules. The recommended configuration includes `@typescript-eslint/recommendedTypeChecked` and enforces rules like avoiding forbidden DOM elements, using `requestUrl` over `fetch`, and sentence casing for UI strings.

---

The official ESLint plugin for Obsidian community plugins is **eslint-plugin-obsidianmd** (npm package: eslint-plugin-obsidianmd, v0.1.9 as of Feb 2026). Published by Dynalist Inc. (joethei), source at github.com/obsidianmd/eslint-plugin, mirrored/contributed by mProjectsCode.

## Installation
npm install eslint-plugin-obsidianmd --save-dev

## Config (ESLint 9 flat config)
import obsidianmd from 'eslint-plugin-obsidianmd';
export default [...obsidianmd.configs.recommended];

## Key Rules (27 total)
### Commands
- commands/no-command-in-command-id — no 'command' word in command IDs
- commands/no-command-in-command-name — no 'command' word in command names
- commands/no-default-hotkeys — discourage default hotkeys
- commands/no-plugin-id-in-command-id — no plugin ID in command ID
- commands/no-plugin-name-in-command-name — no plugin name in command name

### Core
- detach-leaves — don't detach leaves in onunload (fixable)
- hardcoded-config-path — don't hardcode .obsidian, use Vault#configDir
- no-forbidden-elements — disallow forbidden DOM elements
- no-plugin-as-component — prevent MarkdownRenderer memory leaks
- no-sample-code — remove template sample code (fixable)
- no-static-styles-assignment — use CSS classes not inline styles
- no-tfile-tfolder-cast — use instanceof not type casting
- no-view-references-in-plugin — prevent view ref memory leaks
- object-assign — require 3 params for Object.assign
- platform — disallow navigator API for OS detection
- prefer-abstract-input-suggest — use built-in AbstractInputSuggest
- prefer-file-manager-trash-file — FileManager.trashFile() over Vault.trash()
- regex-lookbehind — lookbehinds unsupported on some iOS
- sample-names — rename sample plugin class names

### Settings Tab
- settings-tab/no-manual-html-headings — use setHeading() not HTML (fixable)
- settings-tab/no-problematic-settings-headings — heading anti-patterns (fixable)

### UI
- ui/sentence-case — enforce sentence case for UI strings (fixable)
- ui/sentence-case-json — sentence case for JSON locale files (fixable)
- ui/sentence-case-locale-module — sentence case for TS/JS locale modules (fixable)

### Validation
- validate-license — validate LICENSE copyright structure
- validate-manifest — validate manifest.json structure

### Vault
- vault/iterate — avoid iterating all files by path (fixable)

## Recommended Config Also Includes
- @typescript-eslint/recommendedTypeChecked (for .ts files)
- @typescript-eslint/recommended (for .js files)
- import/no-nodejs-modules: conditionally error unless manifest.isDesktopOnly is true
- no-restricted-imports: bans axios, superagent, got, ofetch, ky, node-fetch (use requestUrl)
- no-restricted-globals: bans global app, fetch (use requestUrl), localStorage (use App#saveLocalStorage)
- @microsoft/sdl/no-document-write, no-inner-html
- no-console: only allows warn, error, debug

## Review Bot Parity
The recommended config has exact parity with the Obsidian Review Bot that scans community plugin submissions.

Related:
[[Obsidian ESLint require() and Electron access for desktop-only plugins]]
[[Obsidian community plugin release requirements]]
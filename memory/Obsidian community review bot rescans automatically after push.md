---
note_id: 20260219-2033-200add4b
type: fact
status: active
tags:
- obsidian
- community-plugin
- review
- workflow
scope: project
created_at: '2026-02-19T20:33:15.095122+00:00'
created_by: ai-agent
---

After the initial community plugin submission PR on obsidianmd/obsidian-releases, the review bot scans the plugin repo and emails required/optional issues. To resubmit: push fixes to the plugin repo's default branch — the bot rescans within 6 hours automatically. Do NOT open a new PR on obsidian-releases. Do NOT rebase the submission PR (the reviewer handles that after approval). If you think a required issue is incorrect, comment /skip with a reason on the PR. The bot runs eslint-plugin-obsidianmd with the recommended config — exact parity with local npx eslint src/ using our eslint.config.mjs.

Related:
[[Obsidian community plugin release requirements]]
[[Community review fixes — run lint baseline before editing code]]
[[eslint-plugin-obsidianmd Official Obsidian Community Plugin ESLint Rules]]
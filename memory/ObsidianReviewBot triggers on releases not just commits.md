---
note_id: 20260220-2332-7f570737
type: lesson
status: active
tags:
- obsidian
- community-plugin
- review
- release
scope: project
created_at: '2026-02-20T23:32:34.539471+00:00'
created_by: ai-agent
---

The ObsidianReviewBot that scans community plugin submissions does NOT rescan just from pushing commits to the plugin repo's default branch, despite its message saying 'once you have pushed some changes to your repository the bot will rescan within 6 hours.' After pushing ESLint fixes to main on Feb 19 and waiting 4+ days with no rescan, creating a new GitHub Release (1.0.2) was the fix. The bot's scan links point to the specific commit tagged in the latest release (e.g., 1140e41 for 1.0.1), confirming it keys off release tags. Workflow: fix code → bump version in manifest.json, package.json, versions.json → npm run build → create GitHub Release with main.js, manifest.json, styles.css attached → bot rescans within 6 hours.
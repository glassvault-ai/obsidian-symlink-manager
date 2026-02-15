---
note_id: 20260215-1717-426df3d4
type: decision
status: active
tags:
- vault-conventions
- metadata
- status
- workflow
scope: project
created_at: '2026-02-15T17:17:35.487266+00:00'
created_by: ai-agent
---

The status field in vault note frontmatter tracks whether a note reflects current reality. Keep it lightweight — only 4-5 values, no complex workflows.

For facts and lessons:
- active — still accurate and relevant (default, most notes stay here permanently)
- outdated — no longer true due to refactoring, tech changes, or deprecation

Facts and lessons are statements about reality. They're either still true or they're not. Most never change status.

For decisions:
- active — decided but not yet built
- implemented — built and in the codebase
- superseded — replaced by a different decision

This is where status adds the most value. It distinguishes 'this is how it works' (implemented) from 'this is what we plan to do' (active). When a decision is superseded, link to the replacement decision in the note body.

For review findings (code review, audit, etc.):
- active — open finding, not yet addressed
- resolved — fixed in the codebase

When to update status:
- After implementing a decision, flip it to implemented
- After fixing a review finding, flip it to resolved
- When refactoring makes a fact wrong, flip it to outdated (or just delete it)
- When replacing a decision, flip the old one to superseded and link the new one

Don't over-maintain. Status is metadata for filtering and context, not a project management system. If a note is still useful when you read it, it's probably fine as-is.
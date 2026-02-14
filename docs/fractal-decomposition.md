# Fractal Decomposition — How to Write Good Knowledge Notes

## The Core Principle

Notes carry the WHAT and WHY. You figure out the HOW.

"Atomic knowledge notes don't need to eliminate all decisions. They need to eliminate the decisions that require someone else's context: the product thinking, the architectural rationale, the 'we tried X and it didn't work because Y.' Engineering decisions can be made by the implementing agent. Product decisions cannot. The notes carry the product decisions."

## What Good Notes Include

- What a component does and why it exists
- How it connects to other components (dependencies, data flow)
- Safety boundaries and constraints (what NOT to do)
- The reasoning behind architectural choices
- Gotchas a future agent would waste time on without knowing

## What Good Notes Never Include

- Function signatures, variable names, or pseudocode
- Exact test cases or error message strings
- Implementation details that go stale when someone refactors
- Restatements of the plan doc

## The Test

If an agent with zero prior context can read your notes and build from them without asking product questions, the notes are good enough. If the agent would need to ask "should this be X or Y?", the notes aren't deep enough yet.

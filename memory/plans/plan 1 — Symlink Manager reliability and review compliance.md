# Plan: Symlink Manager reliability and review compliance

**Date:** 2026-10-30
**Project:** Symlink Manager (`/Users/dev/code/obsidian-symlink-plugin`)
**Branch:** `feature/symlink-manager-reliability`
**Base:** `9a94ef71de8d75adc2f103fec4eff15d1ef5d0c5` (published 1.0.2 code is unchanged at this base)
**Tags:** plan
**Mode:** Autonomous through Phases 0–5. Core design/defaults approved. STOP before executing Wrap-up; final review is required.

## Implementation status

Phases 0–5 are implemented on the feature branch. Phase commits through Phase 4 are dfea2d3, f31eac9, 3073eb0, d7e39fb and 5d9f083; Phase 5 carries packaging, final regression coverage and the validation ledger. The candidate API floor resolved to 1.2.3 after checking newly used controls. The persistence contract includes a separate durable initialization marker so loss of the entire snapshot directory cannot silently reimport legacy settings. Root identity binding and post-open modal-window binding were strengthened during final validation.

Local validation is recorded in VALIDATION.md: 95 passing tests, two native-platform skips, typecheck success, zero lint errors with three documented compatibility warnings, and zero reported dependency vulnerabilities. Remaining native GUI/platform/device gaps, pending provenance execution and unknown owner-dashboard eligibility remain explicit gates. Release metadata intentionally remains blocked until a separately approved new version/mapping is selected. Existing main ref and protected ignored artifacts remain unchanged.

An authorized corrective round after Phase 5 preserves last-readable entries and observed health when the initialization marker is missing/invalid, while keeping all recovery authority read-only. It tightens stale-control evidence, documents/tests command snapshot semantics, and explicitly reproduces the marker-first full-wipe operating limit without changing first-import UX. Original c7b56c59 candidate/evidence remains preserved; the correction is a separate commit/candidate for one corrective review.

The first native disposable-vault add exposed a Modal selection-field collision. The authorized narrow correction renames plugin-owned lifecycle fields in all affected modal subclasses and adds base-field-ownership regressions. Existing settlement/lifecycle behavior is preserved. The corrected candidate is packaged separately at cb32328006e1dab687dc575da58a89d1abcf52ef. Prior candidates and a copy of the failed fixture state are preserved. Only the disposable vault subsequently received the corrected assets for the bounded native run.

The corrected candidate passed bounded native macOS smoke on Obsidian runtime 1.14.5 (installer bundle 1.11.7): real picker add/read, settings and command toggles, rename, removal cancellation/confirmation, enabled reload and removed-state reload. A temporarily unavailable fake source retained desired enablement and pointer identity; return plus Refresh recovered. A foreign pointer to fake source-B survived Refresh and disable with unchanged inode/target while desired disabled state was saved. All three sentinel hashes remained unchanged. Read-only verification validated all 18 recorded snapshot checksums and current slots 17/18; latest revision 18 is empty with no pending operation and no managed pointer remains.

The unsuccessful focus attempt labeled renamed-from-settings is not counted as a rename pass; rename-after-field-press is the successful observation. Likewise, foreign-pointer-disable-refused records refusal to unlink the foreign pointer while saving disabled intent. Success followed an explicit app reload; an earlier Cmd-R attempt did not establish one. The final Console view is not a continuous log. Candidate source identity remains cb323280; this later ledger update changes documentation only, with no new build or suite run.

Minimum-version/second-Mac GUI acceptance, broader popout/focus/cancellation, native real-directory conflicts, Windows/Linux/UNC/removable volumes and hardware power loss remain gates. Full metadata-wipe safety is not claimed; the known legacy-reimport limit, release version mapping, provenance execution and owner-dashboard eligibility remain unresolved.

**Wrap-up has not been executed. Release/install preparation is authorized by the bounded checkpoint below; external publication and live replacement remain held for readiness review.**

## Purpose

Preserve users' mappings and source data when folders disappear, filesystem state changes, or persistence fails. Replace inconsistent checks with a shared state, identity, containment and recovery mechanism, then resolve the actionable public review findings and correct support claims. The public directory's distribution decision remains a separate owner-dashboard investigation.

## Authorization and operating boundary

- Work on the feature branch in the existing checkout; main remains at the base commit. Do not create another worktree or switch branches without checking the current instructions.
- The older development installation reads this checkout's ignored `main.js`; `data.json` also belongs to existing local use. Never overwrite either. Preserve their recorded baseline hashes, and never inspect or operate on any paths contained in real settings. Candidate builds must use memory or an explicitly isolated output directory. No existing `npm run build` or watch command may run while it targets checkout-root `main.js`.
- All filesystem experiments use newly created disposable roots, with separate vault, source and outside-destination sentinels. No real vaults, real source folders, live plugin replacement, app reload of a live vault, credentials changes or services changes. A UI test may run only in an isolated disposable vault/profile whose root and fixture paths have first been verified.
- No agents are spawned by this builder. The supervisor coordinates independent review and any native-platform runs.
- No push, merge, release/version publication, artifact upload, authenticated directory mutation, new submission, or live replacement is included. CI definitions may be prepared, but remote execution and release assets/attestations await review and authorization. Implementation does not establish directory eligibility.
- This plan and project memory must be suitable for the public repository: architectural facts, evidence and rationale only. No personal source paths, session identifiers, private coordination history, copied live settings, or audit fixture outputs belong in commits.
- Execute Phases 0–5 without notes/phase approval pauses. Commit each phase with relevant memory, including a notes-only Phase 0 commit. Send only material blockers, serious risks/product choices, or final completion to the supervisor. Do not push. STOP before executing Wrap-up.

## Design

### One model for user intent, observed health and recovery

Persist versioned entries with stable IDs, display/source paths, a validated relative destination and simple basename, desired enablement, and evidence needed to recognize the expected link. Observe health separately: matching link, absent link, unavailable source, source is not a directory, permission/I/O failure, occupied real path, foreign link, invalid record, or pending recovery. An enabled preference is never evidence that a link exists.

Legacy 1.0.2 active values migrate to desired enablement. Missing sources do not remove entries or erase that intent. On startup and explicit Refresh/Retry, safely reconcile desired state when the source and destination become verifiable. No automatic polling or mount watcher is added. A disabled entry is kept disabled, including when a matching orphan pointer is discovered. Unknown errors and conflicts preserve both records and filesystem state.

Malformed individual legacy records are quarantined with their raw recoverable value and a reason; valid records can be reviewed. Ambiguous identities such as duplicate IDs quarantine the affected set rather than picking an arbitrary winner. Malformed top-level JSON, unsupported schemas or untrustworthy recovery state open a read-only recovery view. Do not silently replace bad data with defaults. First installation alone receives fresh independent defaults.

### Path safety and identity are shared requirements

All add, restore, enable, disable, rename, remove and health operations use the same checks. Preserve selected paths for display; use successfully resolved physical paths and filesystem identity for comparison. A source must be an accessible directory. Use device/inode evidence for simultaneous comparisons where reliable, but never make volatile device/inode values the sole persisted identity across remounts or restarts. Resolve the actual vault root, even if the root itself is reached through an alias. Require destinations lexically beneath it and reject descendant symlink/junction ancestors, so choosing a loaded folder cannot redirect writes into an external source. Reject dot/dot-dot names, traversal, absolute vault-relative paths, malformed strings and platform-invalid/ambiguous names. Never use a failed realpath probe as permission to act on a guessed path.

For accessible managed source roots, reject equal identities and ancestor/descendant overlaps with the vault and with other configured source roots; do not simply lowercase paths on every platform. Retain unavailable records and their previously verified identities, reserve conflicting configured destinations, and defer uncertain overlap decisions. Recheck safety before applying queued operations and when sources return. Existing unsafe configurations become conflicts; do not automatically remove their links as a repair.

Recognize expected links by their link text resolved relative to the link's parent, canonical target where accessible, and available identity evidence. Keep enough normalized link information to recognize a genuine dangling link. Legacy relative links and Windows junction representations must be handled explicitly. An arbitrary symlink occupying the remembered name is not owned merely because it is a symlink. Creation must retain no-overwrite semantics even if preflight passed. Removal uses unlink on the verified pointer only, never recursive deletion or removal of a resolved source directory.

A foreign link or real directory can be left untouched while the user explicitly forgets its settings record. Normal Remove should remove a verified managed pointer and its record; if unlink fails, retain the entry and surface the error. Forget is a separate, clearly described metadata-only choice, not silent adoption/replacement.

These checks cover the managed roots and destination ancestry, not every nested symlink within arbitrarily large source trees. Do not traverse source contents to promise global graph acyclicity. Document the host's restrictions and residual risk from unmanaged nested links. Rechecks also do not provide a portable atomic guarantee against another process changing a leaf/ancestor between inspection and mutation. Detect available drift, fail closed on ambiguity, and state the remaining external-race limit accurately.

### Durable intent precedes filesystem mutation

Use a single serialized mutation queue shared by UI, commands, startup reconciliation and recovery. Operations are idempotent requests for a desired state, not blind toggles. Persist intent and an operation record before touching links; persistence failure at that boundary causes no filesystem mutation. The record carries the before/after destinations, expected link identities and enough state to decide whether a later startup should finish, retain a recoverable conflict, or acknowledge an already-completed operation.

Storage contract: keep an exclusively created initialization marker beside the recovery directory, flushed before initialization, and two alternating, versioned and checksummed snapshots of plugin-owned metadata with monotonically increasing revisions. Each replacement is written completely to an exclusive temporary metadata file, flushed and atomically replaced within the plugin's private storage directory; validate the committed snapshot before allowing link mutations. Preserve the last valid generation. All storage paths are confined to explicitly verified plugin-owned metadata locations, distinct from managed symlink destinations. Metadata replacement may use atomic rename; managed-link rename must never use an operation that can overwrite another destination.

Read existing `data.json` through the host for one-time migration and preserve it as recovery evidence; new snapshots become authoritative after a verified migration commit. Do not claim host `saveData` alone provides a transaction with the filesystem. Do not silently downgrade to stale legacy settings once snapshots exist. If a damaged snapshot or schema makes the latest state ambiguous, show recoverable last-good data read-only rather than replaying older intent automatically. Document downgrade/export implications. This adds a storage component, but makes persistence-failure recovery testable rather than relying on a successful Notice or in-memory rollback.

A post-mutation persistence failure leaves durable pending intent and a visible pending/error status; stop subsequent mutations until persistence can recover. On restart, inspect expected paths without overwriting foreign nodes. For disable/remove, already-absent is idempotent success. For creation, an already-matching link is idempotent success. For rename, inspect both expected locations: new-only completes the rename; old-only preserves the old name and reports an interrupted/reverted rename; neither retains recoverable metadata rather than pretending active; both or any foreign occupancy requires explicit recovery instead of deletion by guesswork. On an ordinary rename creation failure, retain the existing best-effort rollback to the old link; if rollback fails, reflect actual missing health and preserve the pending record. Recovery must also honor a user's later explicit disable/removal so old intent cannot resurrect a link.

Stage bulk actions through the same durable boundary and report per-entry results. One queue and revision checks prevent within-instance stale saves; detect observed outside metadata changes and stop rather than overwrite them. This is not a new multi-process or cross-device synchronization protocol. Treat source paths and plugin metadata as local settings; preserve imported unavailable entries, block mismatched recorded environment context, and document that synchronizing these files across machines is unsupported. Do not infer permanent absence from a different machine's path layout.

### UI, lifecycle and performance

Render desired state, observed health and recovery errors distinctly. Controls request an explicit enabled/disabled value; a visible settings tab subscribes to model changes so commands, bulk actions, rename rollback and delayed health probes cannot leave stale switches. Revalidate entries at action time, not solely when the picker opens. Prevent duplicate submissions while the relevant operation is pending; errors must produce an actionable message and a retry/recovery route.

Retain the modal close-before-selection deferral and single promise settlement. Choose a supported window timer appropriate to the modal context; exercise popout close/focus changes. Cancel pending pickers and reject new work after plugin unload, while preserving links on unload as before. If unload interrupts an operation already durably admitted, leave a recoverable intent; do not start another operation from a late picker callback.

Use asynchronous filesystem probes and mutations on the desktop path. Keep mutation ordering serialized, bound parallel health work, discard stale observations, and avoid full-source recursive scanning. Slow storage should report pending/error state without falsely declaring absence. Performance and lifecycle findings originally marked unverified remain investigation/test targets until actual evidence exists.

### Compatibility, support and provenance

Propose Obsidian 1.1.0 as the minimum API floor for the existing tooltip call, subject to checking every newly selected API. Prefer compatible window handling rather than introducing a newer API solely for convenience. An API-floor scan and actual disposable-host verification determine the claimed minimum; if native hosts are unavailable, report the exact gap instead of claiming it tested.

Keep published 1.0.2 version history intact. Correct the candidate manifest floor and document the required next-release versions mapping; the final release number and version bump remain with the supervisor's release decision. Candidate artifacts must be labeled non-release and cannot replace historical 1.0.2 downloads. Update the lint/API declarations deliberately with a locked toolchain; do not infer current review compliance from the old 0.1.9 linter.

Prepare a repeatable candidate build and a reviewed CI attestation workflow that attests the exact JavaScript and stylesheet bytes it would upload. No workflow runs, uploads or publication happen under this plan. Offline checks can establish build equality and workflow structure; they cannot make the existing public assets attested. Verify real attestations only after a separately approved remote run.

Correct README promises about current installability, automatic cleanup, nested placements, global loop prevention, universal edit/move support, synchronization and mobile support. Explain the desired-state/retry behavior, conflicts/Forget, recovery files and downgrade limits. Preserve the direct-editing semantics of symlinks. Separate implemented cross-platform paths from native-platform validation actually completed.

## Scope traceability

| Audit finding | Implementation phases | Required evidence |
| --- | --- | --- |
| C1 unavailable mappings lost; unlink failure ignored | 1, 2, 3 | Offline/reconnect and permission-failure restart tests preserve records and sentinels; desired state survives |
| C2 aliases, target overlaps and cycles accepted | 1, 3 | Alias-to-vault, aliased duplicate, parent/child pairs, linked destination and re-enable regressions |
| C3 dot/dot-dot/traversal and physical destination escape | 1, 3 | Every mutating route rejects unsafe names/paths; inactive rename cannot unlink parent; outside sentinels unchanged |
| C4 foreign pointers treated as owned | 1, 2, 3 | Matching/foreign/dangling/relative/junction cases; explicit Forget touches metadata only |
| C5 save failures, stale durable state and resurrection | 2, 3 | Failure at each persistence/mutation boundary, restarts, interrupted rename and delayed concurrent requests |
| C6 inactive rename orphan, metadata-only bulk state, stale toggle UI | 2, 3 | Ghost links, missing active links, desired-state bulk requests, commands while settings open, rollback rendering |
| C7 error classification, invalid settings, source file replacement | 1, 2, 3 | Invalid-record quarantine, invalid top-level recovery, EACCES/EPERM/I/O vs ENOENT, file-target rejection |
| B1 tooltip/minimum API mismatch | 4, 5 | Accurate candidate manifest floor, current API scan, disposable minimum/current host settings render; release mapping handoff |
| B2/B3 modal window timers | 4 | Deferred choose/cancel order, once-only settlement, focus/popout close coverage |
| B4/B5 missing main.js/styles.css attestations | 5 | Locked reproducible build and workflow definition; remote attestation verification remains approval-gated |
| README and claimed support | 4, 5 | Text matches behavior and native test matrix; no unsupported availability/safety claims |
| Distribution unknown | supervisor investigation; phase 5 handoff | Owner dashboard identifies eligibility reason; no claim local fixes made the listing installable |

### D-section disposition and investigation register

| Existing evidence or target | Handling |
| --- | --- |
| Rename double-failure rollback; awaited startup persistence; accurate bulk counts | Preserve as regressions in phases 2/3; add observed-health/pending state without discarding the existing fixes |
| Existing toggle-on realpath comparison; inactive delete; real-directory preservation | Carry into shared identity engine and regression-test in phases 1/3 |
| Broken-link lstat removal; dangling destination preflight | Distinguish absent from occupied dangling pointer, improve errors and preserve no-overwrite in phase 1 |
| Links persist after unload | Preserve and test in phases 3/4 |
| Cross-device drag/move and sync limitations; mobile restrictions | Documentation/support boundary in phase 4; no attempt to implement unsupported host moves or synchronization |
| Windows junctions, UNC/network volumes, case-only rename, long paths, reserved names; Linux | Platform matrix in phase 5. Pure path tests are not native filesystem evidence. Missing native runs stay explicit release gates |
| Synchronous renderer probes and slow volumes | Async/bounded I/O in phases 1/3; injected delay responsiveness test in phase 4; real network-volume performance remains unverified unless measured |
| Picker completion after unload | Lifecycle guard plus deterministic delayed-picker test in phase 4; actual host behavior labeled separately |
| Electron remote availability | Verify folder picker in disposable supported hosts in phase 4; retain current path unless a compatibility failure is reproduced; no speculative API rewrite |
| External leaf/ancestor races and arbitrarily nested unmanaged cycles | Drift tests and documented residual limits in phases 1/5; no universal atomic/global-graph safety claim |
| No GitHub user issues in audit | No issue-based reproduction claimed; no public issue/comment created |

## Edge Cases

| Situation | Required behavior |
| --- | --- |
| Enabled source temporarily absent/inaccessible | Keep entry and desired intent; distinguish absence from permissions; no automatic forget; retry safely at startup/Refresh |
| Source returns at a different canonical location or alias is repointed | Revalidate and report conflict rather than redirecting a managed pointer silently; a changed mount/device number alone is not proof of a different source |
| Vault reached through an alias | Canonicalize vault root; reject symlink ancestors below that root as managed destinations |
| Disabled entry still has expected link | Reconcile safely to disabled; rename/remove cannot abandon the old pointer |
| Expected path is a foreign link or real directory | Preserve filesystem contents; show conflict and metadata-only Forget |
| Interrupted rename or failed rollback | Inspect both expected paths, show observed health and pending state; never report active solely from metadata |
| Desired remove persisted but filesystem already absent | Complete idempotently; do not recreate on next startup |
| Save fails before mutation | No link mutation; retain last usable state and surface error |
| Final save fails after mutation | Keep recovery intent; pause additional mutations; restart reconciles actual state without resurrection |
| Corrupt/unsupported newest snapshot | Preserve evidence; read-only recovery, no automatic replay of older intent |
| Invalid legacy record or duplicate ID | Quarantine affected records, never operate on their paths; valid entries are not silently discarded |
| Picker result arrives after unload | Promise settles safely and no new mutation is admitted |
| Multiple rapid desired-state requests | Serialize and use explicit requested state; stale UI results cannot reverse later intent |
| Unsafe preexisting nested/overlapping configuration | Show conflicts and preserve data; never auto-delete source-tree pointers to enforce the new policy |
| External process changes an ancestor/leaf mid-operation | Recheck and stop on detectable drift; document non-atomic OS limit, never claim perfect exclusion |

## Review choices and proposed defaults

The approved behavior choices are: (1) retain desired enabled state and retry at startup/explicit Refresh without polling; (2) reject destinations below symlink ancestors and overlapping configured source roots; (3) provide a separate metadata-only Forget action for conflicts; (4) adopt durable plugin-scoped recovery snapshots with legacy import and conservative corruption handling; (5) use 1.1.0 as the proposed API floor pending the compatibility checks. Do not substitute another architecture silently.

Native Windows/Linux and minimum-version UI availability, the eventual release number, actual attestation execution, and owner-dashboard eligibility are external validation/publication gates. They do not authorize live troubleshooting or broaden the build into a sync system.


## Build Method: Fractal Decomposition

This build uses the fractal decomposition method. Notes carry the WHAT and WHY. The implementing agent figures out the HOW.

### Writing Good Notes

- What a component does and why it exists
- How it connects to other components (dependencies, data flow)
- Safety boundaries and constraints (what NOT to do)
- The reasoning behind architectural choices
- Gotchas a future agent would waste time on without knowing

Notes should never include function signatures, variable names, pseudocode, or implementation details that go stale when someone refactors. Short code snippets for clarity are fine. This same principle applies to the plan doc itself — implementation details baked into the plan can mislead the implementing agent. Describe WHAT should happen and WHY, not HOW to code it.

**In a mature vault, notes are gap-fill.** Query first. The vault may already explain how a system works, what was tried, or why a design was chosen. Writing a duplicate note is worse than writing no note — it creates conflicting sources of truth.

### The Levels

**Level 1: This document.**
The full picture. Covers vision, scope, features, and build phases.

**Level 2: System notes.**
Atomic vault notes covering the systems and architecture this feature touches. Write per concept — not one per build area. Write as many as needed. General enough to orient any fresh agent, specific enough to scope the work.

**Level 3: Implementation notes.**
A level deeper — specifics that matter. Atomic, one topic per note. The WHAT and WHY for each piece. The implementing agent reads these and knows exactly what to build without asking product questions. Engineering decisions (naming, patterns, structure) belong to the implementing agent.

### The Test

If an agent with zero prior context can read the notes and build from them without asking product questions, the notes are good enough.

---

## Build Phases

### Execution constraints applying to the template below

The template's unrelated session/device reading applies only to session/device work; this plugin build does not change those systems. No tool installation changes are needed to protect running services. Branch setup has already been completed safely; verify the branch and clean/known diff before Phase 0 instead of recreating it.

The existing project vault is the only write destination. `vault status` must identify this repository before any note write/process. Do not initialize another vault or alter global links. Query before writing; use the existing note quality standard, atomic declarative titles, Related links, and typed `vault connect` relationships where relevant. Update contradictory historical safety/persistence notes instead of multiplying competing architecture descriptions. Record new constraints when learned, with relevant paths and stable line references, not task-completion logs. Public notes must contain no personal installation data.

Wikilink commands shown in the template must be scoped during execution to this project and the dedicated new-notes folder (`--vault /Users/dev/code/obsidian-symlink-plugin --folder reliability`), with a dry-run inspected first. Review links in individually updated root notes explicitly. Do not run a global or unscoped maintenance pipeline, or stage incidental maintenance churn. If an index lock blocks work, leave its holder alone, report the exact error, and pause the affected step.

Create only the needed project memory subfolders. Read the original audit and the immutable Desktop evidence privately; port reproductions into clean repository tests using synthetic paths. The original harness asserts buggy behavior and must not be copied as a passing correctness suite. Capture/check ignored live artifact hashes before and after every phase. Build output confinement must be verified before invoking any build script. Keep a private checkpoint log outside the public repository for hashes, supervisor messages and unavailable environment details.

Phase 0 is a notes-only commit. Continue through every phase autonomously, committing per phase. The user explicitly overrides the autonomous template’s push and routine notify instructions: do not push or request checkpoint approvals. The final STOP occurs before Wrap-up execution.


### Preamble — Orientation & Setup

Complete these steps before writing any code:

2. **Orient top-down before building.** Run vault queries in this order — vision first, then narrow down:
   a. **Vision sweep:** Query for the product's overall vision and mission — what are we building and why does it matter? (e.g., `vault query "Symlink Manager vision mission what we're building"`)
   b. **Architecture sweep:** Query for the system architecture that your feature lives inside — how does the broader system work? (e.g., `vault query "Symlink Manager system architecture overview"`)
   c. **Feature sweep:** Query for the specific feature or system you're about to build — what exists, what was tried, what was decided? (e.g., `vault query "symlink identity containment durable recovery"`)
   d. **Read key notes in full.** For any note that looks foundational (architecture overviews, design decisions, post-mortems), use `vault read "<title>" --full` and follow wikilinks in the Related section.
   e. **Required reading for GlassVault session/device features:** Read [[V5 session architecture — corrected multi-device design]] in full (`vault read "Multi-device terminal architecture — data flow diagram" --full`). This is the system's north-star architecture — it defines the Session Service as the multiplexer hub, the Server as just another client, and the direct socket path for desktop. Any work touching sessions, chat delivery, or multi-device connectivity must align with this diagram.

   You're building a mental model of WHERE your work fits before you think about WHAT to build. If you skip this and jump straight to implementation queries, you risk building correct code that doesn't connect to the product's larger purpose. Feel free to explore the codebase after this sweep — but vault context first. (If this is a fresh project with an empty vault, skip to Phase 0.)
3. Check your current branch with `git branch --show-current`. If you are on `main`, or on a branch that looks like it belongs to other work, **create a new branch** matching the one specified at the top of this plan (`feature/symlink-manager-reliability`). If you're unsure, ask before proceeding.
4. Stop to let the orchestrator (or user, if no orchestrator) know if you have any questions before beginning the implementation.
5. **Notify:** If orchestrator: `gv-agent message <orchestrator-identity> "Preamble complete. [questions or 'ready to proceed']"`. If no orchestrator: `/ping`.

---

### Phase 0 — System Notes (Level 2)

Write Level 2 system notes covering the architecture and context an implementing agent needs. These orient any fresh agent on how things work today.

**Workflow:**
1. Write Level 2 system notes ONLY for concepts not already covered by the vault queries in the Preamble. If existing notes need updating, update them instead of creating duplicates
2. Run wikilinks: `vault process --yolo --wikilinks`
3. Commit to `feature/symlink-manager-reliability` locally; do not push (explicit authorization boundary).

---

### Phase 1: Shared path safety, schema and isolated verification foundation

Establish the shared observation/validation boundary and regression harness before changing plugin orchestration. Likely areas are `src/symlink-manager.ts`, `src/types.ts`, focused new engine modules, tests, and build-output configuration. Keep the existing entrypoints behavior unchanged until integration so the new guarantees are tested in isolation.

**Workflow:**
1. Query the vault for Phase 1 topics; read relevant notes and Related links, retrying empty searches with `--threshold 0`.
2. Write/update atomic Level 3 gap-fill notes before implementation; record new constraints when learned.
3. Run reviewed project/folder-scoped wikilinks, inspect the diff and connect related notes. Leave index lock holders alone; report any affected-step blocker.
4. Build this phase on the feature branch using only synthetic fixtures and isolated candidate outputs.
5. Run the phase validation and relevant existing tests, typecheck and lint. Verify source/outside sentinels and protected live artifact hashes. Flutter/Rust checks do not apply.
6. Commit Phase 1 and its relevant memory with explicit paths; do not stage unrelated changes or push.
7. Continue to the next phase without checkpoint approval. Escalate only material blockers, serious new risks or product choices.

**Scope:**

- Create synthetic fixture helpers with vault/source/outside sentinels and guarded filesystem adapters; test cleanup never follows cyclic links. Preserve existing source-content and real-directory safety checks.
- Define versioned entry validation, quarantine/error vocabulary, link identity, source directory checks, canonical root overlap and lexical/physical destination containment. Use asynchronous probes with typed error outcomes.
- Reject dot/dot-dot names, malformed saved paths, descendant link/junction destinations and occupied dangling paths. Separate identity recognition of a dangling expected link from source availability.
- Introduce safe build output selection that cannot target checkout-root main.js/data.json or a live installation. Run builds in memory or a newly allocated candidate directory; no default development watcher.
- Refresh only the needed locked test/lint toolchain after checking package scripts; no unnecessary dependency installation or global tooling changes.


**Validation:** Correctness regressions for C2/C3/C4/C7, broken-link no-overwrite and old directory-preservation behavior. Verify every sentinel and artifact hash. Typecheck/lint new modules; tests cover aliases, parent/child overlaps, malformed records, case semantics, relative links and injected fs errors. Native junction semantics remain explicitly pending.

**Does not touch:** Live plugin wiring, metadata migration on real settings, new UI, releases, or remote CI execution.

---

### Phase 2: Durable desired state and recoverable operation coordinator

Implement the persistence boundary, legacy migration and serialized operation/recovery semantics behind injectable filesystem and storage interfaces. Likely areas are focused storage/coordinator modules and types; no live settings are loaded for tests.

**Workflow:**
1. Query the vault for Phase 2 topics; read relevant notes and Related links, retrying empty searches with `--threshold 0`.
2. Write/update atomic Level 3 gap-fill notes before implementation; record new constraints when learned.
3. Run reviewed project/folder-scoped wikilinks, inspect the diff and connect related notes. Leave index lock holders alone; report any affected-step blocker.
4. Build this phase on the feature branch using only synthetic fixtures and isolated candidate outputs.
5. Run the phase validation and relevant existing tests, typecheck and lint. Verify source/outside sentinels and protected live artifact hashes. Flutter/Rust checks do not apply.
6. Commit Phase 2 and its relevant memory with explicit paths; do not stage unrelated changes or push.
7. Continue to the next phase without checkpoint approval. Escalate only material blockers, serious new risks or product choices.

**Scope:**

- Implement the two-generation plugin-scoped metadata contract, checksum/schema validation, committed intent before mutation, conservative read-only recovery and legacy data import without modifying the legacy file.
- Model desired state independently of observations, retain unavailable mappings, and add idempotent create/enable/disable/remove/rename outcomes and metadata-only Forget.
- Serialize all writes and operations; detect stale revisions and block subsequent mutations after an unresolved persistence failure. Keep bulk outcomes per entry.
- Preserve best-effort rename rollback; represent rollback failure honestly and recover both old/new paths without overwriting or deleting foreign nodes.
- Specify reconciliation for every crash boundary, ambiguous/corrupt snapshot, unsupported schema, unavailable source, stale inactive pointer and imported environment mismatch.


**Validation:** Inject failures at every metadata write/flush/replace/verify and link operation boundary; restart a fresh coordinator against only persisted fixture files. Assert no resurrection, lost mapping, silently active missing link, orphaned renamed pointer, or foreign node mutation. Run existing Phase 1 safety suite, delayed-save/revision tests, migration and checksum/corruption tests. Preserve all sentinel/hash invariants.

**Does not touch:** Loading actual data.json, moving live settings, cross-device synchronization, arbitrary foreign-pointer adoption, or source-file operations.

---

### Phase 3: Plugin integration and consistent user-visible state

Route startup, commands, pickers, settings, rename and bulk actions through the approved coordinator; remove obsolete mutation paths. Likely areas are `src/main.ts`, `src/settings.ts`, `src/modals.ts` and the engine adapter.

**Workflow:**
1. Query the vault for Phase 3 topics; read relevant notes and Related links, retrying empty searches with `--threshold 0`.
2. Write/update atomic Level 3 gap-fill notes before implementation; record new constraints when learned.
3. Run reviewed project/folder-scoped wikilinks, inspect the diff and connect related notes. Leave index lock holders alone; report any affected-step blocker.
4. Build this phase on the feature branch using only synthetic fixtures and isolated candidate outputs.
5. Run the phase validation and relevant existing tests, typecheck and lint. Verify source/outside sentinels and protected live artifact hashes. Flutter/Rust checks do not apply.
6. Commit Phase 3 and its relevant memory with explicit paths; do not stage unrelated changes or push.
7. Continue to the next phase without checkpoint approval. Escalate only material blockers, serious new risks or product choices.

**Scope:**

- Integrate validated legacy loading/migration, durable startup reconciliation and explicit Refresh/Retry without destructive missing-source cleanup.
- Replace toggle inversion with requested enabled state; reconcile expected existing links regardless of stale active flags and reserve configured identities/destinations.
- Render desired state, health, conflicts and pending recovery separately; refresh settings from model changes. Catch all user-action promise failures and make recovery choices actionable.
- Integrate identity-aware removal, Forget, state-safe rename, accurate bulk counts and existing rollback behavior; no old helper may bypass validation.
- Enforce one admission/queue boundary for commands and UI, revalidating results of stale pickers before any mutation.


**Validation:** Run every C1-C7 original reproduction with corrected expectations against compiled source and candidate bundle in mocked hosts. Add complete workflow tests: reconnect, copied invalid paths, pending persistence, ghost links, bulk drift, command changes while settings visible and rollback refresh. Exercise a disposable desktop vault when available; label mocks versus actual UI evidence separately.

**Does not touch:** Any live Obsidian vault/profile/settings, existing main.js/data.json, plugin deployment or manual repairs of a user configuration.

---

### Phase 4: Modal lifecycle, responsiveness and compatibility/support corrections

Address B1-B3 and D's lifecycle/performance targets, and align the README with implemented behavior and observed host constraints. Likely areas are modals/settings/plugin lifecycle, manifest, README and targeted tests.

**Workflow:**
1. Query the vault for Phase 4 topics; read relevant notes and Related links, retrying empty searches with `--threshold 0`.
2. Write/update atomic Level 3 gap-fill notes before implementation; record new constraints when learned.
3. Run reviewed project/folder-scoped wikilinks, inspect the diff and connect related notes. Leave index lock holders alone; report any affected-step blocker.
4. Build this phase on the feature branch using only synthetic fixtures and isolated candidate outputs.
5. Run the phase validation and relevant existing tests, typecheck and lint. Verify source/outside sentinels and protected live artifact hashes. Flutter/Rust checks do not apply.
6. Commit Phase 4 and its relevant memory with explicit paths; do not stage unrelated changes or push.
7. Continue to the next phase without checkpoint approval. Escalate only material blockers, serious new risks or product choices.

**Scope:**

- Use compatible modal-window timers while preserving close-before-choose deferral and single settlement; abort late picker work on unload and leave existing links intact.
- Verify bounded asynchronous health work, stale-result suppression and responsiveness under injected slow/failed storage. Keep mutation recovery consistent across unload.
- Set a truthful candidate API floor after checking tooltip/window APIs and the pinned current lint baseline. Preserve published release-history mappings; document the next-release mapping requirement without publishing a version.
- Correct README statements about reconnects, conflict/Forget, recovery storage/downgrade, current directory availability, nested/overlapping paths, host moves/sync/mobile and native test status.
- Verify Electron folder picker in disposable minimum/current supported hosts if available; change the bridge only if a demonstrated compatibility issue requires it.


**Validation:** Selection, Escape, click-outside, close-before-choose, focus changes, popout closure, delayed picker after unload, unload during a pending journal operation, command/settings concurrency and slow-probe responsiveness. Run current lint/typecheck/API-floor validation and disposable-host nonempty-settings/picker checks. Record unexecuted native/UI cases explicitly.

**Does not touch:** Installing/upgrading a user app, live troubleshooting, changing the published listing, claims that mocked popouts prove native host compatibility, or unrelated UI redesign.

---

### Phase 5: Reproducible candidate packaging, provenance preparation and final evidence

Finish B4/B5 preparation and the platform matrix, then deliver a reviewable candidate and evidence. Likely areas are build/package scripts, CI definitions, test/docs refinements and the final coverage record. This phase does not publish or deploy.

**Workflow:**
1. Query the vault for Phase 5 topics; read relevant notes and Related links, retrying empty searches with `--threshold 0`.
2. Write/update atomic Level 3 gap-fill notes before implementation; record new constraints when learned.
3. Run reviewed project/folder-scoped wikilinks, inspect the diff and connect related notes. Leave index lock holders alone; report any affected-step blocker.
4. Build this phase on the feature branch using only synthetic fixtures and isolated candidate outputs.
5. Run the phase validation and relevant existing tests, typecheck and lint. Verify source/outside sentinels and protected live artifact hashes. Flutter/Rust checks do not apply.
6. Commit Phase 5 and its relevant memory with explicit paths; do not stage unrelated changes or push.
7. Send candidate commit and complete validation/native-platform/gate ledger. STOP before executing Wrap-up.

**Scope:**

- Build candidate main.js/manifest/styles into an isolated directory with a locked toolchain; verify exact source/build correspondence and repeat-build hashes. Do not overwrite the development-linked artifact.
- Prepare a manually gated CI workflow that tests/builds and attests the exact main.js/styles.css outputs; pin actions and scope permissions. Keep publication/upload as a separate approval boundary and do not trigger the workflow.
- Execute available native disposable macOS checks; prepare/run only authorized native Windows junction and Linux cases. Include UNC/network, case-only rename, long paths, reserved names and directory-alias behavior; annotate missing environments instead of substituting string tests.
- Complete a finding-by-finding evidence ledger for C1-C7, B1-B5 and all D targets, distinguishing implemented fixes, preserved historical fixes, reproduced/native tests, fault injection, residual risks and external gates.
- Hand off the candidate API floor/next-version mapping requirement, attestation verification commands and owner-dashboard eligibility checklist. Do not assert the disabled install control is fixed by local work.


**Validation:** Run the full bounded project correctness suite, typecheck/lint and candidate build checks once after final changes. Verify original main branch pointer and ignored artifact hashes. Validate CI definition offline; real attestations and distribution status remain external. Supervisor review decides whether unavailable platform/UI runs block final sign-off; never call those tests passed.

**Does not touch:** Pushes, GitHub workflow execution, remote artifact upload, new attestations on existing public assets, release/version publication, merge, live replacement, new submission, or owner-account changes.

---

### Release/install readiness checkpoint — 1.0.3 preparation

**Scope:** Prepare patch 1.0.3 with manifest/package/lockfile/version-history agreement, a truthful changelog and upgrade/recovery guidance. Keep runtime source identical to native-tested cb323280 and produce a separately identified, reproducible three-asset candidate. Stage manual provenance verification that binds the expected source commit and all three asset hashes before attestation/upload. Inspect only the current installation's metadata shape read-only, then validate relevant first-import behavior with deidentified disposable data. Never follow or operate on saved real source paths during preparation.

**Workflow:**
1. Query/read release and persistence notes, existing plan/skills and current requirements before editing. Record only architectural facts in public memory; keep installation identity/private paths in external evidence.
2. Prepare version 1.0.3 and minAppVersion 1.2.3 mapping, preserving published historical entries. Explain recovery files, full-wipe replay, downgrade risk and native coverage honestly.
3. Read installed legacy settings shape without changing it. Reproduce applicable migration shape only in disposable fixtures; reuse completed correctness/native results where runtime bytes are unchanged.
4. Validate release metadata, dependency-lock agreement, reproducible asset hashes and the manual provenance workflow offline. Verify expected-identity/hash mismatch rejection. Do not trigger CI, upload, tag or publish.
5. Commit bounded preparation with relevant notes; build only to fresh temporary/evidence directories. Verify main and protected ignored artifacts, installed plugin/settings, and prior candidates remain unchanged.
6. Deliver final commit/diffs/hashes, gate status and concrete installation recommendation for readiness review. STOP before push, merge, tag/release, workflow execution, live replacement or actual migration. No new independent review or broad feature work.

**Acceptance and open gates:** 1.0.3 is prepared, not published. Installation after approval must preserve a same-vault backup of old assets/settings and never import another vault's mappings. Minimum-version, second-Mac, Windows/Linux/UNC/removable-volume, broader modal and hardware-loss coverage remain explicitly open. A total wipe of initialization evidence can still replay stale legacy data. Provenance and directory eligibility require separately approved external work. Wrap-up status/archive/merge/push steps remain deferred until installation/merge and final authorization; no plan completion is implied by this checkpoint.

---

### Wrap-up — Post-Implementation

**STOP BEFORE EXECUTING THIS SECTION.** Final supervisor review is required.

Follow the wrap-up skill at `~/.claude/skills/wrap-up/SKILL.md`. Do not reconstruct these steps from this template. Its actions remain subject to the explicit no-merge/no-release/no-live-replacement boundary above; resolve any conflict with the supervisor rather than inferring publication approval.

**STOP.** Wait for sign-off before continuing.

## Completion criteria

Every C1-C7 defect has a corrected-expectation regression and no remaining bypass route; B1-B3 are addressed with documented compatibility evidence; B4/B5 have reviewable reproducible build/attestation preparation with live execution explicitly pending. Source and outside sentinels survive all tests. Desired state, operation recovery and invalid-data handling are observable and documented. Existing working fixes remain covered. Candidate outputs exist only in isolated locations, main and live artifacts are unchanged, and every omitted native/platform/UI check is called out for review. Completion of this build does not imply release approval or directory reinstatement.

## Consulted

The October 30 proposal-only audit and its preserved local harness/results informed this plan. Existing project safety, lifecycle, rollback, persistence and modal-ordering notes were read alongside the autonomous template, builder skill and vault note quality standard. Official Obsidian directory/API/symlink documentation and GitHub attestation documentation were checked during that audit. No additional agents participated in drafting.

Related:
[[Symlink Safety Never Delete the Source Folder]]
[[On-Load Validation of Symlinks]]
[[Handling Deleted Source Folders Gracefully]]
[[Symlink Safety Loop Prevention]]
[[Review fixes implemented from code review]]
[[FuzzySuggestModal onClose fires before onChooseItem]]
[[data.json Persistence via Obsidian API]]
[[Fractal Decomposition Method]]

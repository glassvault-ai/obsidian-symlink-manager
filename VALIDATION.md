# Reliability candidate validation

This is an unreleased candidate. The local run on 2026-10-30 used macOS and Node 24.22.1 with a clean `npm ci --ignore-scripts`. All filesystem operations used disposable vault/source/outside directories with sentinels. No installed plugin, real settings, or live Obsidian UI was loaded.

## Local results

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Zero errors; three compatibility warnings described below |
| `npm test` | 86 tests: 84 passed, 2 native-platform skips, zero failures |
| `npm audit` | Zero reported vulnerabilities at the time of the run; not a guarantee against unknown vulnerabilities |
| `npm run build` | Two in-memory production builds have identical bytes; assets and hashes written to a fresh temporary candidate directory |
| Manual workflow definition | Parsed and checked offline: three OS runners, pinned action commits, restricted permissions, explicit attestation/upload input defaulting to false; not executed |
| `npm run release:check` | Intentionally fails: candidate minimum differs from the published 1.0.2 history; next release version/mapping has not been selected |

Plugin integration tests load the production build configuration, including minification, into a mocked Obsidian/Electron host. Core tests use real macOS filesystem calls plus injected faults. Mocked UI tests do not establish native Electron or Obsidian compatibility. Test fixture cleanup checks sentinels before deleting its own temporary root.

The pinned current linter enables `obsidianmd/no-unsupported-api`. The candidate floor is **1.2.3**, required by the component `setDisabled` APIs, beyond the original tooltip's 1.1.0 requirement. Three unsuppressed warnings remain: `setWarning` deprecation, imperative settings `display` deprecation, and missing 1.13 settings-search definitions. The existing APIs retain support for pre-1.13 hosts; newer settings search is not claimed. Actual minimum/current-host testing remains a gate.

## Finding traceability

| Finding | Implemented behavior and regression evidence | Remaining boundary |
| --- | --- | --- |
| C1: missing sources erased mappings; unlink errors ignored | Desired enablement survives unavailable startup and reconnect. Permission failures preserve records and pending intent. `recovery.test.cjs`: offline/reconnect, bulk unlink failure; `safety.test.cjs`: permission errors. | Real removable/network mount behavior pending. |
| C2: aliases/overlaps bypassed loop and duplicate checks | Shared canonical-root/source checks reject aliases, parent/child roots and linked destination ancestors. Vault identity is bound during a manager's lifetime. `safety.test.cjs`: alias/overlap and repointed-root cases. | No recursive scan of unmanaged source links; external races are not atomically excluded. |
| C3: traversal, dot names and linked destination escapes | Schema validation/quarantine and the shared destination boundary apply to every operation. Inactive dot-dot rename cannot remove a parent pointer. `safety.test.cjs`, startup migration in `plugin.test.cjs`. | Native Windows naming/volume cases pending; portable reserved-name checks are exercised locally. |
| C4: foreign pointers treated as managed | Link text/canonical identity, expected dangling/relative links, foreign and real-directory conflict handling; metadata-only Forget. `safety.test.cjs`, `recovery.test.cjs`. | Native junction test is present but skipped on macOS. |
| C5: failed persistence resurrected links | Serialized desired intent precedes mutation; two validated snapshots plus an initialization marker prevent stale fallback. Fault matrix covers remove/enable/disable before and after mutation at write/flush/replace/verify boundaries, add/rename final-commit failures, interrupted initialization, directory loss, damaged generations, copied-vault state and outside revisions. `recovery.test.cjs`. | Fault injection is not a hardware power-cut test. Windows directory durability differs. Complete removal of every initialization artifact cannot be distinguished from first installation. |
| C6: ghost inactive rename, bulk drift and stale toggle inversion | Rename checks actual old pointer; bulk applies explicit desired values; settings refresh after commands and use callback values. `recovery.test.cjs`, `plugin.test.cjs`. | Actual native settings interactions pending. |
| C7: errors collapsed into absence; malformed data/file sources | Typed health, quarantine, read-only top-level corruption, source-directory validation and file replacement conflict. `safety.test.cjs`, `recovery.test.cjs`. | Real volume error behavior pending; injected errors validate classification, not device timing. |
| B1: inaccurate minimum API version | Manifest floor corrected to 1.2.3 and checked by current API lint. Published `versions.json` history preserved. | Minimum/current native host checks and approved next-version mapping required. |
| B2/B3: global modal timers | Deferred cancellation belongs to the modal's window; ownership rebinds after opening; single settlement and listener/timer cleanup. `lifecycle.test.cjs`: close-before-choose, close/pagehide/unload and changed owner window. | Native popout focus, Escape and click-outside event sequences pending. |
| B4/B5: absent asset attestations | Locked repeatable packaging and manual CI definition attest exact candidate `main.js` and `styles.css` bytes, then upload that same candidate directory. | Workflow never run; existing public assets remain without new attestations. |
| README/support claims | Retained mappings, retry policy, containment, conflicts, recovery/downgrade, sync/mobile and installation limitations documented. | Public eligibility requires owner evidence; local changes do not restore distribution. |

## Historical fixes and investigation targets

| D-section item | Disposition |
| --- | --- |
| Rename rollback | Old-pointer restoration is tested. Double failure retains honest pending/missing health; explicit disable and restart cannot reactivate it. |
| Awaited startup persistence | Open/reconciliation awaits commits. Initialization interruption and copied-vault tests exercise the replacement contract; no host `saveData` transaction is claimed. |
| Accurate bulk counts | Success/failure counts retained; failure test verifies the pointer and recoverable metadata survive unlink denial. |
| Existing realpath toggle check | Generalized into shared identity checks; relative and aliased pointer cases covered. |
| Inactive delete, real-directory preservation | Actual expected pointer is checked regardless of saved enablement; real-directory contents survive Remove/Forget. |
| Broken links and occupied dangling paths | `lstat` identity checks recognize expected dangling pointers and reject occupied foreign destinations; no-overwrite creation retained. |
| Links persist after unload | Preserved. Pending native picker results are ignored; confirmation cancellation leaves links. Unload after durable admission completes/reconciles its intent and rejects later work. |
| Synchronous renderer I/O | Replaced with asynchronous probes/mutations. Injected slow preflight yields to the event loop and cannot admit work after unload. Health work is serial; whole-operation latency at large entry counts and on real slow/network storage is unmeasured. |
| Electron remote bridge | Existing bridge retained. Mock dialog cancellation/late completion tested; no native bridge compatibility failure was reproduced or claimed fixed. |
| Cross-device move, sync, mobile | Documented host/platform limits, not implemented as new features. |
| External path swaps, nested unmanaged cycles | Observable drift is rejected; portable JavaScript path operations cannot exclude every external race. Source trees are not recursively scanned. |
| Issue reports | No user issue was used as reproduction evidence and no public issue/comment was created. |

## Native/platform ledger

| Environment or case | Evidence/status |
| --- | --- |
| macOS local temporary volume | Real symlink create/read/unlink, aliases, containment, relative/dangling pointers, metadata replacement and sentinel preservation passed. |
| Case-only rename | Actual fixture volume reports case aliases. Candidate safely rejects occupied case-only destination and retains old pointer. Case-sensitive-volume success path has not run here. |
| Long destination path | Real nested path exceeding 240 characters passed on this macOS fixture volume. This does not establish Windows long-path policy. |
| Windows junctions | Native test prepared; skipped because host is macOS. No native Windows result. |
| Linux aliases | Native test prepared; skipped because host is macOS. No native Linux result. |
| UNC/network/removable volumes | Not tested. Requires authorized native fixtures; asynchronous fault tests are not substitutes. |
| Obsidian 1.2.3/current desktop GUI | Not tested. No isolated GUI automation host was configured. Nonempty settings, native folder picker, popouts, focus/Escape/click-outside and enable/disable/reload require disposable-host verification. |
| Hardware power loss/full disk/OS-level read-only volumes | Not tested. Logical persistence faults exercised; actual power-cut ordering and device-specific errors remain unverified. |

## Review and release gates

1. Review the candidate and decide the required native Windows/Linux, minimum/current Obsidian, volume and UI coverage before deployment. Missing environments are not passes.
2. Keep a single manager per vault. Revision checks detect observed outside changes but are not a multiprocess lock. Preserve the marker, snapshots, temporary recovery evidence and legacy file before any recovery work. Downgrading can replay stale legacy data; metadata must not be synchronized between machines.
3. Select a new release version and matching `versions.json` entry, then rerun `npm run release:check`. Do not replace published 1.0.2 assets with candidate bytes.
4. Only after separate authorization, run the reviewed CI workflow. Verify downloaded exact assets with `gh attestation verify main.js --repo glassvault-ai/obsidian-symlink-manager` and the same command for `styles.css`. Inspect the attested source commit/workflow and compare SHA-256 values to the approved candidate/tag. Local repeatability alone is not GitHub provenance.
5. The public install control was disabled in the October 30 audit. An owner must inspect entry eligibility and Manifest/Releases/Source/Build review errors before attributing the distribution block. After an approved repair/review, verify both the enabled public control and in-app discoverability. Caution status and historical counters alone prove neither eligibility nor a particular blocker.

No workflow execution, merge, publication, new submission, authentication change, installed-plugin replacement or real settings migration was performed for this candidate.

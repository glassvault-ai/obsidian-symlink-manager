# Reliability candidate validation

This is an unreleased candidate. The local run on 2026-10-30 used macOS and Node 24.22.1 with a clean `npm ci --ignore-scripts`. Automated checks used disposable vault/source/outside directories with sentinels, without loading a live installation or real settings. Subsequent manual testing in a separate disposable Obsidian vault exposed the modal field collision described below.

## Local results

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Zero errors; three compatibility warnings described below |
| `npm test` | 97 tests: 95 passed, 2 native-platform skips, zero failures |
| `npm audit` | Zero reported vulnerabilities at the time of the run; not a guarantee against unknown vulnerabilities |
| `npm run build` | Two in-memory production builds have identical bytes; assets and hashes written to a fresh temporary candidate directory |
| Manual workflow definition | Parsed and checked offline: three OS runners, pinned action commits, restricted permissions, explicit attestation/upload input defaulting to false; not executed |
| `npm run release:check` | Intentionally fails: candidate minimum differs from the published 1.0.2 history; next release version/mapping has not been selected |

Plugin integration tests load the production build configuration, including minification, into a mocked Obsidian/Electron host. Core tests use real macOS filesystem calls plus injected faults. Mocked UI tests do not establish native Electron or Obsidian compatibility. Test fixture cleanup checks sentinels before deleting its own temporary root.

The pinned current linter enables `obsidianmd/no-unsupported-api`. The candidate floor is **1.2.3**, required by the component `setDisabled` APIs, beyond the original tooltip's 1.1.0 requirement. Three unsuppressed warnings remain: `setWarning` deprecation, imperative settings `display` deprecation, and missing 1.13 settings-search definitions. The existing APIs retain support for pre-1.13 hosts; newer settings search is not claimed. A bounded native smoke passed on Obsidian runtime 1.14.5 as detailed below; minimum-version and broader native coverage remain gates.

## Native smoke correction

The first manual add attempt reached the real source and destination pickers but failed when closing the destination modal: `this.selection.attach is not a function`. The original snapshots remained empty at revision 1, no pointer was created, and all fixture sentinels stayed unchanged. Static inspection of the installed Obsidian bundle confirms that base `Modal` owns `selection`, replaces it during open with saved text selection/focus, and consumes it during close. TypeScript's private modifier did not isolate the plugin's same-named field at runtime.

The narrow correction renames the plugin settlement owner to `symlinkSelection` in the folder, toggle and confirmation subclasses. Settlement logic, deferred close-before-choose, timers, cancellation and host focus restoration are preserved. The host mock now reproduces base ownership and the close-before-choose call chain. Six regressions cover all three modals with host selection restoration enabled and disabled; the unchanged candidate failed those tests before the repair. The earlier mock never assigned that host field, which explains the coverage gap.

Candidate **cb32328006e1dab687dc575da58a89d1abcf52ef** subsequently passed a bounded native macOS smoke on **Obsidian runtime 1.14.5**, with installer bundle **1.11.7**. Those versions were separately observed and must not be equated. Native Accessibility/keyboard events drove only a disposable vault with fake sibling sources. The tested `main.js` SHA-256 is `92e0ab9e17e08b831fbd95e26d007d18d8608f83224f46b75e0739589b349f0d`; the candidate's source identity and bytes remain unchanged by this documentation update. Prior candidates and a copy of the failed fixture state remain preserved.

Native evidence in `native-test-report.txt`, `observations.json` and retained screenshots establishes:

- The real source picker and vault-root `/` selection created one expected source-A link; its fake sentinel opened and rendered in Obsidian.
- Settings disable/enable and both directions of the command toggle changed durable desired state and the expected pointer. Rename succeeded; cancelling Remove preserved revision 9 and the same pointer inode.
- An enabled mapping survived an explicit native reload at revision 13 with the same pointer identity. Moving only the fake source away and allowing Refresh to settle reported unavailable while preserving desired enablement, pointer and revision. Restoring it and Refresh recovered matching health.
- A foreign pointer to fake source-B survived Refresh and a disable request with the same target/inode. Disable saved the desired preference as false at revision 14 while refusing to unlink the foreign pointer. Only the test driver cleared that injected pointer before re-enabling the owned mapping.
- Confirmed Remove cleared the owned mapping/pointer; a subsequent native reload retained empty revision 18 without resurrection. All three original sentinels remained byte-identical.

A read-only audit validated all **18 recorded snapshot checksums** and the current adjacent slots (17/18). The latest revision has empty entries/quarantine and no pending operation; revision 17 retains the preceding removal intent as expected. Both old/new pointer names are absent, the temporary source move is restored, and candidate/live-artifact hashes and the main ref match their baselines.

Two evidence labels require care: the first `renamed-from-settings` observation is unchanged state after an unsupported focus attempt; `rename-after-field-press` is the successful rename. `foreign-pointer-disable-refused` means pointer removal was refused, not that saving the disabled preference failed. An initial Cmd-R attempt did not establish a renderer reload; success followed the explicit **Reload app without saving** command. The final Console screenshot is a point-in-time observation, not a continuous error log.

This native pass covers these bounded actions, not every host/platform or recovery case. Minimum-version and second-Mac acceptance, native real-directory conflicts, arbitrary popout/focus/Escape/click-outside behavior, real network/removable volumes and hardware power loss remain untested. Full metadata-wipe/legacy replay remains the documented operating limit. No additional suite or build was run to update this ledger.

## Corrective round

Missing or invalid initialization markers now preserve visibility of the newest individually validated snapshot and observed health, while keeping the manager read-only. Startup and Refresh never treat those snapshots as mutation authority, call legacy import, repair the marker, or reconcile pointers. Tests compare snapshot bytes, marker damage, link identity/text and source/outside/vault sentinels, reject mutation requests, and verify that an absent pointer is not recreated. A corrupt companion snapshot still permits only validated evidence to be displayed read-only.

The marker-first partial-delete/full-wipe sequence is now an explicit fault-ledger test: partial deletion blocks legacy import and preserves an already-removed pointer's absence. After every initialization artifact is deliberately removed in the fixture, stale legacy settings are imported and the pointer returns. The legacy file and source contents remain unchanged. This reproduces the known operating limit; the visibility fix does not eliminate it. First-import behavior has not changed. Adding another erasable marker cannot solve total evidence loss; changing first-import authorization would require a separate product/recovery contract decision.

The stale settings regression awaits and asserts the control's own requested-state effect before any bulk operation. An in-memory old-inversion mutation fails that assertion. The modal command deliberately applies the inverse of the label displayed when opened; tests cover both labels when a newer action has already reached that value. There is no new UI design or latest-state inversion.

## Finding traceability

| Finding | Implemented behavior and regression evidence | Remaining boundary |
| --- | --- | --- |
| C1: missing sources erased mappings; unlink errors ignored | Desired enablement survives unavailable startup and reconnect. Permission failures preserve records and pending intent. `recovery.test.cjs`: offline/reconnect, bulk unlink failure; `safety.test.cjs`: permission errors. Native fake-source move/Refresh/return preserved the enabled mapping and pointer at revision 13. | Real removable/network mount behavior pending. |
| C2: aliases/overlaps bypassed loop and duplicate checks | Shared canonical-root/source checks reject aliases, parent/child roots and linked destination ancestors. Vault identity is bound during a manager's lifetime. `safety.test.cjs`: alias/overlap and repointed-root cases. | No recursive scan of unmanaged source links; external races are not atomically excluded. |
| C3: traversal, dot names and linked destination escapes | Schema validation/quarantine and the shared destination boundary apply to every operation. Inactive dot-dot rename cannot remove a parent pointer. `safety.test.cjs`, startup migration in `plugin.test.cjs`. | Native Windows naming/volume cases pending; portable reserved-name checks are exercised locally. |
| C4: foreign pointers treated as managed | Link text/canonical identity, expected dangling/relative links, foreign and real-directory conflict handling; metadata-only Forget. `safety.test.cjs`, `recovery.test.cjs`. Native foreign-pointer Refresh/disable preserved its target and inode while saving the disabled preference. | Native junction test is present but skipped on macOS. |
| C5: failed persistence resurrected links | Serialized desired intent precedes mutation; two validated snapshots plus an initialization marker prevent stale fallback. Fault matrix covers remove/enable/disable before and after mutation at write/flush/replace/verify boundaries, add/rename final-commit failures, interrupted initialization, directory loss, damaged generations, missing/invalid marker visibility without writes, copied-vault state and outside revisions. A separately labeled full-wipe test reproduces stale legacy pointer replay; its passing assertion records a known limit, not a fix. `recovery.test.cjs`. | Fault injection is not a hardware power-cut test. Windows directory durability differs. Complete removal of every initialization artifact cannot be distinguished from first installation. |
| C6: ghost inactive rename, bulk drift and stale toggle inversion | Rename checks actual old pointer; bulk applies explicit desired values; settings refresh after commands and use callback values. `recovery.test.cjs`, `plugin.test.cjs`. Stale settings asserts before any bulk repair; an in-memory inversion mutation fails it. Command-modal tests preserve the inverse-of-displayed-label semantics across newer state changes. | Normal native settings/command actions passed; concurrent stale-control behavior remains covered by mocks, not a native concurrency run. |
| C7: errors collapsed into absence; malformed data/file sources | Typed health, quarantine, read-only top-level corruption, source-directory validation and file replacement conflict. `safety.test.cjs`, `recovery.test.cjs`. | Real volume error behavior pending; injected errors validate classification, not device timing. |
| B1: inaccurate minimum API version | Manifest floor corrected to 1.2.3 and checked by current API lint. Published `versions.json` history preserved. | Minimum-host validation and approved next-version mapping required; bounded 1.14.5 runtime smoke passed. |
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
| Electron remote bridge | Existing bridge retained. Real native source-folder selection passed on runtime 1.14.5; cancellation/late completion remains mock-tested. No bridge rewrite or universal host compatibility claim. |
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
| Obsidian desktop GUI | Candidate cb323280 passed bounded native macOS smoke on runtime 1.14.5 / installer 1.11.7: add/read, nonempty settings and command toggles, rename, cancellation/removal, enabled and removed-state reloads, missing-source recovery and foreign-pointer preservation. Minimum-host, second-Mac, native real-directory conflicts and arbitrary popout/focus/Escape/click-outside checks remain open. |
| Hardware power loss/full disk/OS-level read-only volumes | Not tested. Logical persistence faults exercised; actual power-cut ordering and device-specific errors remain unverified. |

## Review and release gates

1. Review the candidate and decide the remaining native Windows/Linux, minimum-version/second-Mac, volume and UI coverage before deployment. Missing environments are not passes.
2. Keep a single manager per vault. Revision checks detect observed outside changes but are not a multiprocess lock. Preserve the marker, snapshots, temporary recovery evidence and legacy file before any recovery work. Downgrading can replay stale legacy data; metadata must not be synchronized between machines.
3. Select a new release version and matching `versions.json` entry, then rerun `npm run release:check`. Do not replace published 1.0.2 assets with candidate bytes.
4. Only after separate authorization, run the reviewed CI workflow. Verify downloaded exact assets with `gh attestation verify main.js --repo glassvault-ai/obsidian-symlink-manager` and the same command for `styles.css`. Inspect the attested source commit/workflow and compare SHA-256 values to the approved candidate/tag. Local repeatability alone is not GitHub provenance.
5. The public install control was disabled in the October 30 audit. An owner must inspect entry eligibility and Manifest/Releases/Source/Build review errors before attributing the distribution block. After an approved repair/review, verify both the enabled public control and in-app discoverability. Caution status and historical counters alone prove neither eligibility nor a particular blocker.

No workflow execution, merge, publication, new submission, authentication change, real-vault plugin replacement or real settings migration was performed for this candidate.

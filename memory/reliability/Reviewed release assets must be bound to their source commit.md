---
note_id: 20261030-2357-3d6e8f7b
type: decision
status: active
tags:
- symlink
- release
scope: project
created_at: 2026-10-30T23:57:10.50443Z
updated_at: 2026-10-31T00:21:17.583137365Z
created_by: ai-agent
---

A manually dispatched provenance workflow can otherwise attest valid bytes from the wrong ref. The release handoff therefore supplies an independently reviewed full source commit and SHA-256 values for main.js, manifest.json and styles.css. Candidate verification checks the checkout, recorded clean build identity and actual bytes against those expected values before any attestation or artifact upload.

The boundary lives in scripts/verify-candidate.mjs and .github/workflows/candidate.yml. Git attributes retain LF bytes for the copied manifest and stylesheet across checkout platforms; otherwise platform checkout conversion can change their hashes before the build. Validation remains read-only by default; the attestation/upload input must be explicitly enabled in a separately authorized run. Version consistency checks happen before a new release tag is created, because release:check deliberately rejects an already-existing version tag. Publication must use the verified exact asset files and source commit rather than rebuild unreviewed bytes under the same version.

Local repeatability does not create provenance, native GUI coverage or directory eligibility. Those remain separate observed gates. Release 1.0.3 demonstrates the distinction: CI run 41148969856 validated three OS runners and produced attestations whose downloaded assets were checked against ca63b3812c9495fcb9374cd6858d10caaece008e, refs/heads/main and candidate.yml, with self-hosted runners denied. The immutable release identity must remain that commit even when subsequent documentation commits record the result. Successful CI is not certification of Obsidian GUI behavior on those platforms or proof of directory eligibility. A metadata-only version bump can reuse runtime validation only when the production JavaScript and stylesheet hashes still match the tested candidate.

Related:
[[Obsidian community plugin release requirements]]
[[Incomplete recovery generations must never trigger legacy replay]]
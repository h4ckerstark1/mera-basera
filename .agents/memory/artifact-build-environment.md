---
name: Artifact build environment
description: Required environment values when validating registered artifact services outside their managed workflows.
---

Registered artifact workflows inject service-specific `PORT` and `BASE_PATH` values. Running a Vite artifact build directly without both values fails while loading its config, even though the managed workflow starts correctly.

**Why:** The artifact configuration treats these values as required inputs rather than providing local defaults.

**How to apply:** When running a standalone build for an artifact, use the values from its `.replit-artifact/artifact.toml`; prefer the managed workflow for runtime verification.
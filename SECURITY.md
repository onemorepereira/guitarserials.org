# Security Policy

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security-relevant reports.

Use **GitHub's private vulnerability reporting** on this repository: from the repo's "Security" tab, click "Report a vulnerability". This creates a private advisory visible only to the maintainers.

Include:

- A description of the issue
- Steps to reproduce (or a minimal PoC)
- The versions affected (git SHA, published `@guitarserials/core` version, or the live site URL)
- Any suggested mitigation if you have one

You should receive an acknowledgement within a few days. Once the issue is confirmed and a fix is prepared, a coordinated disclosure will follow:

1. A patched release on npm (for `@guitarserials/core`) or a deploy to guitarserials.org.
2. A public advisory via GitHub Security Advisories noting the issue, affected versions, and credit to the reporter (if desired).

## Scope

In scope:
- The `@guitarserials/core` npm package
- The guitarserials.org website and its deploy pipeline
- Any auxiliary packages published from this repository

Out of scope:
- Vulnerabilities in third-party dependencies (please report those upstream; if they affect this project, feel free to open an advisory here once the upstream fix is public).
- Denial-of-service via unrealistic input sizes against a client-only static site.

## Supported versions

This is a small, fast-moving project. Only the latest `@guitarserials/core` minor version receives security fixes. The live site is always running the `main` branch.

Thank you for helping keep the project and its users safe.

# Security Policy

## Supported Versions

Only the latest version on the `main` branch is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |
| `< 1.0` | :x:                |

## Reporting a Vulnerability

We take the security of **INKz** seriously. If you discover a security vulnerability, please **do not open a public GitHub issue**.

Instead, please report security vulnerabilities by emailing the core maintainer directly:

- **Contact Email:** `harshpatel.dev@gmail.com` (or create a Private Vulnerability Advisory on GitHub)
- **Response Time:** We aim to acknowledge reports within **48 hours** and provide a patch timeline within **7 days**.

Please include the following details in your report:
- Type of issue (e.g., privilege escalation, unauthorized access, injection)
- Step-by-step instructions or proof-of-concept (PoC) to reproduce the vulnerability
- Affected component(s) (e.g., `auth-service`, `sandbox-service`, `router`, `sync-agent`)
- Impact assessment

## Security Architecture & Best Practices

INKz is designed with multi-tenant isolation and defense-in-depth principles:

1. **Pod & Volume Isolation:**
   - Every workspace operates inside an isolated Kubernetes Pod.
   - Filesystem state is mounted using temporary `emptyDir` volumes scoped exclusively to that user's pod.

2. **Authentication & Session Tokens:**
   - JWT tokens are issued with `httpOnly: true` and `sameSite: Lax` flags to prevent XSS token theft and CSRF attacks.
   - Real-time plan checks prevent token tampering or stale authorization states.

3. **Kubernetes RBAC:**
   - The `sandbox-service` uses a scoped Kubernetes `Role` (namespace-bound to `default`), not a `ClusterRole`, limiting potential damage if a service is compromised.

4. **S3 Prefix Scoping:**
   - Workspace persistence in S3 is isolated by project ID prefixes (`<project-id>/<filepath>`), preventing cross-tenant data access.

5. **Resource Guardrails:**
   - CPU and Memory limits are enforced per container to prevent resource exhaustion and noisy-neighbor attacks.

## Security Disclosure Process

1. **Report Received:** Acknowledged within 48 hours.
2. **Investigation & Patch:** Vulnerability is verified and patched on a private branch.
3. **Release:** Fix is merged into `main`.
4. **Public Disclosure:** Details are credited to the reporter (if desired) after the fix is published.

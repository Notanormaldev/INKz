# Contributing to INKz

Thank you for your interest in contributing to **INKz**! 🎉

Whether you're fixing a bug, adding a new feature, improving documentation, or optimizing Kubernetes performance, your contributions are super welcome.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Environment Setup](#development-environment-setup)
4. [Branching Strategy](#branching-strategy)
5. [Commit Message Conventions](#commit-message-conventions)
6. [How to Raise a Pull Request (PR)](#how-to-raise-a-pull-request-pr)
7. [Testing Your Changes](#testing-your-changes)
8. [Need Help?](#need-help)

---

## Code of Conduct

Please be respectful, constructive, and collaborative. We aim to build an inclusive community for developers of all skill levels.

---

## Getting Started

1. **Find or Open an Issue:** Before starting work on major features, please open an issue to discuss your proposed changes. For small bug fixes or documentation edits, you can proceed directly to a PR.
2. **Fork the Repository:** Click the **Fork** button at the top right of the [INKz Repository](https://github.com/Notanormaldev/INKz).
3. **Clone Your Fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/INKz.git
   cd INKz
   ```

---

## Development Environment Setup

INKz is a Kubernetes microservices application with a React frontend.

1. **Read the Self-Hosting Guide:** Follow [SELF_HOST.md](SELF_HOST.md) for full instructions on setting up Docker Desktop, Kubernetes, Skaffold, and local environment secrets (`k8s/secret.yml`).
2. **Start Backend Microservices:**
   ```bash
   skaffold dev
   ```
3. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Local MinIO / Offline Mode:** If you don't have AWS credentials, refer to **Section 10 & 16** in [SELF_HOST.md](SELF_HOST.md) to run with MinIO or local disk storage.

---

## Branching Strategy

Always create a new branch from `main` for your work. Use clear prefixes for your branch names:

- `feat/feature-name` (e.g., `feat/monaco-custom-theme`)
- `fix/bug-name` (e.g., `fix/terminal-reconnect-loop`)
- `docs/topic` (e.g., `docs/add-helm-instructions`)
- `refactor/component` (e.g., `refactor/sandbox-router`)

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

---

## Commit Message Conventions

We recommend following [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add theme switcher to Monaco editor`
- `fix: resolve race condition in Redis TTL refresh`
- `docs: update self-hosting guide for MinIO`
- `style: format CSS in frontend header`
- `refactor: simplify container pod creation logic`

---

## How to Raise a Pull Request (PR)

Follow these steps to submit your PR:

### Step 1: Make and Test Your Changes
Make sure your changes build cleanly and do not break existing microservices or UI components.

### Step 2: Stage and Commit Changes
```bash
git add .
git commit -m "feat: add your descriptive commit message"
```

### Step 3: Push to Your Fork
```bash
git push origin feat/your-feature-name
```

### Step 4: Open the Pull Request on GitHub
1. Go to your fork on GitHub (`https://github.com/YOUR_USERNAME/INKz`).
2. You will see a prompt saying **"Compare & pull request"**. Click it.
3. Select `base: main` ← `compare: feat/your-feature-name`.

### Step 5: Fill Out the PR Description
Please provide a clear title and structured description using the following template:

```markdown
## Summary
Brief description of what this PR introduces or fixes.

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📝 Documentation update
- [ ] ⚡ Performance optimization / Refactoring
- [ ] 🔧 Infrastructure / Config change

## How Was This Tested?
Describe the manual or automated tests you ran to verify your changes.
- [x] Ran `skaffold dev` and verified pod creation
- [x] Verified frontend UI rendering in browser at `http://localhost:5173`

## Screenshots / Record (if UI changes)
Add screenshots or GIFs demonstrating the feature/fix if applicable.
```

---

## Testing Your Changes

Before submitting your PR, verify:

1. **Kubernetes Pod Health:** All microservices build and reach `Running` status under `skaffold dev`.
2. **No Console Errors:** Browser developer console has no critical JS errors.
3. **Architecture & Docs Alignment:** If adding new environment variables or architectural components, update `ARCHITECTURE.md` and `SELF_HOST.md`.

---

## Need Help?

If you have questions or get stuck:
- Open a GitHub Discussion or Issue.
- Reach out to the maintainer: **Harsh Patel** ([@Notanormaldev](https://github.com/Notanormaldev)).

Thank you for contributing to INKz! 🚀

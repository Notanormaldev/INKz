# INKz — Cloud IDE & Agentic AI Platform

> **Instant, browser-based cloud development platform running isolated Kubernetes pods with real-time file mirroring and a built-in Agentic AI coding partner.**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/Notanormaldev/INKz?style=social)](https://github.com/Notanormaldev/INKz)
[![Docker](https://img.shields.io/badge/Docker-Kubernetes-blue)](https://www.docker.com/)

---

## ⚡ What is INKz?

**INKz** is a next-generation, high-performance **Cloud IDE** designed to replace traditional slow local development environments. It provisions isolated Kubernetes container pod sandboxes in seconds, streams Monaco editor changes in real time, continuously mirrors workspace files to S3/local storage, and pairs you with an **autonomous AI coding partner**.

---

## 🚀 Key Features

- ☸️ **Isolated Kubernetes Sandbox Pods**: Spin up dedicated Node.js / React / Python dev containers on demand.
- 🤖 **Agentic AI Coding Partner**: Integrated LangChain agent capable of editing multi-file codebases, fixing lints, and executing terminal commands autonomously.
- ⚡ **Monaco Editor + Hot Module Reloading**: Full VS Code-grade Monaco editing experience with instant HMR port forwarding.
- 🪣 **Real-Time S3 & Local Storage Mirroring**: Workspace files continuously sync to persistent storage so you never lose progress.
- 🌐 **Self-Host & 100% Offline AI Support**: Run 100% locally with Ollama or connect your favorite LLM provider (Mistral, Gemini, DeepSeek, OpenAI).

---

## 📖 Documentation & Links

- 🛠️ **Local Setup & Self-Hosting Guide**: Read [SELF_HOST.md](./SELF_HOST.md) for full hardware requirements, Skaffold commands, Ollama RAM model selectors, and Kubernetes secrets configuration.
- 🌐 **Live Web Application**: [http://localhost:5173](http://localhost:5173)
- 📚 **Interactive In-App Documentation**: [/docs](http://localhost:5173/docs)
- ⚡ **Free Plan & Local Quickstart**: [/free](http://localhost:5173/free)

---

## 💻 Tech Stack

- **Frontend**: React, Vite, Monaco Editor, Vanilla CSS (Sheryians Design Aesthetics)
- **Backend Microservices**: Node.js, Express, Socket.IO, JWT
- **Orchestration**: Kubernetes, Skaffold, Docker Desktop
- **AI Orchestration**: LangChain, Mistral AI, Ollama, OpenAI / Gemini / DeepSeek
- **Databases & Queues**: MongoDB, Redis, RabbitMQ

---

## ⭐ Author & Open Source Credits

Created with ❤️ by **Harsh Patel**

If you find INKz useful, please consider starring the repository and following on GitHub!

- **GitHub Repository**: [Notanormaldev/INKz](https://github.com/Notanormaldev/INKz)
- **Star the Repo**: Click the Star button on GitHub to support the project!

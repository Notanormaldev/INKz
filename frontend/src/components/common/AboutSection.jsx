import './AboutSection.css'

export default function AboutSection() {
  const stats = [
    { label: "Sandbox Boot Time", value: "~3.8s", sub: "Kubernetes pod creation" },
    { label: "Storage Persistence", value: "100%", sub: "Bi-directional AWS S3 sync" },
    { label: "DevServer Latency", value: "<15ms", sub: "Instant HMR port forwarding" },
    { label: "AI Pair Programmer", value: "24/7", sub: "Full codebase context window" },
  ]

  return (
    <section id="about" className="archive-about-container">
      <div className="about-header">
        <div className="about-badge">
          ABOUT INKz PLATFORM
          <span className="box-handle tl" />
          <span className="box-handle tr" />
          <span className="box-handle bl" />
          <span className="box-handle br" />
        </div>
        <h2 className="about-title">
          Cloud-native engineering <br />
          <span className="about-title-accent">reimagined for modern developers.</span>
        </h2>
        <p className="about-subtitle">
          INKz was built to eliminate "it works on my machine" forever. We combined isolated Kubernetes containers, instant S3 file synchronization, embedded Monaco IDE editor, and multi-file AI orchestration into one instant browser platform.
        </p>
      </div>

      {/* Grid Stats Cards */}
      <div className="about-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="about-stat-card">
            <span className="stat-value-text">{stat.value}</span>
            <span className="stat-label-text">{stat.label}</span>
            <span className="stat-sub-text">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Architecture Breakdown */}
      <div className="about-architecture-box">
        <div className="arch-col">
          <div className="arch-num">01</div>
          <h3 className="arch-col-title">Ephemeral K8s Sandboxes</h3>
          <p className="arch-col-desc">
            Each workspace session spawns an isolated Kubernetes container pod in milliseconds. Complete root web shell access with pre-installed Node.js, Python, Git, and Skaffold tools.
          </p>
        </div>

        <div className="arch-divider" />

        <div className="arch-col">
          <div className="arch-num">02</div>
          <h3 className="arch-col-title">Real-Time S3 File Mirror</h3>
          <p className="arch-col-desc">
            Your workspace files are continuously mirrored to dedicated AWS S3 bucket storage. Stop or resume your workspace anytime without losing a single character of code.
          </p>
        </div>

        <div className="arch-divider" />

        <div className="arch-col">
          <div className="arch-num">03</div>
          <h3 className="arch-col-title">Agentic AI Orchestrator</h3>
          <p className="arch-col-desc">
            Integrated AI companion capable of reading your entire repository context, planning multi-file refactors, executing terminal commands, and fixing bugs autonomously.
          </p>
        </div>
      </div>
    </section>
  )
}

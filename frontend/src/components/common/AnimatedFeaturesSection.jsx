import './AnimatedFeaturesSection.css'

export default function AnimatedFeaturesSection() {
  const cards = [
    {
      title: "Instant K8s Containers",
      value: "~4s Sandbox Boot",
      subtitle: "Spin up isolated Docker and Kubernetes environments in seconds with zero local configuration.",
      span: "span-2"
    },
    {
      title: "Data Mirroring",
      value: "Real-Time S3 Sync",
      subtitle: "Continuous bi-directional workspace sync to AWS S3.",
      span: "span-1"
    },
    {
      title: "AI Coding Assistant",
      value: "Full Codebase Context",
      subtitle: "Autonomous pair programmer for multi-file edits and terminal execution.",
      span: "span-1"
    },
    {
      title: "Browser IDE Runtime",
      value: "Monaco + Live HMR",
      subtitle: "VS Code feel with integrated dev server preview and instant port forwarding.",
      span: "span-2"
    },
    {
      title: "Enterprise Infrastructure",
      value: "Kubernetes & Redis",
      subtitle: "TTL-managed sandbox pods, heartbeat persistence, and multi-tenant security isolation.",
      span: "span-3"
    }
  ]

  return (
    <section id="features" className="archive-features-container">
      {/* SVG Noise Filter */}
      <svg width="0" height="0" className="absolute opacity-0 pointer-events-none">
        <defs>
          <filter id="noiseFilterArchive" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence baseFrequency="0.4" numOctaves="2" result="noise" seed="2" type="fractalNoise" />
            <feColorMatrix in="noise" type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0.02 0.04 0.06" />
            </feComponentTransfer>
            <feComposite operator="over" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      <div className="archive-features-header">
        <h2 className="archive-features-title">
          Powerful Cloud Features
        </h2>
        <p className="archive-features-subtitle">
          Everything you need to write, test, and deploy full-stack applications directly from your browser.
        </p>
      </div>

      <div className="archive-bento-grid">
        {cards.map((card, idx) => (
          <div key={idx} className={`archive-bento-card ${card.span}`}>
            <div className="card-shine" />
            <div className="card-inner-content">
              <span className="card-tag">{card.title}</span>
              <h3 className="card-main-val">{card.value}</h3>
              <p className="card-sub">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

import './FeaturesSection.css'

export default function FeaturesSection() {
  return (
    <section id="features" className="features-container">
      {/* Background SVG Noise Filter */}
      <svg width="0" height="0" className="absolute opacity-0 pointer-events-none">
        <defs>
          <filter id="noiseFilter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence baseFrequency="0.4" numOctaves="2" result="noise" seed="2" type="fractalNoise" />
            <feColorMatrix in="noise" type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0.02 0.04 0.06" />
            </feComponentTransfer>
            <feComposite operator="over" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      <div className="features-header">
        <div className="features-tag">ARCHITECTURE & CAPABILITIES</div>
        <h2 className="features-title">
          Built for speed. <br />
          <span className="features-title-accent">Engineered for cloud scale.</span>
        </h2>
        <p className="features-subtitle">
          Everything you need to write, test, and ship full-stack code right inside your browser with zero latency.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">
        {/* Card 1: Span 2 - K8s Pod Boot */}
        <div className="bento-card bento-card-large">
          <div className="bento-card-glow" />
          <div className="bento-badge">ISOLATED RUNTIME</div>
          <div className="bento-icon">☸</div>
          <h3 className="bento-card-title">Instant K8s Pod Sandboxes</h3>
          <p className="bento-card-desc">
            Spin up clean, isolated Kubernetes container environments in ~4 seconds. Each workspace gets its own dedicated pod, Linux web shell, and Node.js environment.
          </p>

          <div className="bento-terminal-preview">
            <div className="term-head">
              <span className="term-dot red" />
              <span className="term-dot yellow" />
              <span className="term-dot green" />
              <span className="term-title">k8s-pod-status.sh</span>
            </div>
            <div className="term-body">
              <p><span className="t-green">✔</span> Provisioning pod inkz-sandbox-a8f3...</p>
              <p><span className="t-blue">ℹ</span> Mounting persistent S3 workspace volume...</p>
              <p><span className="t-amber">➜</span> Pod Ready in 3.84s (Port 5173 exposed)</p>
            </div>
          </div>
        </div>

        {/* Card 2: Real-time S3 Sync */}
        <div className="bento-card">
          <div className="bento-badge">DATA PERSISTENCE</div>
          <div className="bento-icon">🪣</div>
          <h3 className="bento-card-title">Real-Time S3 File Mirror</h3>
          <p className="bento-card-desc">
            Never lose a line of code. Workspace changes sync bi-directionally to AWS S3 in real-time. Close your browser and pick up right where you left off.
          </p>
        </div>

        {/* Card 3: AI Pair Programmer */}
        <div className="bento-card">
          <div className="bento-badge">INTELLIGENT AGENT</div>
          <div className="bento-icon">🤖</div>
          <h3 className="bento-card-title">AI Pair Programmer</h3>
          <p className="bento-card-desc">
            Full codebase context window. The agent refactors code, generates React components, runs terminal commands, and resolves bugs autonomously.
          </p>
        </div>

        {/* Card 4: Embedded Live Preview */}
        <div className="bento-card bento-card-large">
          <div className="bento-badge">LIVE HMR</div>
          <div className="bento-icon">🖥</div>
          <h3 className="bento-card-title">Embedded App Live Preview</h3>
          <p className="bento-card-desc">
            Integrated preview iframe connected directly to your pod's dev server. Hot Module Replacement (HMR) renders UI changes instantly as you type.
          </p>

          <div className="bento-ui-preview">
            <div className="preview-bar">
              <span className="p-url">https://5173-inkz-sandbox-a8f3.proxy.inkz.cloud</span>
            </div>
            <div className="preview-canvas">
              <div className="p-box glow-amber" />
              <div className="p-box" />
              <div className="p-box" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

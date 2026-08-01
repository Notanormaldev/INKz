import './FooterSection.css'

export default function FooterSection({ onOpenAuth }) {
  return (
    <footer className="landing-footer-wrapper">
      <div className="footer-top-grid">
        {/* Col 1: Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <span className="logo-i">I</span>
            <span className="logo-n">N</span>
            <span className="logo-k">K</span>
            <span className="logo-z">z</span>
          </div>
          <p className="footer-brand-text">
            Next-Gen Cloud IDE platform running isolated Kubernetes sandboxes with bi-directional S3 persistence and embedded AI orchestration.
          </p>
          <div className="cluster-status-pill">
            <span className="status-dot-green" />
            <span>All K8s Clusters Operational (99.99%)</span>
          </div>
        </div>

        {/* Col 2: Platform Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">PLATFORM</h4>
          <a href="#features" className="footer-link">Kubernetes Pods</a>
          <a href="#features" className="footer-link">S3 Persistent Storage</a>
          <a href="#demo" className="footer-link">Live HMR Preview</a>
          <a href="#features" className="footer-link">AI Pair Programmer</a>
        </div>

        {/* Col 3: Resources */}
        <div className="footer-col">
          <h4 className="footer-col-title">RESOURCES</h4>
          <a href="#pricing" className="footer-link">Pricing Plans</a>
          <a href="#demo" className="footer-link">IDE Documentation</a>
          <span onClick={onOpenAuth} className="footer-link cursor-pointer">Sign In / Register</span>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">GitHub Repository</a>
        </div>

        {/* Col 4: Legal & Contact */}
        <div className="footer-col">
          <h4 className="footer-col-title">CONNECT</h4>
          <a href="mailto:support@inkz.cloud" className="footer-link">support@inkz.cloud</a>
          <a href="#privacy" className="footer-link">Privacy Policy</a>
          <a href="#terms" className="footer-link">Terms of Service</a>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© 2026 INKz Cloud Systems. All rights reserved.</span>
        <span className="footer-tagline">YOUR CODE. YOUR CANVAS.</span>
      </div>
    </footer>
  )
}

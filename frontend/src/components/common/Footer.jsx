import { useNavigate } from 'react-router-dom'
import BigInkzLogoFooter from '../landing/BigInkzLogoFooter'
import './Footer.css'

export default function Footer({ onOpenAuth }) {
  const navigate = useNavigate()

  const handleContactSupport = (e) => {
    if (e) e.preventDefault()
    const subject = encodeURIComponent('INKz Support & Bulk Inquiry')
    const body = encodeURIComponent('Hey Harsh,\n\nI want INKz in bulk for our team.')
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=harshpatel20050@gmail.com&su=${subject}&body=${body}`

    window.open(gmailUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className="archive-footer-container">
      {/* 1. Big INKz Logo & Motto Banner (Upar) */}
      <BigInkzLogoFooter />

      <div className="footer-section-divider" />

      {/* 2. Product, Company, & About Links Grid (Niche) */}
      <div className="archive-footer-content">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="brand-summary-col">
            {/* FINAL INKz Logo (Strictly Unchanged) */}
            <div className="nav-logo" onClick={() => navigate('/')}>
              <span className="logo-i">I</span>
              <span className="logo-n">N</span>
              <span className="logo-k">K</span>
              <span className="logo-z">z</span>
              <div className="ink-drop-mini" aria-hidden="true" />
            </div>

            <p className="brand-desc-text">
              Empowering developers with isolated Kubernetes pod sandboxes, real-time S3 file persistence, and an integrated AI pair programmer.
            </p>
            <p className="brand-italic-motto">
              "Your Code. Your Canvas."
            </p>
          </div>

          {/* Product Col */}
          <div className="footer-links-col">
            <h4 className="links-col-title">Product</h4>
            <ul className="links-list">
              <li><a href="#features">Kubernetes Sandboxes</a></li>
              <li><a href="#features">S3 File Storage</a></li>
              <li><a href="#pricing">Pricing Plans</a></li>
              <li><span onClick={onOpenAuth} className="cursor-pointer">Sign In / Register</span></li>
            </ul>
          </div>

          {/* Company Col */}
          <div className="footer-links-col">
            <h4 className="links-col-title">Company</h4>
            <ul className="links-list">
              <li><a href="#about">About INKz</a></li>
              <li><a href="#faq">FAQ Documentation</a></li>
              <li>
                <a
                  href="mailto:harshpatel20050@gmail.com?subject=INKz%20Support%20%26%20Bulk%20Inquiry&body=Hey%20Harsh%2C%0A%0AI%20want%20INKz%20in%20bulk%20for%20our%20team."
                  onClick={handleContactSupport}
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p>© 2026 INKz Systems. Designed & Developed by Harsh Patel.</p>
        </div>
      </div>
    </footer>
  )
}

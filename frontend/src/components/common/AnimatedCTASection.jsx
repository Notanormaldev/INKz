import { useNavigate } from 'react-router-dom'
import './AnimatedCTASection.css'

export default function AnimatedCTASection({ onOpenAuth }) {
  const navigate = useNavigate()

  const handleStartTrial = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const user = await res.json()
        const isUnlimited = Boolean(
          user && (
            user.role === 'admin' ||
            user.plan === 'unlimited' ||
            user.email?.toLowerCase().trim() === 'harshpatelpc20051@gmail.com'
          )
        )
        if (isUnlimited) {
          navigate('/projects')
        } else {
          navigate('/apply')
        }
      } else {
        onOpenAuth()
      }
    } catch {
      onOpenAuth()
    }
  }

  const handleContactSales = (e) => {
    if (e) e.preventDefault()
    const subject = encodeURIComponent('INKz Bulk License Inquiry')
    const body = encodeURIComponent('Hey Harsh,\n\nI want INKz in bulk for our team.')
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=harshpatel20050@gmail.com&su=${subject}&body=${body}`

    window.open(gmailUrl, '_blank', 'noopener,noreferrer')
  }

  // Pre-calculated smooth bezier curved beam paths
  const leftPaths = [
    "M -380 -189 C -380 -189 -312 216 152 343 C 616 470 684 875 684 875",
    "M -360 -195 C -360 -195 -297 210 162 337 C 611 464 679 869 679 869",
    "M -340 -201 C -340 -201 -282 204 172 331 C 606 458 674 863 674 863",
    "M -320 -207 C -320 -207 -267 198 182 325 C 601 452 669 857 669 857",
    "M -300 -213 C -300 -213 -252 192 192 319 C 596 446 664 851 664 851",
    "M -280 -219 C -280 -219 -237 186 202 313 C 591 440 659 845 659 845",
    "M -260 -225 C -260 -225 -222 180 212 307 C 586 434 654 839 654 839",
    "M -240 -231 C -240 -231 -207 174 222 301 C 581 428 649 833 649 833",
    "M -220 -237 C -220 -237 -192 168 232 295 C 576 422 644 827 644 827",
    "M -200 -243 C -200 -243 -177 162 242 289 C 571 416 639 821 639 821"
  ]

  const rightPaths = [
    "M 1076 -189 C 1076 -189 1008 216 544 343 C 80 470 12 875 12 875",
    "M 1056 -195 C 1056 -195 993 210 534 337 C 85 464 17 869 17 869",
    "M 1036 -201 C 1036 -201 978 204 524 331 C 90 458 22 863 22 863",
    "M 1016 -207 C 1016 -207 963 198 514 325 C 95 452 27 857 27 857",
    "M 996 -213 C 996 -213 948 192 504 319 C 100 446 32 851 32 851",
    "M 976 -219 C 976 -219 933 186 494 313 C 105 440 37 845 37 845",
    "M 956 -225 C 956 -225 918 180 484 307 C 110 434 42 839 42 839",
    "M 936 -231 C 936 -231 903 174 474 301 C 115 428 47 833 47 833",
    "M 916 -237 C 916 -237 888 168 464 295 C 120 422 52 827 52 827",
    "M 896 -243 C 896 -243 873 162 454 289 C 125 416 57 821 57 821"
  ]

  return (
    <section className="archive-cta-fullwidth-section">
      {/* Background Animated Curved Flowing Beam Paths */}
      <div className="cta-bg-paths-wrapper">
        <svg className="cta-paths-svg" viewBox="0 0 696 316" fill="none">
          {leftPaths.map((d, i) => (
            <path
              key={`left-${i}`}
              d={d}
              stroke="rgba(255, 255, 255, 0.65)"
              strokeWidth={0.8 + i * 0.05}
              fill="none"
              className="animated-beam-path"
              style={{
                strokeDasharray: '90 180',
                opacity: 0.4 + (i % 4) * 0.12,
                animationDuration: `${10 + (i % 5) * 2}s`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
          {rightPaths.map((d, i) => (
            <path
              key={`right-${i}`}
              d={d}
              stroke="rgba(255, 255, 255, 0.65)"
              strokeWidth={0.8 + i * 0.05}
              fill="none"
              className="animated-beam-path-reverse"
              style={{
                strokeDasharray: '90 180',
                opacity: 0.4 + (i % 4) * 0.12,
                animationDuration: `${11 + (i % 6) * 2}s`,
                animationDelay: `${i * 0.9}s`,
              }}
            />
          ))}
        </svg>
        <div className="cta-bg-vignette" />
      </div>

      {/* Center Content Stage */}
      <div className="archive-cta-container">
        <div className="archive-cta-card">
          <h2 className="cta-heading">Ready to Transform Your Cloud Workflow?</h2>
          <p className="cta-subheading">
            Join thousands of developers already using INKz to spin up Kubernetes sandboxes and ship code faster.
          </p>

          <div className="cta-btn-group">
            <button className="cta-btn-primary" onClick={handleStartTrial}>
              <span>Start Your Free Trial</span>
              <span className="arrow-icon">→</span>
            </button>
            <a
              href="mailto:harshpatel20050@gmail.com?subject=INKz%20Bulk%20License%20Inquiry&body=Hey%20Harsh%2C%0A%0AI%20want%20INKz%20in%20bulk%20for%20our%20team."
              onClick={handleContactSales}
              className="cta-btn-secondary"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

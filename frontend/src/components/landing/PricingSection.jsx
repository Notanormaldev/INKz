import './PricingSection.css'

export default function PricingSection({ onOpenAuth }) {
  const plans = [
    {
      name: 'Developer',
      price: '$0',
      period: '/ month',
      description: 'Ideal for individual developers and side projects.',
      features: [
        '1 Concurrent K8s Pod',
        '5GB S3 Persistent Storage',
        'Standard AI Coding Helper',
        'Instant Live HMR Preview',
        'Community Discord Support'
      ],
      popular: false,
      cta: 'Start Free'
    },
    {
      name: 'Pro Developer',
      price: '$19',
      period: '/ month',
      description: 'For power users needing multi-pod orchestration & fast AI.',
      features: [
        '5 Concurrent K8s Pods',
        '50GB S3 Persistent Storage',
        'GPT-4o AI Pair Programmer',
        'Priority Pod Warm Boot (~2s)',
        'Custom Port Forwarding',
        'Priority Email & Chat Support'
      ],
      popular: true,
      cta: 'Upgrade to Pro'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Dedicated Kubernetes cluster for high-scale tech teams.',
      features: [
        'Unlimited Kubernetes Pods',
        'Dedicated AWS S3 Bucket',
        'Fine-tuned Enterprise AI Models',
        'Single Sign-On (SSO / SAML)',
        'Dedicated 99.99% SLA Guarantee',
        '24/7 Support Manager'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ]

  return (
    <section id="pricing" className="pricing-section-container">
      <div className="pricing-header">
        <div className="features-tag">TRANSPARENT PRICING</div>
        <h2 className="features-title">Simple, predictable pricing</h2>
        <p className="features-subtitle">
          Build for free. Scale your cloud workspaces as your team grows.
        </p>
      </div>

      <div className="pricing-cards-grid">
        {plans.map((plan, i) => (
          <div key={i} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
            {plan.popular && (
              <div className="popular-badge">
                <span>MOST POPULAR</span>
              </div>
            )}

            <div className="card-top">
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-desc">{plan.description}</p>
              <div className="plan-price-block">
                <span className="plan-price">{plan.price}</span>
                <span className="plan-period">{plan.period}</span>
              </div>
            </div>

            <ul className="plan-features-list">
              {plan.features.map((feat, idx) => (
                <li key={idx}>
                  <span className="check-icon">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              className={`plan-cta-btn ${plan.popular ? 'cta-popular' : ''}`}
              onClick={onOpenAuth}
            >
              {plan.cta} →
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

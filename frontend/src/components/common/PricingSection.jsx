import { useNavigate } from 'react-router-dom'
import './PricingSection.css'

const TOTAL_SPOTS = 5
const SPOTS_TAKEN = 2 // update this from backend

export default function PricingSection() {
  const navigate = useNavigate()
  const spotsLeft = TOTAL_SPOTS - SPOTS_TAKEN

  const handleCloudAccess = async () => {
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
        navigate('/apply')
      }
    } catch {
      navigate('/apply')
    }
  }

  const plans = [
    {
      id: 'free',
      tag: null,
      name: 'Self-Host Free',
      price: 'Free',
      priceNote: 'Forever',
      description: 'Run INKz on your own machine. Unlimited pods, unlimited storage — fully open source.',
      features: [
        'Unlimited K8s Pods (local)',
        'Unlimited Storage (local)',
        'Full AI Partner (Ollama / Local LLMs)',
        'Monaco Editor + HMR Dev Server',
        'Open Source — fork & modify freely',
      ],
      cta: 'Get Started Free →',
      ctaStyle: 'btn-free',
      onClick: () => navigate('/free'),
    },
    {
      id: 'cloud',
      tag: { label: `${spotsLeft} spots left`, style: 'tag-spots' },
      name: 'Cloud IDE',
      price: 'Early Access',
      priceNote: '100% Free for selected users',
      description: `Only top ${TOTAL_SPOTS} developers will get fully managed cloud access — zero setup, zero cost.`,
      features: [
        'Unlimited Managed K8s Pods',
        'Unlimited S3 Cloud Storage',
        'Mistral AI',
        'Priority Pod Boot (~2s)',
        'Custom Port Forwarding',
        'Managed hosting — no infra needed',
      ],
      cta: `Apply for Access (${spotsLeft} left)`,
      ctaStyle: 'btn-cloud',
      onClick: handleCloudAccess,
      highlight: true,
    },
    {
      id: 'enterprise',
      tag: { label: '🚧 Coming Soon', style: 'tag-soon' },
      name: 'Enterprise',
      price: 'Custom',
      priceNote: '',
      description: 'Dedicated cluster infrastructure for engineering teams at scale.',
      features: [
        'Unlimited Managed K8s Pods',
        'Dedicated S3 Storage Bucket',
        'Enterprise AI Fine-tuning',
        '24/7 Dedicated Support',
        'Custom SLA Guarantee',
        'SSO & SAML Security',
      ],
      cta: 'Coming Soon',
      ctaStyle: 'btn-coming-soon',
      onClick: null,
      comingSoon: true,
    },
  ]

  return (
    <section id="pricing" className="archive-pricing-container">
      <div className="archive-pricing-header">
        <h2 className="archive-pricing-title">Simple, Transparent Pricing</h2>
        <p className="archive-pricing-subtitle">
          Self-host for free, or apply for limited free cloud access. Paid plans coming later.
        </p>
      </div>

      <div className="archive-pricing-cards">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`archive-pricing-card ${plan.highlight ? 'highlight-card' : ''} ${plan.comingSoon ? 'coming-soon-card' : ''}`}
          >
            {/* Tag Badge */}
            {plan.tag && (
              <div className={`pricing-tag-badge ${plan.tag.style}`}>
                {plan.tag.label}
              </div>
            )}

            <div className="pricing-card-head">
              <h3 className="plan-title">{plan.name}</h3>
              <div className="price-block">
                <span className={`price-num ${plan.id === 'cloud' ? 'price-early' : ''}`}>
                  {plan.price}
                </span>
              </div>
              {plan.priceNote && (
                <p className="price-note">{plan.priceNote}</p>
              )}
              <p className="plan-description">{plan.description}</p>
            </div>

            <ul className="plan-feature-items">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="feature-item">
                  <span className={`check-svg ${plan.id === 'cloud' ? 'check-cloud' : ''}`}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`plan-action-btn ${plan.ctaStyle}`}
              onClick={plan.onClick || undefined}
              disabled={plan.comingSoon}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

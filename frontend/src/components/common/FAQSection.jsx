import { useState } from 'react'
import './FAQSection.css'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What is INKz Cloud IDE and how does it work?",
      answer:
        "INKz is a browser-based cloud development environment. When you launch a project, INKz provisions an isolated Kubernetes container pod in ~4s with a dedicated Linux web shell, Node.js runtime, Monaco editor, and bi-directional AWS S3 file sync."
    },
    {
      question: "Is my code safe and persistent?",
      answer:
        "Yes! Every edit made in the browser editor is automatically mirrored to AWS S3 in real-time. If your browser closes or your container restarts, your code is safely preserved."
    },
    {
      question: "How does the AI Pair Programmer work?",
      answer:
        "The integrated AI coding partner has full context of your project's file tree and code. It can generate React components, debug errors, refactor code, and run terminal commands autonomously."
    },
    {
      question: "Do I need local Docker or Kubernetes installed?",
      answer:
        "Zero local setup required! Everything runs entirely in the cloud inside remote isolated Kubernetes pods, accessible through any modern web browser."
    },
    {
      question: "Can I try INKz for free?",
      answer:
        "Yes! You can apply for 100% free access. If selected, you get unlimited access to our hosted cloud platform. If not selected, you can always use our 100% free self-hosted open-source version on your own infrastructure!"
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="archive-faq-container">
      <div className="archive-faq-header">
        <h2 className="archive-faq-title">Frequently Asked Questions</h2>
        <p className="archive-faq-subtitle">
          Everything you need to know about INKz Cloud IDE platform.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-card">
            <button
              className="faq-question-btn"
              onClick={() => toggleFAQ(index)}
            >
              <span>{faq.question}</span>
              <span className={`faq-arrow ${openIndex === index ? 'open' : ''}`}>▼</span>
            </button>

            {openIndex === index && (
              <div className="faq-answer-body">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

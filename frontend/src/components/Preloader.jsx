import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './Preloader.css'

export default function Preloader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const containerRef = useRef(null)
  const leftPathRef = useRef(null)
  const rightPathRef = useRef(null)
  const glowLineRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'auto'
  }, [])

  useEffect(() => {
    if (!isVisible || !containerRef.current) return

    const leftPath = leftPathRef.current
    const rightPath = rightPathRef.current
    const glowLine = glowLineRef.current
    const panels = containerRef.current.querySelectorAll('.curtain-panel')

    if (!leftPath || !rightPath || !panels || panels.length < 5) {
      setIsVisible(false)
      if (onComplete) onComplete()
      return
    }

    // Animation state object for GSAP interpolation
    const state = {
      // Phase 2: Line Draw (100 = bottom, 0 = top)
      drawY: 100,
      // Phase 3: Reveal / Bloom progress (0 to 1)
      reveal: 0
    }

    const gapW = 0.8 // % gap width for sliver

    // Dynamically update SVG path geometry for wine-glass waist curve & shining gradient line
    const updateSVG = () => {
      if (state.reveal === 0) {
        // Phase 2: Line Draw Zipper with Shining Multi-Stop Gradient Line
        const yTop = state.drawY
        const xL = 50 - gapW / 2
        const xR = 50 + gapW / 2

        const dL = `M 0,0 L 50,0 L 50,${yTop} L ${xL},${yTop} L ${xL},100 L 0,100 Z`
        const dR = `M 100,0 L 50,0 L 50,${yTop} L ${xR},${yTop} L ${xR},100 L 100,100 Z`

        leftPath.setAttribute('d', dL)
        rightPath.setAttribute('d', dR)

        if (glowLine) {
          glowLine.setAttribute('d', `M 50,100 L 50,${yTop}`)
          glowLine.style.opacity = '1'
        }
      } else {
        // Phase 3: Reveal Bloom with Wine-Glass Waist Curve
        const r = state.reveal
        const openAmount = r * 80 // Max retraction
        const curveStrength = 16 * Math.sin(r * Math.PI) // Waist pinch depth
        const topPinch = 0.7 + 0.3 * r // Top/middle sync

        // Left Panel coordinates
        const xTopL = Math.max(-20, (50 - gapW / 2) - openAmount * topPinch)
        const xWaistL = Math.max(-30, (50 - gapW / 2) - openAmount - curveStrength)
        const xBottomL = Math.max(-20, (50 - gapW / 2) - openAmount)

        const dL = `M 0,0 L ${xTopL},0 C ${xTopL},25 ${xWaistL},35 ${xWaistL},50 C ${xWaistL},65 ${xBottomL},75 ${xBottomL},100 L 0,100 Z`

        // Right Panel coordinates
        const xTopR = Math.min(120, (50 + gapW / 2) + openAmount * topPinch)
        const xWaistR = Math.min(130, (50 + gapW / 2) + openAmount + curveStrength)
        const xBottomR = Math.min(120, (50 + gapW / 2) + openAmount)

        const dR = `M 100,0 L ${xTopR},0 C ${xTopR},25 ${xWaistR},35 ${xWaistR},50 C ${xWaistR},65 ${xBottomR},75 ${xBottomR},100 L 100,100 Z`

        leftPath.setAttribute('d', dL)
        rightPath.setAttribute('d', dR)

        // Fade out shining line as curtains bloom wide
        const edgeOpacity = Math.max(0, 1 - r * 1.5)
        if (glowLine) glowLine.style.opacity = String(edgeOpacity)
      }
    }

    // Initialize SVG path positions
    updateSVG()

    // Master Timeline
    const masterTl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = 'auto'
        setIsVisible(false)
        if (onComplete) onComplete()
      }
    })

    // --- STAGE 1: SVG CURTAIN LOADER WITH SHINING GRADIENT LINE ---
    // Phase 1: Initial Hold
    masterTl.to({}, { duration: 0.2 })

    // Phase 2: Line Draw (Shining line unzips up from bottom to top)
    masterTl.to(state, {
      drawY: 0,
      duration: 0.65,
      ease: 'power2.out',
      onUpdate: updateSVG
    })

    // Phase 3: Reveal / Bloom Curved Pull
    masterTl.to(state, {
      reveal: 1,
      duration: 0.85,
      ease: 'power3.inOut',
      onUpdate: updateSVG
    })

    // Hide SVG curtain overlay once fully opened
    masterTl.set('.svg-curtain-overlay', { display: 'none' })

    // --- STAGE 2: 5 ORANGE STRIPS REVEAL (Original Staggered Center-Out Order) ---
    // Center Panel (2) -> Inner Flanks (1, 3) -> Outer Edges (0, 4)
    masterTl.to(panels[2], { yPercent: -105, duration: 0.9, ease: 'power3.inOut' }, '+=0.05')
    masterTl.to([panels[1], panels[3]], { yPercent: -105, duration: 0.9, ease: 'power3.inOut' }, '-=0.72')
    masterTl.to([panels[0], panels[4]], { yPercent: -105, duration: 0.9, ease: 'power3.inOut' }, '-=0.72')

    return () => {
      masterTl.kill()
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="inkz-preloader-container" ref={containerRef}>
      {/* STAGE 2: 5 Vertical Orange Panels */}
      <div className="curtain-wrapper">
        <div className="curtain-panel" />
        <div className="curtain-panel" />
        <div className="curtain-panel" />
        <div className="curtain-panel" />
        <div className="curtain-panel" />
      </div>

      {/* STAGE 1: SVG Curtain Loader Overlay with Shining Gradient Line */}
      <svg
        className="svg-curtain-overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Shining Multi-Stop Gradient Line: Dominant Brand Orange + Spectral Glow Accents */}
          <linearGradient id="shiningGradientLine" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0055ff" stopOpacity="0.8" />
            <stop offset="5%" stopColor="#00f0ff" stopOpacity="1" />
            <stop offset="18%" stopColor="#ff3300" stopOpacity="1" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="80%" stopColor="#ff7700" stopOpacity="1" />
            <stop offset="93%" stopColor="#ffcc00" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          <filter id="laserBeamFilter" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.8" result="coreGlow" />
            <feGaussianBlur stdDeviation="2.4" result="outerGlow" />
            <feMerge>
              <feMergeNode in="outerGlow" />
              <feMergeNode in="coreGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Curtain Dark Panels */}
        <path ref={leftPathRef} fill="#09090b" />
        <path ref={rightPathRef} fill="#09090b" />

        {/* Continuous Shining Multi-Stop Gradient Line (No Separate White Dot) */}
        <path
          ref={glowLineRef}
          fill="none"
          stroke="url(#shiningGradientLine)"
          strokeWidth="0.85"
          filter="url(#laserBeamFilter)"
          style={{ opacity: 0 }}
        />
      </svg>
    </div>
  )
}

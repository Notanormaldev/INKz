import { useEffect, useRef } from 'react'

class Particle {
  constructor(canvasWidth, canvasHeight) {
    const side = Math.floor(Math.random() * 4)
    if (side === 0) {
      this.pos = { x: Math.random() * canvasWidth, y: -30 }
    } else if (side === 1) {
      this.pos = { x: canvasWidth + 30, y: Math.random() * canvasHeight }
    } else if (side === 2) {
      this.pos = { x: Math.random() * canvasWidth, y: canvasHeight + 30 }
    } else {
      this.pos = { x: -30, y: Math.random() * canvasHeight }
    }

    this.vel = { x: 0, y: 0 }
    this.acc = { x: 0, y: 0 }
    this.target = { x: canvasWidth / 2, y: canvasHeight / 2 }

    this.closeEnoughTarget = 100
    this.maxSpeed = Math.random() * 5 + 4
    this.maxForce = this.maxSpeed * 0.05
    this.particleSize = Math.random() * 1.5 + 1.2
    this.isKilled = false

    this.alpha = 0.35 + Math.random() * 0.65
    this.colorWeight = 0
    this.colorBlendRate = Math.random() * 0.02 + 0.01
  }

  move() {
    let proximityMult = 1
    const distance = Math.hypot(this.pos.x - this.target.x, this.pos.y - this.target.y)

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }

    const magnitude = Math.hypot(towardsTarget.x, towardsTarget.y)
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }

    const steerMagnitude = Math.hypot(steer.x, steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y

    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }

    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * this.colorWeight})`
    ctx.fillRect(this.pos.x, this.pos.y, this.particleSize, this.particleSize)
  }

  kill(width, height) {
    if (!this.isKilled) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.hypot(width, height)

      this.target = {
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
      }
      this.maxSpeed = Math.random() * 8 + 5
      this.isKilled = true
    }
  }
}

const DEFAULT_WORDS = ["INKz", "K8s PODS", "S3 SYNC", "INKz", "AGENTIC AI", "DEV WORKSPACE", "CLOUD IDE"]

export default function ParticleTextEffect({ words = DEFAULT_WORDS }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const frameCountRef = useRef(0)
  const wordIndexRef = useRef(0)

  const pixelSteps = 5

  const nextWord = (word, canvas) => {
    if (!canvas || canvas.width === 0 || canvas.height === 0) return

    const offscreenCanvas = document.createElement("canvas")
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    const offscreenCtx = offscreenCanvas.getContext("2d")
    if (!offscreenCtx) return

    const dpr = window.devicePixelRatio || 1
    offscreenCtx.fillStyle = "white"

    // Calculate font size proportional to canvas height & width so text is 100% straight and undistorted
    const fontByHeight = canvas.height * 0.18
    const fontByWidth = canvas.width / (word.length * 0.8)
    const fontSize = Math.min(fontByHeight, fontByWidth)

    offscreenCtx.font = `900 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
    offscreenCtx.textAlign = "center"
    offscreenCtx.textBaseline = "middle"

    // Draw cleanly centered in top particle stage
    offscreenCtx.fillText(word, canvas.width / 2, canvas.height * 0.288)

    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    const particles = particlesRef.current
    let particleIndex = 0

    const coordsIndexes = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i)
    }

    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]]
    }

    for (const coordIndex of coordsIndexes) {
      const alpha = pixels[coordIndex + 3]

      if (alpha > 120) {
        const x = (coordIndex / 4) % canvas.width
        const y = Math.floor(coordIndex / 4 / canvas.width)

        let particle

        if (particleIndex < particles.length) {
          particle = particles[particleIndex]
          particle.isKilled = false
          particleIndex++
        } else {
          particle = new Particle(canvas.width, canvas.height)
          particles.push(particle)
        }

        particle.target.x = x
        particle.target.y = y
        particle.colorWeight = 0
      }
    }

    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const particles = particlesRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.move()
      particle.draw(ctx)

      if (particle.isKilled) {
        if (
          particle.pos.x < -100 ||
          particle.pos.x > canvas.width + 100 ||
          particle.pos.y < -100 ||
          particle.pos.y > canvas.height + 100
        ) {
          particles.splice(i, 1)
        }
      }
    }

    frameCountRef.current++
    if (frameCountRef.current % 240 === 0) {
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length
      nextWord(words[wordIndexRef.current], canvas)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        const dpr = window.devicePixelRatio || 1
        const width = container.clientWidth || 1000
        const height = container.clientHeight || 270

        // Match internal coordinate resolution to DPR to prevent blurriness
        canvas.width = width * dpr
        canvas.height = height * dpr

        // CSS display size matches original client dimensions
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        particlesRef.current = []
        nextWord(words[wordIndexRef.current], canvas)
      }
    }

    const timer = setTimeout(() => {
      resizeCanvas()
      nextWord(words[0], canvas)
      animate()
    }, 80)

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(timer)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="w-full h-full relative pointer-events-none z-0 flex items-center justify-center">
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}


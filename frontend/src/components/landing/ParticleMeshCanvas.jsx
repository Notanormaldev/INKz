import { useEffect, useRef } from 'react'

export default function ParticleMeshCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle 3D Terrain Grid (matching LeLo / Skal WebGL look)
    const cols = 60
    const rows = 40
    const dots = []

    let mouseX = width / 2
    let mouseY = height / 2
    let targetMouseX = mouseX
    let targetMouseY = mouseY

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        dots.push({
          u: (i / (cols - 1) - 0.5) * 2.8,
          v: (j / (rows - 1) - 0.5) * 2.2,
          gridI: i,
          gridJ: j,
        })
      }
    }

    // Starburst floating dust particles
    const sparks = []
    for (let i = 0; i < 90; i++) {
      sparks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.6,
        size: 0.8 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.5
      })
    }

    let time = 0

    const render = () => {
      time += 0.016
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      ctx.fillStyle = '#050508'
      ctx.fillRect(0, 0, width, height)

      // Radial Center Glow
      const centerGrad = ctx.createRadialGradient(
        width / 2, height * 0.45, 20,
        width / 2, height * 0.45, width * 0.5
      )
      centerGrad.addColorStop(0, 'rgba(235, 184, 0, 0.12)')
      centerGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.04)')
      centerGrad.addColorStop(1, 'rgba(5, 5, 8, 0)')
      ctx.fillStyle = centerGrad
      ctx.fillRect(0, 0, width, height)

      // Render Floating Dust Sparks
      ctx.fillStyle = 'rgba(255, 200, 100, 0.6)'
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        if (s.y < -10) s.y = height + 10
        if (s.x < -10) s.x = width + 10
        if (s.x > width + 10) s.x = -10

        ctx.fillStyle = `rgba(255, 220, 150, ${s.alpha})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Render 3D Dot Mesh
      const fov = 350
      const camY = -60 + ((mouseY / height) - 0.5) * 50
      const camZ = 320

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]

        const wave1 = Math.sin(d.gridI * 0.16 + time * 1.5) * 22
        const wave2 = Math.cos(d.gridJ * 0.2 + time * 1.8) * 16

        const worldX = d.u * 520
        const worldY = d.v * 260 + wave1 + wave2 + camY
        const worldZ = (d.gridJ / rows) * 420 + 60

        const scale = fov / (fov + worldZ)
        const projX = width / 2 + worldX * scale
        const projY = height * 0.42 + worldY * scale

        if (projX < 0 || projX > width || projY < 0 || projY > height) continue

        const dotSize = Math.max(0.6, 1.7 * scale)
        const alpha = Math.min(0.85, Math.max(0.08, (scale - 0.25) * 1.3))

        const isGolden = (d.gridI * 9 + d.gridJ * 17) % 7 === 0

        ctx.beginPath()
        ctx.arc(projX, projY, dotSize, 0, Math.PI * 2)

        if (isGolden) {
          ctx.fillStyle = `rgba(235, 184, 0, ${alpha * 0.95})`
        } else {
          ctx.fillStyle = `rgba(230, 230, 235, ${alpha * 0.55})`
        }
        ctx.fill()
      }

      // Subtle Vignette Overlay
      const vigGrad = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.35,
        width / 2, height / 2, width * 0.75
      )
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)')
      vigGrad.addColorStop(1, 'rgba(5,5,8,0.75)')
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, width, height)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  )
}

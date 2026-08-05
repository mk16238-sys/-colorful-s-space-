import { useCallback, useEffect, useRef, useState } from 'react'
import './Playground.css'

/* 预设配色 —— 全部落在紫 / 暖黄体系内 */
const PALETTES = [
  { key: 'dream', name: '梦紫', en: 'Violet Dream', colors: ['#8f72ff', '#ac95ff', '#cbbcff', '#7a55f0'] },
  { key: 'dusk', name: '暖昏', en: 'Warm Dusk', colors: ['#ffcf7f', '#f9b95c', '#ffe2ac', '#ff9f6b'] },
  { key: 'aurora', name: '极光', en: 'Aurora', colors: ['#7a55f0', '#ac95ff', '#ffcf7f', '#ffffff'] },
  { key: 'ink', name: '素白', en: 'Soft Ink', colors: ['#ffffff', '#e4dbff', '#cbbcff', '#f4efff'] },
]

export default function Playground({ lowPower }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const stateRef = useRef({
    particles: [],
    pointer: { x: 0, y: 0, active: false },
    running: false,
    autoT: 0,
    palette: PALETTES[0].colors,
    brush: 42,
  })

  const [paletteKey, setPaletteKey] = useState('dream')
  const [brush, setBrush] = useState(42)
  const [hex, setHex] = useState('#8F72FF')
  const [copied, setCopied] = useState(false)
  const [count, setCount] = useState(0)

  /* 同步配置到动画状态 */
  useEffect(() => {
    const p = PALETTES.find((x) => x.key === paletteKey) || PALETTES[0]
    stateRef.current.palette = p.colors
    setHex(p.colors[0].toUpperCase())
  }, [paletteKey])

  useEffect(() => {
    stateRef.current.brush = brush
  }, [brush])

  /* ---------------- Canvas 动画 ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d', { alpha: true })
    const S = stateRef.current

    const MAX = lowPower ? 90 : 260
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2)

    let w = 0
    let h = 0
    const resize = () => {
      const r = wrap.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const rand = (a, b) => a + Math.random() * (b - a)

    const spawn = (x, y, force = 1) => {
      if (S.particles.length > MAX) S.particles.splice(0, 8)
      const color = S.palette[Math.floor(Math.random() * S.palette.length)]
      S.particles.push({
        x,
        y,
        vx: rand(-0.5, 0.5) * force,
        vy: rand(-0.55, 0.15) * force,
        r: rand(S.brush * 0.45, S.brush * 1.25),
        color,
        life: 1,
        decay: rand(0.004, 0.011),
      })
      return color
    }

    const burst = (x, y) => {
      for (let i = 0; i < (lowPower ? 10 : 22); i++) {
        const a = (Math.PI * 2 * i) / (lowPower ? 10 : 22)
        const sp = rand(1.2, 3.4)
        const color = S.palette[Math.floor(Math.random() * S.palette.length)]
        S.particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          r: rand(S.brush * 0.4, S.brush * 0.95),
          color,
          life: 1,
          decay: rand(0.008, 0.016),
        })
      }
    }

    let raf = 0
    let frame = 0

    const draw = () => {
      raf = requestAnimationFrame(draw)
      frame++

      // 拖尾:淡出上一帧
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.045)'
      ctx.fillRect(0, 0, w, h)

      // 自动生成:无交互时也保持画面呼吸
      S.autoT += 0.01
      if (!S.pointer.active && frame % (lowPower ? 6 : 3) === 0) {
        const cx = w * (0.5 + 0.32 * Math.sin(S.autoT * 0.8))
        const cy = h * (0.5 + 0.26 * Math.cos(S.autoT * 1.15))
        spawn(cx, cy, 0.7)
      }

      ctx.globalCompositeOperation = 'lighter'
      const ps = S.particles
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.008 // 轻微上浮
        p.vx *= 0.99
        p.vy *= 0.99
        p.life -= p.decay
        if (p.life <= 0) {
          ps.splice(i, 1)
          continue
        }
        const alpha = Math.max(0, p.life) * 0.5
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
        g.addColorStop(0, hexA(p.color, alpha))
        g.addColorStop(0.55, hexA(p.color, alpha * 0.35))
        g.addColorStop(1, hexA(p.color, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (frame % 20 === 0) setCount(ps.length)
    }

    /* 视口内才运行,离开暂停(省电) */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !raf) {
          raf = requestAnimationFrame(draw)
        } else if (!entry.isIntersecting && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0.05 }
    )
    io.observe(wrap)

    /* 交互 */
    const point = (e) => {
      const r = canvas.getBoundingClientRect()
      const t = e.touches ? e.touches[0] : e
      return { x: t.clientX - r.left, y: t.clientY - r.top }
    }

    const onMove = (e) => {
      const { x, y } = point(e)
      S.pointer = { x, y, active: true }
      const c = spawn(x, y, 1)
      if (c) setHex(c.toUpperCase())
    }
    const onLeave = () => {
      S.pointer.active = false
    }
    const onDown = (e) => {
      const { x, y } = point(e)
      burst(x, y)
    }
    const onTouch = (e) => {
      onMove(e)
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('touchstart', onDown, { passive: true })
    canvas.addEventListener('touchmove', onTouch, { passive: true })
    canvas.addEventListener('touchend', onLeave)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('touchstart', onDown)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchend', onLeave)
    }
  }, [lowPower])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    stateRef.current.particles = []
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCount(0)
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="section playground" id="playground">
      <div className="shell">
        <header className="pg__head">
          <div>
            <span className="eyebrow reveal">Playground</span>
            <h2 className="h-section reveal" style={{ '--reveal-delay': '70ms' }}>
              互动体验
              <em className="serif grad-text"> / Color Lab</em>
            </h2>
          </div>
          <p className="lead pg__intro reveal" style={{ '--reveal-delay': '140ms' }}>
            设计不只是静态的稿。把光标放进下面这块画布,拖动作画、点击绽放 ——
            这是我理解色彩的方式,也是我平时做动效实验的小工具。
          </p>
        </header>

        <div className="pg__stage reveal reveal--scale">
          <div className="pg__canvas-wrap glass glass--edge" ref={wrapRef}>
            <canvas ref={canvasRef} className="pg__canvas" />

            <div className="pg__hud">
              <span className="mono">COLOR LAB v1.0</span>
              <span className="mono">
                PARTICLES <b>{String(count).padStart(3, '0')}</b>
              </span>
            </div>

            <div className="pg__hint mono">
              <span className="pg__hint-dot" />
              拖动作画 · 点击绽放
            </div>

            <div className="pg__grid-lines" aria-hidden="true" />
          </div>

          {/* 控制面板 */}
          <aside className="pg__panel glass glass--strong">
            <div className="pg__panel-block">
              <span className="mono pg__panel-label">PALETTE</span>
              <div className="pg__palettes">
                {PALETTES.map((p) => (
                  <button
                    key={p.key}
                    className={`pg__palette ${paletteKey === p.key ? 'is-active' : ''}`}
                    onClick={() => setPaletteKey(p.key)}
                    data-cursor="link"
                  >
                    <span className="pg__swatches">
                      {p.colors.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                    <span className="pg__palette-name">
                      {p.name}
                      <em className="mono">{p.en}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pg__panel-block">
              <span className="mono pg__panel-label">
                BRUSH <b>{brush}</b>
              </span>
              <input
                type="range"
                min="16"
                max="90"
                value={brush}
                onChange={(e) => setBrush(Number(e.target.value))}
                className="pg__range"
                aria-label="笔刷大小"
              />
            </div>

            <div className="pg__panel-block">
              <span className="mono pg__panel-label">CURRENT</span>
              <button className="pg__hex" onClick={copy} data-cursor="link">
                <span className="pg__hex-chip" style={{ background: hex }} />
                <span className="pg__hex-value">{hex}</span>
                <span className="pg__hex-copy mono">{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            <button className="btn btn--ghost pg__clear" onClick={clear} data-cursor="link">
              清空画布
            </button>

            <p className="pg__note mono">
              CANVAS 2D · 粒子叠加渲染
              <br />
              移动端自动降级粒子数
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}

/* hex → rgba */
function hexA(hex, a) {
  const h = hex.replace('#', '')
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16
  )
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

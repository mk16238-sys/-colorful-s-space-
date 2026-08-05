import { useEffect, useRef } from 'react'
import { hero, site } from '../data/site.js'
import DriftWall from './DriftWall.jsx'
import CursorGrid from './CursorGrid.jsx'
import './Hero.css'

const showcaseItems = [
  { image: 'media/showcase/1.png', title: '作品展示 1' },
  { image: 'media/showcase/2.png', title: '作品展示 2' },
  { image: 'media/showcase/3.png', title: '作品展示 3' },
  { image: 'media/showcase/画框.png', title: '画框' },
  { image: 'media/showcase/画框备份.png', title: '画框备份' },
  { image: 'media/showcase/画框备份%202.png', title: '画框备份 2' },
  { image: 'media/showcase/画框备份%203.png', title: '画框备份 3' },
  { image: 'media/showcase/画框备份%204.png', title: '画框备份 4' },
  { image: 'media/showcase/画框备份%205.png', title: '画框备份 5' },
]

export default function Hero({ ready, lowPower }) {
  const rootRef = useRef(null)

  /* 鼠标视差(仅桌面) */
  useEffect(() => {
    if (lowPower) return
    const root = rootRef.current
    if (!root) return
    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2
        root.style.setProperty('--mx', x.toFixed(3))
        root.style.setProperty('--my', y.toFixed(3))
        raf = 0
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [lowPower])

  /* 滚动淡出 */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const p = Math.min(1, window.scrollY / (window.innerHeight * 0.85))
        root.style.setProperty('--sp', p.toFixed(3))
        raf = 0
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const scrollNext = () => {
    const el = document.getElementById('about')
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 76,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className={`hero ${ready ? 'is-ready' : ''}`} ref={rootRef}>
      {/* 背景:动态极光 */}
      <div className="hero__aurora" aria-hidden="true">
        <span className="blob blob--1" />
        <span className="blob blob--2" />
        <span className="blob blob--3" />
        <span className="blob blob--4" />
        <div className="hero__grid" />
      </div>

      {/* 网格光标(仅首屏) */}
      {!lowPower && (
        <div className="hero__cursor-grid" aria-hidden="true">
          <CursorGrid
            cellSize={60}
            color="#c084fc"
            radius={160}
            falloff="smooth"
            holdTime={360}
            fadeDuration={760}
            lineWidth={1.1}
            maxOpacity={0.85}
            fillOpacity={0}
            gridOpacity={0}
            cellRadius={8}
            clickPulse
            pulseSpeed={620}
          />
        </div>
      )}

      {/* 遮罩:保证左侧文案可读 */}
      <div className="hero__scrim" aria-hidden="true" />

      {/* 内容 */}
      <div className="hero__content shell">
        <div className="hero__copy">
          <div className="hero__eyebrow">
            <span className="eyebrow eyebrow--dot">{hero.eyebrow}</span>
          </div>

          <h1 className="hero__title h-display">
            <span className="line">
              <em>{hero.titleLines[0]}</em>
            </span>
            <span className="line">
              <em>
                {hero.titleLines[1]}
                <i className="hero__accent serif">{hero.titleAccent}</i>
              </em>
            </span>
          </h1>

          <p className="hero__sub lead">
            {hero.subtitle.split('\n').map((line, i) => (
              <span key={i} className="hero__sub-line">
                {line}
              </span>
            ))}
          </p>

          <div className="hero__actions">
            <a
              href="#about"
              className="btn btn--primary"
              data-cursor="link"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('about')
                if (el)
                  window.scrollTo({
                    top: el.getBoundingClientRect().top + window.scrollY - 76,
                    behavior: 'smooth',
                  })
              }}
            >
              开始探索
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="btn__arrow">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#works"
              className="btn btn--ghost"
              data-cursor="link"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('works')
                if (el)
                  window.scrollTo({
                    top: el.getBoundingClientRect().top + window.scrollY - 76,
                    behavior: 'smooth',
                  })
              }}
            >
              浏览作品
            </a>
          </div>
        </div>

        <div className="hero__wall" aria-hidden="true">
          <DriftWall
            items={showcaseItems}
            columns={4}
            tileWidth={280}
            tileHeight={190}
            gap={20}
            tilt={16}
            turn={-16}
            perspective={1200}
            depth={120}
            speed={32}
            direction="up"
            variance={0.45}
            parallax={0.45}
            lift={58}
            fade={0.28}
            dim={0.5}
            overlayColor="rgba(7, 2, 18, 0.5)"
          />
        </div>
      </div>

      {/* 底部信息条 */}
      <div className="hero__bar shell">
        <span className="mono">BASED IN {site.location.replace('中国 · ', '').toUpperCase()}</span>

        <button className="hero__scroll" onClick={scrollNext} aria-label={hero.scrollHint}>
          <span className="hero__scroll-line">
            <i />
          </span>
          <span className="mono">{hero.scrollHint}</span>
        </button>

        <span className="mono">{site.since} — 2026</span>
      </div>
    </section>
  )
}

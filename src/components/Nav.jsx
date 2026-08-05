import { useCallback, useEffect, useRef, useState } from 'react'
import { nav, site } from '../data/site.js'
import './Nav.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const [pill, setPill] = useState({ x: 0, w: 0, on: false })
  const listRef = useRef(null)

  /* 滚动状态 */
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40)
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

  /* Scroll spy */
  useEffect(() => {
    const sections = nav
      .map((n) => document.getElementById(n.id))
      .filter(Boolean)
    if (!sections.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5] }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  /* 高亮滑块跟随 active */
  const syncPill = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const el = list.querySelector(`[data-nav-id="${active}"]`)
    if (!el) return setPill((p) => ({ ...p, on: false }))
    setPill({ x: el.offsetLeft, w: el.offsetWidth, on: true })
  }, [active])

  useEffect(() => {
    syncPill()
    window.addEventListener('resize', syncPill)
    return () => window.removeEventListener('resize', syncPill)
  }, [syncPill])

  /* 菜单打开时锁滚动 */
  useEffect(() => {
    if (open) {
      const y = window.scrollY
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
        window.scrollTo(0, y)
      }
    }
  }, [open])

  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 76
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const onEnter = (e) => {
    const el = e.currentTarget
    setPill({ x: el.offsetLeft, w: el.offsetWidth, on: true })
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="nav__shell">
          <a
            className="nav__logo"
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              setOpen(false)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            data-cursor="link"
          >
            <span className="nav__logo-dot" />
            <span className="nav__logo-text">
              colorful's <em className="serif">space</em>
            </span>
          </a>

          <nav className="nav__center" aria-label="主导航">
            <ul className="nav__list" ref={listRef} onMouseLeave={syncPill}>
              <li
                className={`nav__pill ${pill.on ? 'is-on' : ''}`}
                style={{ transform: `translateX(${pill.x}px)`, width: `${pill.w}px` }}
                aria-hidden="true"
              />
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    data-nav-id={item.id}
                    className={`nav__link ${active === item.id ? 'is-active' : ''}`}
                    onClick={(e) => go(e, item.id)}
                    onMouseEnter={onEnter}
                    data-cursor="link"
                  >
                    <span className="nav__link-cn">{item.label}</span>
                    <span className="nav__link-en mono">{item.en}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav__right">
            <a
              href="#contact"
              className="nav__cta"
              onClick={(e) => go(e, 'contact')}
              data-cursor="link"
            >
              联系我
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="btn__arrow">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <button
              className={`nav__burger ${open ? 'is-open' : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? '关闭菜单' : '打开菜单'}
              aria-expanded={open}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* 移动端全屏菜单 */}
      <div className={`menu ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true">
        <ul className="menu__list">
          {nav.map((item, i) => (
            <li key={item.id} style={{ '--i': i }}>
              <a href={`#${item.id}`} onClick={(e) => go(e, item.id)}>
                <span className="menu__idx mono">0{i + 1}</span>
                <span className="menu__label">{item.label}</span>
                <span className="menu__en serif">{item.en}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="menu__foot">
          <span className="mono">{site.role}</span>
          <span className="mono">{site.location}</span>
        </div>
      </div>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { about, site } from '../data/site.js'
import { useReveal } from '../hooks/useReveal.js'
import SpotlightCard from './SpotlightCard.jsx'
import BorderGlow from './BorderGlow.jsx'
import './About.css'

/* 数字滚动 */
function CountUp({ value }) {
  const ref = useRef(null)
  const [text, setText] = useState('0')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const match = String(value).match(/^(\d+)(.*)$/)
    if (!match) {
      setText(value)
      return
    }
    const end = parseInt(match[1], 10)
    const suffix = match[2] || ''

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const dur = 1200
        const t0 = performance.now()
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          setText(Math.round(end * eased) + suffix)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value])

  return <span ref={ref}>{text}</span>
}

/* 工作经历卡片 */
function ExperienceCard({ item, index }) {
  const [open, setOpen] = useState(false)
  const cardRef = useRef(null)
  useReveal()

  /* 触摸设备：点击展开，再次点击或点击外部收起 */
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const onClickOutside = (e) => {
      if (!card.contains(e.target)) setOpen(false)
    }
    if (open) {
      document.addEventListener('click', onClickOutside)
      return () => document.removeEventListener('click', onClickOutside)
    }
  }, [open])

  return (
    <li
      ref={cardRef}
      className={`exp__item reveal ${open ? 'is-open' : ''}`}
      style={{ '--reveal-delay': `${index * 100}ms` }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="exp__node" aria-hidden="true">
        <i />
      </div>

      <SpotlightCard className="exp__card" spotlightColor="rgba(143, 114, 255, 0.22)">
        <div className="exp__header">
          <div className="exp__meta">
            <span className="exp__period mono">{item.period}</span>
            <h3 className="exp__company">{item.company}</h3>
            <span className="exp__role">{item.role}</span>
          </div>
          <div className="exp__tags">
            {item.tags.map((t) => (
              <span className="exp__tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="exp__body">
          <div>
            <span className="exp__body-label">负责内容</span>
            <ul>
              {item.duties.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </SpotlightCard>
    </li>
  )
}

export default function About() {
  useReveal()

  return (
    <section className="section about" id="about">
      <div className="shell">
        <div className="about__grid">
          {/* 左:头像 + 数据 */}
          <aside className="about__aside">
            <figure className="about__portrait glass glass--edge reveal reveal--scale">
              <img src={about.avatar} alt={`${site.nameShort} 的头像`} loading="lazy" />
              <figcaption>
                <span className="about__portrait-name">
                  {site.nameShort}
                  <em className="serif">.</em>
                </span>
                <span className="about__portrait-role mono">YOUR DESIGNER</span>
              </figcaption>
              <span className="about__halo" aria-hidden="true" />
            </figure>

            <ul className="about__stats">
              {about.stats.map((s, i) => (
                <BorderGlow
                  key={s.label}
                  as="li"
                  className="about__stat reveal"
                  style={{ '--reveal-delay': `${i * 90}ms` }}
                  backgroundColor="rgba(18, 12, 32, 0.55)"
                  borderRadius={22}
                  glowRadius={32}
                  glowIntensity={0.85}
                  edgeSensitivity={28}
                  colors={['#b794f6', '#f6ad55', '#63b3ed']}
                  glowColor="270 70 75"
                >
                  <strong className="about__stat-value">
                    <CountUp value={s.value} />
                  </strong>
                  <span className="about__stat-label">{s.label}</span>
                  <span className="about__stat-en mono">{s.en}</span>
                </BorderGlow>
              ))}
            </ul>

            {/* 技能 */}
            <div className="about__skills reveal" style={{ '--reveal-delay': '120ms' }}>
              <span className="mono about__block-label">SKILLS</span>
              <div className="about__skill-list">
                {about.skills.map((t) => (
                  <span className="chip chip--skill" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* 右:自述 + 工作经历 + 技能 */}
          <div className="about__main">
            <span className="eyebrow reveal">{about.eyebrow}</span>

            <h2 className="h-section about__title reveal" style={{ '--reveal-delay': '80ms' }}>
              {about.title.split('\n').map((line, i) => (
                <span key={i} className="about__title-line">
                  {line}
                </span>
              ))}
            </h2>

            <div className="about__text">
              {about.paragraphs.map((p, i) => (
                <p key={i} className="lead reveal" style={{ '--reveal-delay': `${140 + i * 80}ms` }}>
                  {p}
                </p>
              ))}
            </div>

            {about.signature && (
              <blockquote className="about__quote reveal" style={{ '--reveal-delay': '200ms' }}>
                <span className="about__quote-mark serif">"</span>
                <span className="serif">{about.signature}</span>
              </blockquote>
            )}

            {/* 工作经历 */}
            <div className="about__experience">
              <span className="mono about__block-label">EXPERIENCE</span>
              <ul className="exp__list">
                {about.experience.map((item, i) => (
                  <ExperienceCard item={item} index={i} key={item.company} />
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

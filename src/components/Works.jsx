import { useEffect, useState } from 'react'
import { works } from '../data/site.js'
import { useReveal } from '../hooks/useReveal.js'
import BorderGlow from './BorderGlow.jsx'
import './Works.css'

/* ---------------- 灯箱 ---------------- */
function Lightbox({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!item) return null

  return (
    <div className="lb" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <div className={`lb__inner ${item.href ? 'lb__inner--preview' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={`lb__media glass ${item.href ? 'lb__media--preview' : ''}`}>
          {item.type === 'video' ? (
            <video
              src={item.video}
              poster={item.cover}
              controls
              autoPlay
              loop
              playsInline
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.add('is-on')
              }}
            />
          ) : item.href ? (
            <iframe
              className="lb__iframe"
              src={item.href}
              title={item.title}
              allow="fullscreen"
            />
          ) : (
            <img src={item.cover} alt={item.title} />
          )}
          {item.type === 'video' && (
            <div className="lb__fallback">
              <img src={item.cover} alt={item.title} />
              <p className="mono">视频素材待上传 · 请将 mp4 放入 public{item.video}</p>
            </div>
          )}
        </div>

        <div className="lb__meta">
          <div>
            <span className="mono">
              {item.year} · {item.tags.join(' / ')}
            </span>
            <h3 className="h-card">{item.title}</h3>
            <p className="lead">{item.desc}</p>
          </div>
        </div>
      </div>

      <button className="lb__close" onClick={onClose} aria-label="关闭">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

/* ---------------- 作品卡片 ---------------- */
function WorkCard({ item, index, onOpen }) {
  const num = String(index + 1).padStart(2, '0')
  const category = `${item.tags.join(' / ').toUpperCase()} / ${item.year}`
  const isPreview = item.type === 'preview' || item.href

  return (
    <BorderGlow
      as="article"
      className={`work reveal reveal--scale ${isPreview ? 'work--preview' : ''}`}
      style={{
        '--reveal-delay': `${(index % 2) * 110}ms`,
        ...(isPreview
          ? {
              '--work-gradient':
                'linear-gradient(180deg, rgba(2,4,10,0.32) 0%, rgba(2,4,10,0.78) 100%)',
            }
          : {}),
      }}
      onClick={() => onOpen(item)}
      data-cursor="view"
      data-cursor-label="View"
      backgroundColor="rgba(12, 8, 24, 0.72)"
      borderRadius={24}
      glowRadius={36}
      glowIntensity={0.9}
      edgeSensitivity={26}
      colors={['#b794f6', '#f6ad55', '#63b3ed']}
      glowColor="270 70 75"
    >
      {isPreview && <img className="work__cover" src={item.cover} alt="" />}
      <div className="work__bg" aria-hidden="true" />
      <div className="work__blur" aria-hidden="true" />

      <span className="work__year mono">{item.year}</span>
      <span className="work__num mono">{num}</span>

      <div className="work__body">
        <div className="work__main">
          <h3 className="work__title">{item.title}</h3>
          <p className="work__category mono">{category}</p>
          <p className="work__subtitle">{item.subtitle}</p>
          <p className="work__desc">{item.desc}</p>
        </div>

        <ul className="work__tags">
          {item.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
          {isPreview && <li className="work__tag-link">↗ 查看演示</li>}
        </ul>
      </div>

      <span className="work__glow" aria-hidden="true" />
    </BorderGlow>
  )
}

/* ---------------- 主区块 ---------------- */
export default function Works() {
  const [active, setActive] = useState(null)
  useReveal()

  return (
    <section className="section works" id="works">
      <div className="shell">
        <header className="works__head">
          <span className="eyebrow reveal">Selected Works</span>
          <h2 className="h-section reveal" style={{ '--reveal-delay': '70ms' }}>
            作品案例
            <em className="serif grad-text"> / Works</em>
          </h2>
        </header>

        <div className="works__grid">
          {works.map((item, i) => (
            <WorkCard key={item.id} item={item} index={i} onOpen={setActive} />
          ))}
        </div>
      </div>

      {active && <Lightbox item={active} onClose={() => setActive(null)} />}
    </section>
  )
}

import { useEffect, useState } from 'react'
import './BackToTop.css'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.35
      setVisible(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      className={`back-to-top ${visible ? 'is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="回到顶部"
      data-cursor="link"
    >
      <span className="back-to-top__dot" aria-hidden="true" />
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 13V3M4 7l4-4 4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="mono">BACK TO TOP</span>
    </button>
  )
}

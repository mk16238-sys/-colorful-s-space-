import { useEffect, useState } from 'react'
import './Intro.css'

const DURATION = 1500

export default function Intro({ onDone }) {
  const [phase, setPhase] = useState('in') // in → out → gone

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('out')
      onDone?.()
    }, DURATION)
    const t2 = setTimeout(() => setPhase('gone'), DURATION + 1000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  if (phase === 'gone') return null

  return (
    <div className={`intro intro--${phase}`} aria-hidden="true">
      <div className="intro__inner">
        <div className="intro__mark">
          <span className="intro__dot" />
          <span className="intro__word">colorful's</span>
          <span className="intro__word intro__word--serif serif">space</span>
        </div>
        <div className="intro__bar">
          <i />
        </div>
        <div className="intro__meta mono">UI DESIGNER · PORTFOLIO 2026</div>
      </div>
    </div>
  )
}

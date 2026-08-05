import { useRef } from 'react'
import './SpotlightCard.css'

export default function SpotlightCard({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.18)' }) {
  const divRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = divRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
    card.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  )
}

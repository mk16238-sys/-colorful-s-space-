import { useEffect, useState } from 'react'
import { site } from '../data/site.js'
import './Footer.css'

export default function Footer() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setTime(
        d.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__mark reveal">
          <span>colorful's</span>
          <em className="serif">space</em>
        </div>

        <div className="footer__bar">
          <span className="mono">
            © {new Date().getFullYear()} {site.name} · ALL RIGHTS RESERVED
          </span>

          <span className="mono footer__time">
            {site.location.replace('中国 · ', '')} <b>{time}</b>
          </span>

        </div>
      </div>
    </footer>
  )
}

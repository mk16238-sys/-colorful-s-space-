import { useEffect, useRef } from 'react'
import './Cursor.css'

/**
 * 自定义光标:小圆点即时跟随 + 外环缓动跟随
 * 在元素上加 data-cursor="view" / "link" 可切换状态与文案
 */
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { ...target }
    let raf = 0
    let visible = false

    const onMove = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      if (!visible) {
        visible = true
        dot.classList.add('is-on')
        ring.classList.add('is-on')
      }

      const hit = e.target.closest?.('[data-cursor]')
      const mode = hit?.dataset.cursor
      ring.dataset.mode = mode || ''
      if (label) label.textContent = hit?.dataset.cursorLabel || ''
    }

    const onLeave = () => {
      visible = false
      dot.classList.remove('is-on')
      ring.classList.remove('is-on')
    }

    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16
      pos.y += (target.y - pos.y) * 0.16
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true">
        <span className="cursor-ring__label" ref={labelRef} />
      </div>
    </>
  )
}

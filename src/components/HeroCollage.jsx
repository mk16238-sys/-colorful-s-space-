import { useEffect, useState } from 'react'
import collage from '../data/collage.json'
import './HeroCollage.css'

export default function HeroCollage({ ready, lowPower }) {
  const [loaded, setLoaded] = useState(0)

  // 等所有小图解码完再整体淡入,避免动画过程中图片闪烁
  useEffect(() => {
    if (lowPower || !ready) return
    let cancelled = false
    const imgs = collage.pieces.map((p) => {
      const img = new Image()
      img.src = `media/collage/${p.id}.webp`
      return img
    })
    let done = 0
    imgs.forEach((img) => {
      if (img.complete) {
        done += 1
      } else {
        img.onload = () => {
          done += 1
          if (!cancelled) setLoaded(done)
        }
        img.onerror = () => {
          done += 1
          if (!cancelled) setLoaded(done)
        }
      }
    })
    if (imgs.every((i) => i.complete) && !cancelled) setLoaded(imgs.length)
    return () => {
      cancelled = true
    }
  }, [ready, lowPower])

  const { sourceSize, pieces } = collage
  const canPlay = ready && (lowPower || loaded >= pieces.length * 0.5)

  return (
    <div className={`hero-collage ${canPlay ? 'is-ready' : ''}`} aria-hidden="true">
      <div
        className="hero-collage__board"
        style={{
          '--src-w': sourceSize.w,
          '--src-h': sourceSize.h,
        }}
      >
        {pieces.map((p) => (
          <img
            key={p.id}
            className={`hero-collage__piece hero-collage__piece--${p.type}`}
            src={`media/collage/${p.id}.webp`}
            alt=""
            loading="eager"
            decoding="async"
            style={{
              '--x': (p.x / sourceSize.w) * 100,
              '--y': (p.y / sourceSize.h) * 100,
              '--w': (p.w / sourceSize.w) * 100,
              '--h': (p.h / sourceSize.h) * 100,
              '--delay': p.delay,
              '--angle': p.angle,
              '--fromX': p.fromX,
              '--fromY': p.fromY,
              '--fromRot': p.fromRot,
            }}
          />
        ))}
      </div>
    </div>
  )
}

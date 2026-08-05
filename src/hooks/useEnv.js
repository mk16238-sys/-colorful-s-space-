import { useEffect, useState } from 'react'

/** 媒体查询 hook */
export function useMedia(query, defaultValue = false) {
  const [match, setMatch] = useState(() => {
    if (typeof window === 'undefined') return defaultValue
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatch(e.matches)
    setMatch(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return match
}

/**
 * 环境能力探测:决定是否开启重度动效
 * 触屏 / 窄屏 / 低核心数 / 用户偏好减少动效 → 降级
 */
export function useLowPower() {
  const coarse = useMedia('(pointer: coarse)')
  const narrow = useMedia('(max-width: 900px)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const [weakDevice, setWeakDevice] = useState(false)

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 8
    const mem = navigator.deviceMemory || 8
    setWeakDevice(cores <= 4 || mem <= 4)
  }, [])

  return coarse || narrow || reduced || weakDevice
}

/** 滚动位置(节流到 rAF) */
export function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        setY(window.scrollY)
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
  return y
}

import { useEffect } from 'react'

/**
 * 全局滚动进场:为所有 .reveal 元素在进入视口时添加进场标记
 *
 * 说明:
 * 1. 用 data-reveal="in" 作为真实状态,而不是 class。
 *    React 的 className diff 会在组件重渲染时覆盖外部用 classList 添加的 class,
 *    导致 .is-in 被意外移除(如工作经历卡片 hover 展开时)。
 * 2. 同时保留 .is-in class 作为兼容性标记,方便其他脚本或样式使用。
 * 3. 使用单一 IntersectionObserver,避免每个组件各起一个,移动端更省电。
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal:not([data-reveal="in"])')
    if (!nodes.length) return

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => {
        n.classList.add('is-in')
        n.setAttribute('data-reveal', 'in')
      })
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            entry.target.setAttribute('data-reveal', 'in')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    )

    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

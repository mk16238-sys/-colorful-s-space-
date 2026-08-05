import { useEffect, useState } from 'react'
import Intro from './components/Intro.jsx'
import Cursor from './components/Cursor.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Works from './components/Works.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'
import { useReveal } from './hooks/useReveal.js'
import { useLowPower } from './hooks/useEnv.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const lowPower = useLowPower()

  useReveal([ready])

  // 开场动画期间锁定滚动
  useEffect(() => {
    document.body.style.overflow = ready ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [ready])

  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      <Intro onDone={() => setReady(true)} />
      {!lowPower && <Cursor />}

      <Nav />

      <main id="top">
        <Hero ready={ready} lowPower={lowPower} />
        <About />
        <Works />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
      <div className="noise" aria-hidden="true" />
    </>
  )
}

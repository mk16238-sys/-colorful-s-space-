import { useState } from 'react'
import { contact } from '../data/site.js'
import BorderGlow from './BorderGlow.jsx'
import './Contact.css'

function CopyBtn({ value, label }) {
  const [ok, setOk] = useState(false)
  const copy = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setOk(true)
      setTimeout(() => setOk(false), 1600)
    } catch {
      setOk(false)
    }
  }
  return (
    <button className={`cc__copy ${ok ? 'is-ok' : ''}`} onClick={copy} aria-label={`复制${label}`}>
      {ok ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="5.5" y="5.5" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 3.5H4a1.5 1.5 0 00-1.5 1.5v6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      <span className="mono">{ok ? 'COPIED' : 'COPY'}</span>
    </button>
  )
}

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="shell">
        <div className="cc__head">
          <span className="eyebrow reveal">{contact.eyebrow}</span>
          <h2 className="h-section cc__title reveal" style={{ '--reveal-delay': '70ms' }}>
            有想法，<em className="serif grad-text">我们聊聊。</em>
          </h2>
          <span className="cc__avail reveal" style={{ '--reveal-delay': '140ms' }}>
            <i />
            {contact.availability}
          </span>
        </div>

        <div className="cc__cards">
          {/* 电话 */}
          <BorderGlow
            as="a"
            href={`tel:${contact.phoneRaw}`}
            className="cc__card reveal reveal--scale"
            data-cursor="link"
            backgroundColor="rgba(18, 12, 32, 0.55)"
            borderRadius={22}
            glowRadius={32}
            glowIntensity={0.85}
            edgeSensitivity={28}
            colors={['#b794f6', '#f6ad55', '#63b3ed']}
            glowColor="270 70 75"
          >
            <span className="cc__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.7 2 2 0 016.5 3.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="cc__card-body">
              <span className="mono cc__card-label">PHONE · 电话</span>
              <strong className="cc__card-value">{contact.phone}</strong>
            </div>
            <CopyBtn value={contact.phoneRaw} label="电话" />
          </BorderGlow>

          {/* 邮箱 */}
          <BorderGlow
            as="a"
            href={`mailto:${contact.email}`}
            className="cc__card reveal reveal--scale"
            style={{ '--reveal-delay': '110ms' }}
            data-cursor="link"
            backgroundColor="rgba(18, 12, 32, 0.55)"
            borderRadius={22}
            glowRadius={32}
            glowIntensity={0.85}
            edgeSensitivity={28}
            colors={['#b794f6', '#f6ad55', '#63b3ed']}
            glowColor="270 70 75"
          >
            <span className="cc__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 7.5l8 5.5 8-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <div className="cc__card-body">
              <span className="mono cc__card-label">EMAIL · 邮箱</span>
              <strong className="cc__card-value">{contact.email}</strong>
            </div>
            <CopyBtn value={contact.email} label="邮箱" />
          </BorderGlow>

          {/* 微信 */}
          <BorderGlow
            as="a"
            href={`weixin://dl/chat?${contact.wechat}`}
            className="cc__card reveal reveal--scale"
            style={{ '--reveal-delay': '220ms' }}
            data-cursor="link"
            backgroundColor="rgba(18, 12, 32, 0.55)"
            borderRadius={22}
            glowRadius={32}
            glowIntensity={0.85}
            edgeSensitivity={28}
            colors={['#b794f6', '#f6ad55', '#63b3ed']}
            glowColor="270 70 75"
          >
            <span className="cc__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18.6 11.1c0-3.4-3.3-6.2-7.4-6.2S3.8 7.7 3.8 11.1c0 3.1 2.8 5.6 6.5 6.1.3.7.9 2.3 1 2.6.1.2.3.2.5.1.4-.2 2.1-1.3 3-2.1 2.9-.9 4.8-2.8 4.8-5.1z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="cc__card-body">
              <span className="mono cc__card-label">WECHAT · 微信</span>
              <strong className="cc__card-value">{contact.wechat}</strong>
            </div>
            <CopyBtn value={contact.wechat} label="微信号" />
          </BorderGlow>
        </div>
      </div>
    </section>
  )
}

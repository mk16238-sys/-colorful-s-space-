/**
 * 生成占位素材(SVG)
 * 运行: node scripts/gen-placeholders.mjs
 * 后续用真实图片替换 public/media/posters/ 下的同名文件即可(改成 .jpg 时记得同步 src/data/site.js)
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../public/media/posters')
mkdirSync(OUT, { recursive: true })

const blobs = (list) =>
  list
    .map(
      (b) =>
        `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="${b.c}" opacity="${b.o ?? 0.85}" filter="url(#soft)"/>`
    )
    .join('\n    ')

function poster({ w, h, idx, title, sub, colors, seed = 0 }) {
  const [c1, c2, c3] = colors
  const g = 64
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#140c26"/>
      <stop offset="1" stop-color="#0a0616"/>
    </linearGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="${Math.round(w * 0.07)}"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <pattern id="grid" width="${g}" height="${g}" patternUnits="userSpaceOnUse">
      <path d="M ${g} 0 L 0 0 0 ${g}" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c1}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${c2}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${c3}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g>
    ${blobs([
      { x: w * (0.22 + seed * 0.05), y: h * 0.3, r: w * 0.3, c: c1, o: 0.8 },
      { x: w * (0.74 - seed * 0.04), y: h * 0.24, r: w * 0.22, c: c2, o: 0.6 },
      { x: w * 0.56, y: h * (0.86 + seed * 0.02), r: w * 0.34, c: c3, o: 0.55 },
    ])}
  </g>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.05"/>

  <!-- 装饰线 -->
  <rect x="${w * 0.08}" y="${h * 0.52}" width="${w * 0.84}" height="1.5" fill="url(#line)"/>
  <circle cx="${w * 0.08}" cy="${h * 0.52 + 0.75}" r="4" fill="${c2}"/>

  <!-- 文字 -->
  <text x="${w * 0.08}" y="${h * 0.44}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${Math.round(w * 0.115)}" font-weight="700" fill="#ffffff" fill-opacity="0.9"
        letter-spacing="${-w * 0.006}">${idx}</text>

  <text x="${w * 0.08}" y="${h * 0.62}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${Math.round(w * 0.032)}" font-weight="600" fill="#ffffff" fill-opacity="0.86">${title}</text>

  <text x="${w * 0.08}" y="${h * 0.68}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${Math.round(w * 0.019)}" font-weight="400" fill="#ffffff" fill-opacity="0.42"
        letter-spacing="${w * 0.004}">${sub}</text>

  <text x="${w * 0.92}" y="${h * 0.93}" text-anchor="end" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${Math.round(w * 0.014)}" fill="#ffffff" fill-opacity="0.3"
        letter-spacing="${w * 0.005}">COLORFUL'S SPACE</text>
</svg>`
}

const P = {
  violet: ['#7a55f0', '#ac95ff', '#5b2fc4'],
  warm: ['#ffcf7f', '#f9b95c', '#c98a4a'],
  mix: ['#8f72ff', '#ffcf7f', '#6035d4'],
  soft: ['#cbbcff', '#ffe2ac', '#8f72ff'],
  deep: ['#6035d4', '#ac95ff', '#ff9f6b'],
  glow: ['#ac95ff', '#ffcf7f', '#7a55f0'],
}

const items = [
  { file: 'work-01.svg', w: 1600, h: 900, idx: '01', title: 'Aurora Design System', sub: 'DESIGN SYSTEM / MOTION · 2025', colors: P.mix, seed: 0 },
  { file: 'work-02.svg', w: 1200, h: 1600, idx: '02', title: 'Bloom Branding', sub: 'BRANDING / POSTER · 2025', colors: P.warm, seed: 1 },
  { file: 'work-03.svg', w: 1400, h: 1050, idx: '03', title: 'Lumen App', sub: 'MOBILE / UI · 2024', colors: P.violet, seed: 2 },
  { file: 'work-04.svg', w: 1400, h: 1050, idx: '04', title: 'Motion Study 001', sub: 'MOTION / INTERACTION · 2024', colors: P.glow, seed: 3 },
  { file: 'work-05.svg', w: 1400, h: 1050, idx: '05', title: 'Prism Dataviz', sub: 'DATA VIZ / WEB · 2024', colors: P.deep, seed: 4 },
  { file: 'work-06.svg', w: 1600, h: 900, idx: '06', title: 'Warmth Poster Series', sub: 'POSTER / EXPERIMENT · 2023', colors: P.soft, seed: 5 },
  { file: 'hero-poster.svg', w: 1920, h: 1080, idx: '', title: '', sub: '', colors: P.mix, seed: 2 },
]

items.forEach((it) => {
  writeFileSync(resolve(OUT, it.file), poster(it), 'utf8')
  console.log('✓', it.file)
})

/* ---------- 头像占位 ---------- */
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1250" viewBox="0 0 1000 1250" fill="none">
  <defs>
    <linearGradient id="ab" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a1030"/>
      <stop offset="1" stop-color="#0b0716"/>
    </linearGradient>
    <filter id="s" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="90"/>
    </filter>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ac95ff"/>
      <stop offset="1" stop-color="#ffcf7f"/>
    </linearGradient>
    <filter id="g2">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="1000" height="1250" fill="url(#ab)"/>
  <circle cx="330" cy="420" r="300" fill="#7a55f0" opacity="0.8" filter="url(#s)"/>
  <circle cx="760" cy="330" r="220" fill="#ffcf7f" opacity="0.5" filter="url(#s)"/>
  <circle cx="560" cy="1010" r="330" fill="#ac95ff" opacity="0.55" filter="url(#s)"/>
  <rect width="1000" height="1250" filter="url(#g2)" opacity="0.05"/>

  <circle cx="500" cy="560" r="185" fill="none" stroke="url(#ring)" stroke-width="2" opacity="0.7"/>
  <circle cx="500" cy="560" r="140" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
  <text x="500" y="600" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="112" font-weight="700" fill="#ffffff" fill-opacity="0.9">c.</text>

  <text x="500" y="880" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="30" font-weight="500" fill="#ffffff" fill-opacity="0.5" letter-spacing="12">UI DESIGNER</text>
  <text x="500" y="930" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="22" fill="#ffcf7f" fill-opacity="0.6" letter-spacing="8">PORTRAIT PLACEHOLDER</text>
</svg>`

writeFileSync(resolve(OUT, 'avatar.svg'), avatar, 'utf8')
console.log('✓ avatar.svg')

/* ---------- favicon ---------- */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8f72ff"/>
      <stop offset="1" stop-color="#ffcf7f"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="#0b0714"/>
  <circle cx="32" cy="32" r="16" fill="url(#f)"/>
  <circle cx="32" cy="32" r="7" fill="#0b0714"/>
</svg>`

writeFileSync(resolve(__dirname, '../public/favicon.svg'), favicon, 'utf8')
console.log('✓ favicon.svg')

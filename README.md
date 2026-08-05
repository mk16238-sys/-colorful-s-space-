# colorful's space

UI 设计师个人作品集网站 · React 18 + Vite 5 · 零 UI 框架依赖

温暖 / 梦幻 / 克制 / 科技感 —— 紫 · 暖黄 · 白 · 半透明玻璃材质

---

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 本地开发 → http://localhost:5180
npm run build      # 生产构建 → dist/
npm run preview    # 预览构建产物
```

---

## 目录结构

```
colorful-space/
├── index.html
├── vite.config.js
├── scripts/
│   └── gen-placeholders.mjs      # 占位素材生成脚本
├── public/
│   ├── favicon.svg
│   └── media/
│       ├── posters/              # 海报 / 封面 / 头像
│       └── videos/               # 视频素材(需自行放入)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── data/
    │   └── site.js               # ★ 所有文案 / 作品 / 联系方式
    ├── styles/
    │   ├── tokens.css            # ★ 设计变量(色彩 / 圆角 / 动效 / 版心)
    │   └── global.css            # 基础样式与通用组件类
    ├── hooks/
    │   ├── useReveal.js          # 滚动进场
    │   └── useEnv.js             # 媒体查询 / 低性能设备探测
    └── components/
        ├── Intro.jsx             # 开场动画
        ├── Cursor.jsx            # 自定义光标(仅桌面)
        ├── Nav.jsx               # 导航栏 + 移动端菜单
        ├── Hero.jsx              # 首屏全屏视频
        ├── About.jsx             # 角色介绍
        ├── Works.jsx             # 作品案例 + 灯箱
        ├── Playground.jsx        # 互动体验(Color Lab)
        ├── Contact.jsx           # 联系方式
        └── Footer.jsx
```

---

## 替换素材

### 1. 首屏视频

把视频命名为 `hero.mp4`,放进 `public/media/videos/`。

- 视频加载成功 → 自动全屏播放(静音循环)
- 视频不存在 → 自动降级为动态极光渐变背景,观感不受影响
- 移动端 / 低性能设备 → 自动跳过视频加载,直接用渐变层(省流量)

建议:1920×1080 以内,H.264 编码,时长 8–15 秒无缝循环,体积控制在 5MB 内。

### 2. 作品封面 / 海报

替换 `public/media/posters/` 下的文件即可。若换成 `.jpg` / `.png`,记得同步修改 `src/data/site.js` 里的 `cover` 路径。

### 3. 作品视频

放入 `public/media/videos/`,在 `site.js` 中把作品的 `type` 设为 `'video'` 并填写 `video` 路径。点击卡片会弹出灯箱播放。

### 4. 头像

替换 `public/media/posters/avatar.svg`(推荐 4:5 竖版)。

> 重新生成一套占位素材:`node scripts/gen-placeholders.mjs`

---

## 修改内容

所有文案集中在 **`src/data/site.js`**:

| 导出项 | 用途 |
| --- | --- |
| `site` | 站名、身份、城市 |
| `nav` | 导航项 |
| `hero` | 首屏标题、副标题、视频路径 |
| `about` | 自述、数据、能力条、工具 |
| `works` | 作品列表(`type` / `size` / `cover` / `video` / `tags`) |
| `contact` | 电话、邮箱、微信、社交链接 |

**作品卡片尺寸** `size` 取值:

- `wide` — 整行通栏
- `normal` — 半行
- `tall` — 半行加高

排布规律:`wide` 独占一行,`normal` / `tall` 两两成对,这样网格不会留空。

---

## 修改设计风格

改 `src/styles/tokens.css` 里的变量即可全站生效:

```css
--maxw: 1700px;          /* 版心宽度 */
--violet-400: #8f72ff;   /* 主紫 */
--amber-300: #ffcf7f;    /* 暖黄 */
--glass-bg: rgba(255, 255, 255, 0.045);   /* 玻璃底色 */
--glass-blur: 26px;                        /* 玻璃模糊强度 */
```

---

## 性能与适配

- **版心 1700px**,`--gutter` 在不同断点自动收缩(72 / 48 / 22px)
- 断点:1180px / 960px / 860px / 720px / 600px
- 移动端自动降级:不加载首屏视频、不渲染自定义光标、Color Lab 粒子数从 260 降到 90、DPR 上限 1.5
- Color Lab 画布离开视口自动暂停 rAF
- 所有滚动监听走 `requestAnimationFrame` 节流,滚动事件均为 `passive`
- 支持 `prefers-reduced-motion`,系统开启减少动效时全站动画关闭
- 生产构建约 **57KB JS + 10KB CSS**(gzip)

---

## 待补充

- [ ] 首屏视频 `hero.mp4`
- [ ] 真实作品封面与案例视频
- [ ] 个人头像
- [ ] 真实联系方式(当前为占位)
- [ ] 社交平台链接(当前为 `#`)

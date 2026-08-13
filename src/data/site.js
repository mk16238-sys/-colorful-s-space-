/* =========================================================
   站点内容配置
   —— 所有文案 / 作品 / 联系方式集中在这里,替换素材只需改本文件
   ========================================================= */

export const site = {
  name: "colorful's space",
  nameShort: 'colorful',
  role: 'UI Designer',
  location: '中国 · 深圳',
  since: '2019',
}

export const nav = [
  { id: 'about', label: '个人介绍', en: 'About' },
  { id: 'works', label: '作品案例', en: 'Works' },
  { id: 'contact', label: '联系方式', en: 'Contact' },
]

/* ---------- 首屏 Hero ---------- */
export const hero = {
  // 把你的视频放到 publicmedia/videos/hero.mp4 即可自动启用
  // 未提供视频时,自动降级为动态极光渐变背景(不影响观感)
  videoSrc: 'media/videos/hero.mp4',
  poster: 'media/posters/hero-poster.svg',
  eyebrow: 'UI Designer · Digital Craft',
  titleLines: ['Colorful visions', 'practical '],
  titleAccent: 'design',
  subtitle:
    '我是谭君桦，一名全链路视觉设计师。',
  scrollHint: '向下滚动',
}

/* ---------- 角色介绍 ---------- */
export const about = {
  avatar: 'media/avatar.webp',
  eyebrow: 'About Me',
  title: '谭君桦',
  paragraphs: [
    '10 年资深 UI 设计师，深耕政务、社会治理、教育、电商赛道，擅长 B/C/G 端及数据可视化设计，具备项目主导、团队管理能力，擅长以数据驱动体验优化。紧跟 AI 设计浪潮，熟练运用 AI 工具辅助创意构思、方案迭代与物料生产，依托专业设计判断力甄别、优化 AI 输出，提升设计产出效率；兼具品牌设计视野，洞察市场与行业趋势，拥有丰富商业项目落地经验。',
  ],
  signature: '',
  stats: [
    { value: '10+', label: '年设计经验', en: 'Years' },
    { value: '20+', label: '项目落地', en: 'Projects' },
    { value: '1000+', label: '视觉页面', en: 'Pages' },
  ],
  /* 技能：合并为统一标签区 */
  skills: ['Sketch', 'Figma', 'Illustrator', 'Photoshop', 'Cinema 4D', 'After Effects', 'AI 赋能设计'],
  /* 工作经历：默认展示公司 / 时间 / 标签，悬浮显示详情 */
  experience: [
    {
      company: '广东云顺通科技信息有限公司',
      role: 'UI 设计师',
      period: '2024.07 — 至今',
      tags: ['政务系统', '广佛电动自行车平台', '保险平台', '智能查验设备(3D)'],
      duties: [
        '负责公司多产品线全链路 UI 与交互设计，主导广佛电动自行车预约平台小程序、穗安行保险平台、无人机反制可视化监管平台等项目，统一产品视觉语言，保障界面输出与企业品牌形象高度对齐。',
        '参与企业品牌视觉体系搭建，输出品牌设计规范，建立统一视觉标准，强化企业品牌识别度，支撑多业务产品品牌一致性落地。',
        '基于用户需求与业务调研输出 UI 方案，定义界面风格与配色；完成电动自行车智能查验设备三维模型设计，兼顾软件界面与硬件视觉表达，优化用户体验。',
        '联动产品、研发、硬件团队推进设计落地，把控 UI 交付质量，对齐项目排期，兼顾软件系统、小程序、硬件三维可视化项目，保障各业务项目高效迭代上线。',
      ],
    },
    {
      company: '广东宏乾科技股份有限公司',
      role: 'UI 设计师',
      period: '2023.06 — 2024.07',
      tags: ['中小学生健康心理平台', '学校监管可视化平台'],
      duties: [
        '承担中小学心理健康平台「心健通」移动端 & PC 端 UI/UX 全流程设计，输出产品设计规范，基于业务数据与用户反馈持续迭代优化产品体验。',
        '负责教育管理智慧大脑视觉设计，搭建可复用组件库，完成多场景数据可视化大屏、后台管理系统视觉输出。',
        '配合业务线完成项目管理后台、企业官网、营销 Banner 及宣传物料设计，支撑业务营销与品牌传播需求。',
      ],
    },
    {
      company: '广东哈希科技有限公司',
      role: 'UI 设计师',
      period: '2020.11 — 2023.04',
      tags: ['区块链', '政务系统'],
      duties: [
        '主导社会治理政务平台 UI/UX 设计与组件库搭建，依托产品数据反馈驱动界面迭代，提升政务系统使用效率。',
        '完成移动端、PC 管理端、物联系统、智慧社区多项目视觉定义，输出统一设计语言，搭建业务组件库，提升团队设计复用效率。',
        '承接多场景数据可视化大屏、后台管理系统、官网、营销 Banner 及宣发物料设计，支撑政务类项目落地交付。',
      ],
    },
    {
      company: '佛山同桌教育科技有限公司',
      role: '首席设计师',
      period: '2017.05 — 2020.10',
      tags: ['电商设计', '英语教育平台'],
      duties: [
        '主导雅思英语教育平台移动端与 PC 端 UI 设计，参与产品版本迭代，从视觉层优化界面交互，提升产品用户体验；',
        '负责平台品牌视觉体系输出，承接品牌宣传、运营活动、电商专题等平面设计，兼顾教育产品品牌调性与业务转化；',
        '搭建 UI 界面落地标准，输出完整设计规范与组件库，实现多端视觉一致性，提升团队协作效率；',
        '对接产品、研发跟进设计落地，跟随业务迭代持续优化界面，支撑课程售卖、学习备考等核心业务场景。',
      ],
    },
    {
      company: '佛山市菩提树网络科技有限公司',
      role: 'UI 设计师',
      period: '2016.03 — 2017.04',
      tags: ['C端设计'],
      duties: [
        '根据产品需求完成界面方案输出，负责交互页面、图标、控件等视觉元素设计输出。',
        '优化页面交互逻辑，简化操作路径，提升产品易用性与用户操作体验。',
        '对接研发团队，同步设计细节，推动交互与界面方案落地实现。',
      ],
    },
  ],
}

/* ---------- 作品 / 案例 ----------
   type: 'video' → 卡片显示播放按钮,点击弹出视频灯箱
   type: 'poster' → 图片作品,点击弹出大图
   cover 支持 图片 / SVG;video 字段填 mp4 路径
------------------------------------ */
export const works = [
  {
    id: 'w7',
    type: 'preview',
    title: 'G端监管平台',
    subtitle: '无人机监管与服务平台',
    year: '2026',
    tags: ['G端', 'Data Viz'],
    cover: 'media/posters/work-uav.webp',
    href: 'preview-login-dashboard.html',
    desc: '本低空空域无人机监管与服务平台，实现地图可视化无人机目标监测、告警处置、设备与飞行管理，对低空目标进行分类识别，支撑城市低空安全管控。',
    size: 'wide',
  },
  {
    id: 'w1',
    type: 'video',
    title: 'Aurora Design System',
    subtitle: '面向多端的企业级设计系统',
    year: '2025',
    tags: ['Design System', 'Motion'],
    cover: 'media/posters/work-01.svg',
    video: 'media/videos/work-01.mp4',
    desc: '为金融科技平台搭建的一套跨 Web / iOS / Android 的设计系统,包含 240+ 组件、完整的色彩语义层与动效规范,交付后设计交付效率提升 40%。',
    size: 'wide',
  },
  {
    id: 'w2',
    type: 'poster',
    title: 'Bloom 品牌视觉',
    subtitle: '香氛品牌全案视觉',
    year: '2025',
    tags: ['Branding', 'Poster'],
    cover: 'media/posters/work-02.svg',
    desc: '以"花开的三秒"为概念,用渐层与颗粒质感构建品牌的嗅觉联想,延展至包装、电商与线下物料。',
    size: 'tall',
  },
  {
    id: 'w3',
    type: 'poster',
    title: 'Lumen App',
    subtitle: '冥想与睡眠陪伴应用',
    year: '2024',
    tags: ['Mobile', 'UI'],
    cover: 'media/posters/work-03.svg',
    desc: '深夜场景下的低亮度界面设计,用暖黄光晕替代刺眼白光,配合呼吸节奏动效引导用户入睡。',
    size: 'normal',
  },
  {
    id: 'w4',
    type: 'video',
    title: 'Motion Study 001',
    subtitle: '界面微交互研究',
    year: '2024',
    tags: ['Motion', 'Interaction'],
    cover: 'media/posters/work-04.svg',
    video: 'media/videos/work-04.mp4',
    desc: '关于"反馈延迟"的一组动效实验:在 120ms 到 400ms 之间,用户对界面响应的感知如何变化。',
    size: 'normal',
  },
  {
    id: 'w5',
    type: 'poster',
    title: 'Prism 数据可视化',
    subtitle: '增长分析看板',
    year: '2024',
    tags: ['Data Viz', 'Web'],
    cover: 'media/posters/work-05.svg',
    desc: '为数据密度极高的看板设计的一套色彩体系,在保证 WCAG AA 对比度的前提下,让 16 类数据依然可辨。',
    size: 'normal',
  },
  {
    id: 'w6',
    type: 'poster',
    title: 'Warmth 海报系列',
    subtitle: '自主创作 · 光与温度',
    year: '2023',
    tags: ['Poster', 'Experiment'],
    cover: 'media/posters/work-06.svg',
    desc: '一组关于"温度"的视觉实验,用紫与暖黄的碰撞记录一天中不同时刻的光。',
    size: 'wide',
  },
]

export const workFilters = [
  { key: 'all', label: '全部', en: 'All' },
  { key: 'video', label: '视频', en: 'Video' },
  { key: 'poster', label: '海报 / 界面', en: 'Poster' },
]

/* ---------- 联系方式 ---------- */
export const contact = {
  eyebrow: 'Get in touch',
  title: '有想法，我们聊聊。',
  desc: '',
  phone: '135 2897 6314',
  phoneRaw: '13528976314',
  email: '469117097@qq.com',
  wechat: 'owowah',
  socials: [],
  availability: '期待我们的见面',
}

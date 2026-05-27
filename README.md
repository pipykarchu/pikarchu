# 皮玺玉 × AI 貔貅 · 个人 IP 站点

> 养一只 AI 貔貅，替我囤住生活里的工作流。
> ——产品经理 × AI 实践者，把每个痛点都做成可复用的工具。

## 项目简介

这是皮玺玉的个人 IP 展示与商业服务站点。所有作品、服务、联系方式都通过 `content/` 数据驱动 —— 改 JSON 就改网页内容，无需动代码。

**核心叙事：** 「皮玺玉 × AI 貔貅」副本 —— 萌貔貅替主人囤工作流，跨领域作品由此统一。

## 技术栈

- Vue 3 + `<script setup>` + Composition API
- Vite 7
- Tailwind CSS 4（`@theme` token + 浅/暗双主题）
- 纯 JavaScript（无 TypeScript）
- 数据驱动：`content/*.json`
- 无路由（单页滚动 + 锚点）
- 无全局状态管理（composable + props/events）

## 启动方式

### Windows

双击 `start.bat`，自动检查依赖、端口冲突，自动打开浏览器。

### 任意系统手动启动

```bash
npm install
npm run dev    # 开发模式，访问 http://localhost:5173/
npm run build  # 生产构建
npm run preview # 预览构建产物
```

## 目录结构

```
个人IP/
├── 需求草案.md                 # 单一事实来源（IP内核/IA/规范）
├── README.md
├── start.bat                  # Windows 一键启动
├── package.json
├── vite.config.js
├── index.html
├── public/
│   ├── mascot/
│   │   ├── pixiu-hero.png     # 主形象（Hero 区）
│   │   └── pixiu-secondary.png # 次形象（Footer / 其他）
│   └── qrcodes/               # 微信/小红书二维码（请你自行放入）
├── content/                   # ⭐ 数据驱动层
│   ├── profile.json           # 个人信息、slogan、联系方式
│   ├── categories.json        # 分区配置
│   ├── projects.json          # 所有项目卡片
│   └── services.json          # 服务区配置
└── src/
    ├── App.vue
    ├── main.js
    ├── style.css              # Tailwind + design token + 动画
    ├── composables/
    │   ├── useTheme.js        # 主题切换 + 系统偏好检测
    │   └── useContent.js      # 内容数据加载
    └── components/
        ├── AppHeader.vue
        ├── HeroSection.vue
        ├── CategorySection.vue
        ├── ProjectCard.vue
        ├── StatusBadge.vue
        ├── ServicesSection.vue
        ├── ContactModal.vue
        ├── ThemeToggle.vue
        └── AppFooter.vue
```

## 数据驱动 · 怎么改内容？

### 加一个新项目

直接编辑 `content/projects.json` 加一条：

```json
{
  "id": "my-new-project",
  "title": "新项目名",
  "category": "general",
  "status": "wip",
  "shortDesc": "一句话说明",
  "tags": ["标签1", "标签2"],
  "links": {},
  "priority": 5
}
```

`status` 取值：`live` / `wip` / `idea` / `paid`，分别显示绿/紫/灰/粉徽章。

### 改 slogan / 联系方式

编辑 `content/profile.json`。

### 加分区或改分区配色

编辑 `content/categories.json`。

### 改服务区文案

编辑 `content/services.json`。

## 主题色与设计 token

颜色 token 在 `src/style.css` 顶部 `@theme {}` 内。浅色为默认，深色由 `[data-theme="dark"]` 覆盖。沿用全局 Linear + 紫粉渐变规范（紫 `#A78BFA` → 粉 `#F472B6`）。

## 部署说明

`npm run build` 产出 `dist/` 静态目录，可直接部署到 Vercel / Netlify / GitHub Pages / Cloudflare Pages。

推荐 Vercel：
1. push 到 GitHub repo
2. Vercel 导入 repo
3. Build Command: `npm run build`，Output: `dist`
4. 完成

## 版本控制策略

- 修复 bug / 微调样式：`+0.0.1`
- 新增功能：`+0.1.0`
- 架构重构：`+1.0.0`

每次升版同步更新 `package.json` 的 `version` 和 `index.html` 中 `?v=x.x.x` 查询参数（cache busting）。

## 路线图

- [x] Phase 1 · 框架搭建：Hero / Category / Card / Services / Contact 组件，数据驱动
- [ ] Phase 2 · 内容填充：补全采购预警 / 求职作战的截图与详情
- [ ] Phase 3 · 商业化：联系表单接入 / 简历 PDF 下载
- [ ] Phase 4 · 增强：SEO、移动端打磨、数据埋点

## 待补充的资产

请你后续放到对应目录：

- `public/mascot/`：可扩展 `pixiu-loading.png` / `pixiu-empty.png` / `pixiu-404.png`
- `public/qrcodes/`：`wechat.png` 微信二维码、`xhs.png` 小红书二维码
- `content/projects.json`：已上线项目的 `links.demo`（点击卡片即跳转）

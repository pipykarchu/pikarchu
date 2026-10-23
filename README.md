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

所有作品统一维护在 `content/projects.json`。在数组中新增一条，`id` 保持唯一，`category` 使用 `content/categories.json` 中已有的领域 ID（`work` / `learning` / `content` / `life`）。以下是工作项目阶段成果的填写模板；标题、职责、范围等占位文案须按实际情况替换后再发布：

```json
{
  "id": "my-new-project",
  "title": "新项目名",
  "category": "work",
  "workType": "project",
  "sourceLabel": "工作项目",
  "status": "case",
  "role": "填写本人实际参与的部分",
  "scope": "填写可展示范围、当前阶段及尚未验证的上线或效果边界",
  "shortDesc": "一句话说明",
  "tags": ["标签1", "标签2"],
  "links": {},
  "priority": 5
}
```

`status` 与 `src/components/StatusBadge.vue` 的六种取值保持一致：

| 取值 | 徽章文案 / 颜色 | 使用含义 |
| --- | --- | --- |
| `live` | Live / 绿 | 可体验的作品；静态演示可体验不代表完整应用或后端已生产上线，需说明演示边界。 |
| `wip` | WIP / 紫 | 进行中，尚在开发或验证。 |
| `idea` | Idea / 灰 | 构思或方向储备。 |
| `paid` | Paid / 粉 | 目录中显示“可合作”，不能仅凭该状态声称已有付费客户或收入。 |
| `case` | 阶段成果 / 天蓝 | 可展示的阶段工作、方案或原型，不作为生产上线证明。 |
| `documented` | 已沉淀 / 琥珀 | 已整理的方法、SOP 或模板，不作为生产上线证明。 |

目录预览对前四种状态分别显示“可体验 / 进行中 / 构思中 / 可合作”；详情徽章使用上表文案。状态描述成熟度或展示方式，来源与本人贡献需通过以下字段单独说明：

| 字段 | 用途与填写规则 |
| --- | --- |
| `workType` | 工作领域（`category: "work"`）的筛选类型：`project`（项目）、`tool`（工具）、`method`（技能与模板）。代码在缺省时按 `project` 筛选；新增工作条目建议显式填写，其他领域无需为工作筛选补此字段。 |
| `sourceLabel` | 目录中的来源文案，现有值包括“工作项目”“工作沉淀”“个人作品”“个人沉淀”。它是展示文本，不是代码限定枚举；不能用 `category: "work"` 或 `workType` 推断作品属于任职工作。缺省时目录会回退到类型或状态文案。 |
| `role` | 可选，详情页“我的参与”；仅填写本人实际参与的职责，不把协作描述成独立负责。 |
| `period` | 可选，详情页“阶段”；填写真实的参与时间或阶段。 |
| `scope` | 可选，详情页的展示范围与验证边界说明；工作项目及易被误解为完整上线的演示建议填写。 |

有可体验入口时再填写 `links.demo`，用 `links.demoNote` 说明静态演示、只读数据或后端依赖等限制。`actions` 可提供多个入口，`archive` 可提供公开摘要或方法说明；目录预览优先使用 `archive`，否则取首个有效 `actions`，最后回退到 `links.demo`。归档通过条目入口访问，无需另建首页分区。`hidden: true` 的条目不显示在目录中。

新增条目前核对来源、职责、阶段和可访问材料，不因有演示或归档就将 `case` / `documented` 改为生产上线叙述。目录归属和展示交互详见 [作品目录说明](docs/portfolio-catalog-20261022.md)。

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

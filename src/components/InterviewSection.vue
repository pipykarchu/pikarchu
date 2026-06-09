<script setup>
import { useTracker } from '../composables/useTracker'

defineEmits(['open-contact'])

const { track } = useTracker()

const demoSteps = [
  {
    title: '1. 先讲定位',
    desc: '用首屏说明：这不是静态简历页，而是 AI 工作流作品集门户。'
  },
  {
    title: '2. 主讲两个项目',
    desc: '优先讲求职作战中心和采购预警看板，再用 Skills 证明方法可复用。'
  },
  {
    title: '3. 跑一条闭环',
    desc: '首页 → 作品详情 → Demo → 智能客服 → 留言 → 后台复盘。'
  },
  {
    title: '4. 讲清边界',
    desc: '当前版本用于面试演示和能力证明，小程序商业化后续独立立项。'
  }
]

const materials = [
  'PRD：范围、目标用户、MVP 和上线风险',
  'SOP：内容维护、演示准备和上线检查',
  '进度看板：当前完成度、阻塞项和下一步',
  '兜底话术：AI 不可用、Demo 不可用、数据未公开时的解释'
]

const handleMaterialClick = (label) => {
  track('interview_material_click', label)
}
</script>

<template>
  <section id="interview" class="py-12 px-4 sm:px-6 md:py-18">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 md:mb-10 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] mb-3" :style="{ color: 'var(--color-linear-text-tertiary)' }">
          Interview Pack
        </p>
        <h2 class="text-3xl md:text-4xl font-bold mb-3" :style="{ color: 'var(--color-linear-text)' }">
          面试演示包
        </h2>
        <p class="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" :style="{ color: 'var(--color-linear-text-secondary)' }">
          按 PRD 里的演示路径，把个人定位、代表项目、AI 能力、工程实现和后续规划压缩成一条可讲清楚的链路。
        </p>
      </div>

      <div class="grid lg:grid-cols-[1.25fr_0.75fr] gap-4 md:gap-5">
        <div
          class="rounded-lg p-5 sm:p-6"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        >
          <div class="flex items-center justify-between gap-3 mb-5">
            <h3 class="text-lg font-semibold" :style="{ color: 'var(--color-linear-text)' }">
              10 分钟讲解路径
            </h3>
            <span class="text-xs px-2.5 py-1 rounded-full" :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-tertiary)' }">
              面试友好
            </span>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div
              v-for="step in demoSteps"
              :key="step.title"
              class="rounded-lg p-4"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <h4 class="text-sm font-semibold mb-2" :style="{ color: 'var(--color-linear-text)' }">
                {{ step.title }}
              </h4>
              <p class="text-sm leading-relaxed" :style="{ color: 'var(--color-linear-text-secondary)' }">
                {{ step.desc }}
              </p>
            </div>
          </div>
        </div>

        <aside
          class="rounded-lg p-5 sm:p-6"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        >
          <h3 class="text-lg font-semibold mb-4" :style="{ color: 'var(--color-linear-text)' }">
            配套材料
          </h3>
          <ul class="space-y-3 mb-5">
            <li
              v-for="item in materials"
              :key="item"
              class="flex gap-2 text-sm leading-relaxed"
              :style="{ color: 'var(--color-linear-text-secondary)' }"
            >
              <span class="mt-2 h-1.5 w-1.5 rounded-full shrink-0" style="background: #A78BFA;"></span>
              <span>{{ item }}</span>
            </li>
          </ul>

          <div class="grid gap-2">
            <a
              href="/docs/personal-ip-site-prd.md"
              target="_blank"
              rel="noreferrer"
              class="px-4 py-3 rounded-lg text-sm font-medium text-center transition-transform hover:-translate-y-0.5"
              :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text)', border: '1px solid var(--color-linear-border)' }"
              @click="handleMaterialClick('prd_doc')"
            >
              打开 PRD 文档
            </a>
            <button
              type="button"
              class="px-4 py-3 rounded-lg text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%);"
              @click="$emit('open-contact')"
            >
              演示后联系我
            </button>
          </div>

          <p class="mt-4 text-xs leading-relaxed" :style="{ color: 'var(--color-linear-text-tertiary)' }">
            PRD 原文在项目目录内维护；线上部署时可改为 GitHub 或静态 HTML 链接。
          </p>
        </aside>
      </div>
    </div>
  </section>
</template>

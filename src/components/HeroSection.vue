<script setup>
import { computed } from 'vue'
import { useContent } from '../composables/useContent'
import { withVersion } from '../composables/useAssetPath'

const props = defineProps({
  mode: { type: String, default: 'business' },
  modeLabel: { type: String, default: '商业版' }
})
defineEmits(['open-contact', 'scroll-to-projects', 'scroll-to-services', 'set-mode'])

const { profile } = useContent()

const handleScroll = (emit) => {
  if (props.mode === 'business') emit('scroll-to-services')
  else emit('scroll-to-projects')
}

const heroCopy = computed(() => {
  if (props.mode === 'demo') {
    return {
      badge: '作品集入口',
      title: '皮玺玉 · AI 产品与工作流作品集',
      slogan: '项目、方法、Demo 路径一次讲清',
      intro: '这里按工作、学习、内容创作、生活四个模块整理项目，保留可打开的 Demo、PRD 和工作流文档。',
      primary: '查看作品',
      secondary: '',
      metrics: [
        { value: '10', label: '项目总数' },
        { value: '4', label: 'Skill' },
        { value: '3', label: '工作流' }
      ]
    }
  }

  return {
    badge: '商业接单入口',
    title: 'AI 工具、PRD 和求职材料，帮你快速做成可交付成果',
    slogan: '居家远程可交付 · 小单快做 · 明码标价',
    intro: '面向个人、小团队和求职者，提供 AI 工作流定制、HTML/Excel 小工具、PRD 方案、简历与面试项目包装。先用低成本小单验证需求，再扩展成完整工具。',
    primary: '查看套餐价格',
    secondary: '切到演示版',
    metrics: [
      { value: '99+', label: '小单起价' },
      { value: '24h', label: '快单反馈' },
      { value: '远程', label: '在线交付' }
    ]
  }
})

const handleSecondary = (emit) => {
  if (props.mode === 'demo') emit('set-mode', 'business')
  else emit('set-mode', 'demo')
}
</script>

<template>
  <section class="hero-shell relative overflow-hidden px-4 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-16">
    <div class="hero-backdrop absolute inset-0 pointer-events-none"></div>
    <div class="hero-fade absolute inset-x-0 bottom-0 pointer-events-none"></div>

    <div class="relative max-w-6xl mx-auto grid md:grid-cols-[1.05fr_0.95fr] gap-8 md:gap-12 items-center">
      <div class="fade-in-up">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4 md:mb-5"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text-secondary)' }"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {{ heroCopy.badge }} · {{ modeLabel }}
        </div>

        <h1
          class="max-w-2xl text-3xl sm:text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-4 md:mb-5"
          :style="{ color: 'var(--color-linear-text)' }"
        >
          {{ heroCopy.title }}
        </h1>

        <p
          class="text-lg sm:text-xl md:text-2xl font-semibold leading-snug mb-3 md:mb-4"
          style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%); -webkit-background-clip: text; background-clip: text; color: transparent;"
        >
          {{ heroCopy.slogan }}
        </p>

        <p class="max-w-xl text-sm sm:text-base md:text-lg leading-relaxed mb-5 md:mb-6" :style="{ color: 'var(--color-linear-text-secondary)' }">
          {{ heroCopy.intro }}
        </p>

        <div class="grid grid-cols-3 gap-2 sm:max-w-md mb-6 md:mb-8">
          <div v-for="metric in heroCopy.metrics" :key="metric.label" class="metric-tile">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <button
            @click="handleScroll($emit)"
            class="px-6 py-3 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%); box-shadow: 0 8px 24px rgba(167,139,250,0.35);"
          >
            {{ heroCopy.primary }} →
          </button>
          <button
            v-if="heroCopy.secondary"
            @click="handleSecondary($emit)"
            class="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
          >
            {{ heroCopy.secondary }}
          </button>
          <button
            v-if="mode === 'business'"
            @click="$emit('open-contact')"
            class="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
            :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
          >
            直接咨询
          </button>
        </div>
      </div>

      <div class="relative flex items-center justify-center -mt-1 md:mt-0">
        <div
          class="absolute inset-x-8 bottom-2 h-12 md:h-16 rounded-[50%] pointer-events-none"
          style="background: rgba(167,139,250,0.18); filter: blur(18px);"
        ></div>
        <img
          :src="withVersion('/mascot/pixiu-hero.png')"
          alt="皮玺玉的 AI 貔貅"
          class="relative w-56 sm:w-64 md:w-80 lg:w-[22rem] float-anim drop-shadow-2xl select-none"
          draggable="false"
        />
      </div>
    </div>
  </section>
</template>

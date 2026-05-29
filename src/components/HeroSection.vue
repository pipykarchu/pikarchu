<script setup>
import { useContent } from '../composables/useContent'

defineEmits(['open-contact', 'scroll-to-projects'])

const { profile } = useContent()

const handleScroll = (emit) => {
  emit('scroll-to-projects')
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
          AI 貔貅营业中
        </div>

        <h1
          class="max-w-2xl text-3xl sm:text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-4 md:mb-5"
          :style="{ color: 'var(--color-linear-text)' }"
        >
          {{ profile.greeting }}
        </h1>

        <p
          class="text-lg sm:text-xl md:text-2xl font-semibold leading-snug mb-3 md:mb-4"
          style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%); -webkit-background-clip: text; background-clip: text; color: transparent;"
        >
          {{ profile.slogan }}
        </p>

        <p class="max-w-xl text-sm sm:text-base md:text-lg leading-relaxed mb-5 md:mb-6" :style="{ color: 'var(--color-linear-text-secondary)' }">
          {{ profile.intro }}
        </p>

        <div class="grid grid-cols-3 gap-2 sm:max-w-md mb-6 md:mb-8">
          <div class="metric-tile">
            <strong>10+</strong>
            <span>作品沉淀</span>
          </div>
          <div class="metric-tile">
            <strong>3</strong>
            <span>合作入口</span>
          </div>
          <div class="metric-tile">
            <strong>AI</strong>
            <span>工作流</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <button
            @click="handleScroll($emit)"
            class="px-6 py-3 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%); box-shadow: 0 8px 24px rgba(167,139,250,0.35);"
          >
            看看貔貅囤了啥 →
          </button>
          <button
            @click="$emit('open-contact')"
            class="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
          >
            约我聊聊
          </button>
        </div>
      </div>

      <div class="relative flex items-center justify-center -mt-1 md:mt-0">
        <div
          class="absolute inset-x-8 bottom-2 h-12 md:h-16 rounded-[50%] pointer-events-none"
          style="background: rgba(167,139,250,0.18); filter: blur(18px);"
        ></div>
        <img
          src="/mascot/pixiu-hero.png?v=0.1.0"
          alt="皮玺玉的 AI 貔貅"
          class="relative w-56 sm:w-64 md:w-80 lg:w-[22rem] float-anim drop-shadow-2xl select-none"
          draggable="false"
        />
      </div>
    </div>
  </section>
</template>

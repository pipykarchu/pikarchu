<script setup>
import { useContent } from '../composables/useContent'

defineEmits(['open-contact', 'scroll-to-projects'])

const { profile } = useContent()

const handleScroll = (emit) => {
  emit('scroll-to-projects')
}
</script>

<template>
  <section class="relative overflow-hidden pt-20 pb-32 px-6">
    <div
      class="absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full pointer-events-none glow-pulse"
      style="background: radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(167,139,250,0) 70%); filter: blur(60px);"
    ></div>
    <div
      class="absolute top-20 right-0 w-[420px] h-[420px] rounded-full pointer-events-none glow-pulse"
      style="background: radial-gradient(circle, rgba(244,114,182,0.30) 0%, rgba(244,114,182,0) 70%); filter: blur(60px); animation-delay: -1.5s;"
    ></div>

    <div class="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
      <div class="fade-in-up">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text-secondary)' }"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          AI 貔貅营业中
        </div>

        <h1
          class="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
          :style="{ color: 'var(--color-linear-text)' }"
        >
          {{ profile.greeting }}
        </h1>

        <p
          class="text-2xl md:text-3xl font-semibold leading-snug mb-4"
          style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%); -webkit-background-clip: text; background-clip: text; color: transparent;"
        >
          {{ profile.slogan }}
        </p>

        <p class="text-base md:text-lg leading-relaxed mb-8 max-w-md" :style="{ color: 'var(--color-linear-text-secondary)' }">
          {{ profile.intro }}
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <button
            @click="handleScroll($emit)"
            class="px-6 py-3 rounded-full text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%); box-shadow: 0 8px 24px rgba(167,139,250,0.35);"
          >
            看看貔貅囤了啥 →
          </button>
          <button
            @click="$emit('open-contact')"
            class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
          >
            约我聊聊
          </button>
        </div>
      </div>

      <div class="relative flex items-center justify-center">
        <div
          class="absolute w-80 h-80 rounded-full pointer-events-none"
          style="background: radial-gradient(circle, rgba(244,114,182,0.4) 0%, rgba(167,139,250,0.2) 50%, transparent 75%); filter: blur(40px);"
        ></div>
        <img
          src="/mascot/pixiu-hero.png?v=0.1.0"
          alt="皮玺玉的 AI 貔貅"
          class="relative w-72 md:w-80 lg:w-96 float-anim drop-shadow-2xl select-none"
          draggable="false"
        />
      </div>
    </div>
  </section>
</template>

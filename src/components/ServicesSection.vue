<script setup>
import { computed } from 'vue'
import { useContent } from '../composables/useContent'

const { services } = useContent()
defineEmits(['open-contact', 'scroll-to-projects'])

const serviceGridClass = computed(() => {
  if (services.value.length === 1) return 'md:grid-cols-1'
  if (services.value.length === 2) return 'md:grid-cols-2'
  return 'md:grid-cols-3'
})

const typeStyle = {
  free: { gradient: 'linear-gradient(135deg, #34D399 0%, #60A5FA 100%)', icon: '🎁' },
  paid: { gradient: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)', icon: '✨' },
  private: { gradient: 'linear-gradient(135deg, #FB923C 0%, #F472B6 100%)', icon: '💬' }
}

const handleClick = (action, emit) => {
  if (action === 'open-contact') emit('open-contact')
  else if (action === 'scroll-to-projects') emit('scroll-to-projects')
}
</script>

<template>
  <section id="services" class="py-12 px-4 sm:px-6 md:py-18 relative">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 md:mb-11 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-3" :style="{ color: 'var(--color-linear-text)' }">
          找貔貅帮忙
        </h2>
        <p class="text-sm sm:text-base" :style="{ color: 'var(--color-linear-text-secondary)' }">
          挑顺手的入口 · 都欢迎
        </p>
      </div>

      <div class="grid gap-4 md:gap-5" :class="serviceGridClass">
        <div
          v-for="s in services"
          :key="s.id"
          class="p-5 sm:p-6 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        >
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-4"
            :style="{ background: typeStyle[s.type].gradient }"
          >
            {{ typeStyle[s.type].icon }}
          </div>

          <h4 class="text-lg font-semibold mb-1" :style="{ color: 'var(--color-linear-text)' }">
            {{ s.title }}
          </h4>
          <p class="text-xs mb-3" :style="{ color: 'var(--color-linear-text-tertiary)' }">
            {{ s.subtitle }}
          </p>
          <p class="text-sm leading-relaxed mb-5 flex-1" :style="{ color: 'var(--color-linear-text-secondary)' }">
            {{ s.desc }}
          </p>

          <button
            @click="handleClick(s.ctaAction, $emit)"
            class="w-full py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
            :style="{ background: typeStyle[s.type].gradient, color: 'white' }"
          >
            {{ s.ctaText }} →
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

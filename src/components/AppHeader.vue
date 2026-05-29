<script setup>
import ThemeToggle from './ThemeToggle.vue'

defineEmits(['open-contact'])
</script>

<template>
  <header
    class="sticky top-0 z-40 backdrop-blur-md transition-colors duration-300"
    :style="{ background: 'color-mix(in srgb, var(--color-linear-bg) 85%, transparent)', borderBottom: '1px solid var(--color-linear-border)' }"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 md:py-3 flex items-center justify-between gap-3">
      <a href="#top" class="flex items-center gap-2 group min-w-0">
        <img
          src="/mascot/pixiu-hero.png?v=0.1.0"
          alt="皮玺玉"
          class="w-8 h-8 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
        />
        <span class="text-sm sm:text-base font-semibold tracking-tight truncate" :style="{ color: 'var(--color-linear-text)' }">
          皮玺玉<span class="opacity-50">.AI</span>
        </span>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm" :style="{ color: 'var(--color-linear-text-secondary)' }">
        <a href="#projects" class="hover:opacity-100 opacity-70 transition-opacity">作品</a>
        <a href="#services" class="hover:opacity-100 opacity-70 transition-opacity">合作</a>
        <a href="#about" class="hover:opacity-100 opacity-70 transition-opacity">关于</a>
      </nav>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <a
          href="/admin"
          class="hidden sm:inline-flex px-3 py-2 md:py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
        >
          后台
        </a>
        <ThemeToggle />
        <button
          @click="$emit('open-contact')"
          class="px-3 py-2 md:py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 text-white whitespace-nowrap"
          style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%);"
        >
          + 加我
        </button>
      </div>
    </div>
  </header>
</template>

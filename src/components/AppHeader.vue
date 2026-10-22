<script setup>
import ThemeToggle from './ThemeToggle.vue'
import { withBase, withVersion } from '../composables/useAssetPath'

defineProps({
  mode: { type: String, default: 'business' }
})
defineEmits(['open-contact', 'set-mode'])
</script>

<template>
  <header
    class="sticky top-0 z-40 backdrop-blur-md transition-colors duration-300"
    :style="{ background: 'color-mix(in srgb, var(--color-linear-bg) 85%, transparent)', borderBottom: '1px solid var(--color-linear-border)' }"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 md:py-3 flex items-center justify-between gap-3">
      <a href="#top" class="flex items-center gap-2 group min-w-0">
        <img
          :src="withVersion('/mascot/pixiu-hero.png')"
          alt="皮玺玉"
          class="w-8 h-8 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
        />
        <span class="text-sm sm:text-base font-semibold tracking-tight truncate" :style="{ color: 'var(--color-linear-text)' }">
          皮玺玉<span class="opacity-50">.AI</span>
        </span>
      </a>

      <nav class="hidden md:flex items-center gap-5 text-sm whitespace-nowrap" :style="{ color: 'var(--color-linear-text-secondary)' }">
        <a href="#projects" class="hover:opacity-100 opacity-70 transition-opacity">作品</a>
        <a href="#services" class="hover:opacity-100 opacity-70 transition-opacity">合作</a>
        <a href="#about" class="hover:opacity-100 opacity-70 transition-opacity">关于</a>
        <a :href="withBase('/?admin=1')" class="hover:opacity-100 opacity-70 transition-opacity">后台</a>
      </nav>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <div
          class="hidden sm:flex items-center rounded-lg p-1"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
          aria-label="切换网站版本"
        >
          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap"
            :class="mode === 'business' ? 'text-white' : ''"
            :style="mode === 'business'
              ? { background: 'var(--color-linear-text)', color: 'var(--color-linear-bg)' }
              : { color: 'var(--color-linear-text-secondary)' }"
            @click="$emit('set-mode', 'business')"
          >
            合作服务
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap"
            :class="mode === 'demo' ? 'text-white' : ''"
            :style="mode === 'demo'
              ? { background: 'var(--color-linear-text)', color: 'var(--color-linear-bg)' }
              : { color: 'var(--color-linear-text-secondary)' }"
            @click="$emit('set-mode', 'demo')"
          >
            作品集
          </button>
        </div>
        <ThemeToggle />
        <button
          @click="$emit('open-contact')"
          class="px-3 py-2 md:py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 text-white whitespace-nowrap"
          style="background: var(--color-linear-text); color: var(--color-linear-bg);"
        >
          + 加我
        </button>
      </div>
    </div>
  </header>
</template>

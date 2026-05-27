<script setup>
import { useContent } from '../composables/useContent'

const { profile } = useContent()
const year = new Date().getFullYear()
</script>

<template>
  <footer
    id="about"
    class="py-12 px-6 border-t"
    :style="{ borderColor: 'var(--color-linear-border)' }"
  >
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <img src="/mascot/pixiu-secondary.png?v=0.1.0" alt="" class="w-10 h-10" />
        <div class="text-sm" :style="{ color: 'var(--color-linear-text-secondary)' }">
          皮玺玉 × AI 貔貅 · v0.1.0
        </div>
      </div>

      <div class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">
        © {{ year }} 皮玺玉 · 用 AI 给生活打补丁
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useTheme } from '../composables/useTheme'

const { theme, toggle } = useTheme()

const handleToggle = () => toggle()
</script>

<template>
  <button
    @click="handleToggle"
    class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
    :style="{
      background: 'var(--color-linear-bg-secondary)',
      border: '1px solid var(--color-linear-border)'
    }"
    :title="theme === 'light' ? '切到暗色' : '切到亮色'"
  >
    <span v-if="theme === 'light'" class="text-base">🌙</span>
    <span v-else class="text-base">☀️</span>
  </button>
</template>

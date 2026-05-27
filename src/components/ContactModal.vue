<script setup>
import { useContent } from '../composables/useContent'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])

const { profile } = useContent()

const handleClose = (emit) => emit('update:modelValue', false)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5);"
        @click.self="$emit('update:modelValue', false)"
      >
        <div
          class="w-full max-w-md rounded-3xl p-6 shadow-2xl"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        >
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-semibold" :style="{ color: 'var(--color-linear-text)' }">
              约我聊聊
            </h3>
            <button
              @click="$emit('update:modelValue', false)"
              class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              :style="{ color: 'var(--color-linear-text-secondary)' }"
            >
              ✕
            </button>
          </div>

          <p class="text-sm mb-5 leading-relaxed" :style="{ color: 'var(--color-linear-text-secondary)' }">
            🐉 貔貅闻到 buff 了。下面三个入口，挑顺手的来。
          </p>

          <div class="space-y-3">
            <div
              class="flex items-center gap-3 p-3 rounded-2xl"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: linear-gradient(135deg, #07C160 0%, #0AC176 100%);">💬</div>
              <div class="flex-1">
                <div class="text-sm font-medium" :style="{ color: 'var(--color-linear-text)' }">微信</div>
                <div class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">添加好友（二维码占位）</div>
              </div>
            </div>

            <div
              class="flex items-center gap-3 p-3 rounded-2xl"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: linear-gradient(135deg, #FE2C55 0%, #FF4081 100%);">📕</div>
              <div class="flex-1">
                <div class="text-sm font-medium" :style="{ color: 'var(--color-linear-text)' }">小红书</div>
                <div class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">最新作品都在这</div>
              </div>
            </div>

            <a
              :href="'mailto:' + profile.contact.email"
              class="flex items-center gap-3 p-3 rounded-2xl transition-transform hover:scale-[1.02]"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%);">✉️</div>
              <div class="flex-1">
                <div class="text-sm font-medium" :style="{ color: 'var(--color-linear-text)' }">邮箱</div>
                <div class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">{{ profile.contact.email }}</div>
              </div>
            </a>
          </div>

          <p class="text-[11px] mt-5 text-center" :style="{ color: 'var(--color-linear-text-tertiary)' }">
            （二维码图片放到 public/qrcodes/ 下即可显示）
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

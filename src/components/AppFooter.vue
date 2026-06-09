<script setup>
import { useContent } from '../composables/useContent'

const { profile } = useContent()
const year = new Date().getFullYear()
</script>

<template>
  <footer
    id="about"
    class="py-10 md:py-12 px-4 sm:px-6 border-t"
    :style="{ borderColor: 'var(--color-linear-border)' }"
  >
    <div class="max-w-6xl mx-auto flex flex-col gap-5">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div class="flex items-center justify-center gap-3">
          <img src="/mascot/pixiu-secondary.png?v=0.1.0" alt="" class="w-10 h-10" />
          <div class="text-sm" :style="{ color: 'var(--color-linear-text-secondary)' }">
            皮玺玉 × AI 貔貅 · v0.1.0
          </div>
        </div>

        <div class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">
          © {{ year }} 皮玺玉 · 用 AI 给生活打补丁
        </div>
      </div>

      <div
        class="rounded-lg p-4 text-xs leading-relaxed"
        :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text-tertiary)' }"
      >
        <p class="font-medium mb-1" :style="{ color: 'var(--color-linear-text-secondary)' }">
          隐私与数据用途说明
        </p>
        <p>
          本站只为作品展示、联系跟进和面试演示记录必要信息：留言表单会保存你主动填写的称呼、联系方式和需求；基础埋点只用于了解页面访问、作品点击、联系和客服使用情况。请不要在留言或客服中提交身份证、银行卡、住址等敏感信息。
        </p>
      </div>
    </div>
  </footer>
</template>

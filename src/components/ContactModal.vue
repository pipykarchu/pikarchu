<script setup>
import { reactive, ref } from 'vue'
import { useContent } from '../composables/useContent'
import { useTracker } from '../composables/useTracker'
import { withBase } from '../composables/useAssetPath'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])

const { profile } = useContent()
const { track } = useTracker()
const form = reactive({
  name: '',
  contact: '',
  message: ''
})
const submitting = ref(false)
const submitStatus = ref('')
const submitError = ref('')
const activeQr = ref('')
const copiedEmail = ref(false)

const handleClose = (emit) => emit('update:modelValue', false)

const handleSubmit = async () => {
  submitting.value = true
  submitStatus.value = ''
  submitError.value = ''

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await response.json()

    if (!response.ok || !data.ok) {
      throw new Error(data.error || '提交失败，请稍后再试')
    }

    form.name = ''
    form.contact = ''
    form.message = ''
    submitStatus.value = '已收到，会保存到本地留言记录。'
    track('contact_submit', 'contact_form')
  } catch (error) {
    submitError.value = error.message || '提交失败，请确认 API 服务已启动'
  } finally {
    submitting.value = false
  }
}

const copyEmail = async () => {
  const email = profile.value.contact.email
  try {
    await navigator.clipboard.writeText(email)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = email
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  copiedEmail.value = true
  window.setTimeout(() => {
    copiedEmail.value = false
  }, 1600)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
        style="background: rgba(0,0,0,0.5);"
        @click.self="$emit('update:modelValue', false)"
      >
        <div
          class="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        >
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-semibold" :style="{ color: 'var(--color-linear-text)' }">
              约我聊聊
            </h3>
            <button
              @click="$emit('update:modelValue', false)"
              class="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors"
              :style="{ color: 'var(--color-linear-text-secondary)' }"
            >
              ✕
            </button>
          </div>

          <p class="text-sm mb-5 leading-relaxed" :style="{ color: 'var(--color-linear-text-secondary)' }">
            🐉 貔貅闻到 buff 了。下面三个入口，挑顺手的来。
          </p>

          <form v-if="false" class="space-y-3 mb-5" @submit.prevent="handleSubmit">
            <div class="grid sm:grid-cols-2 gap-3">
              <input
                v-model="form.name"
                type="text"
                placeholder="怎么称呼你"
                class="w-full px-3 py-3 sm:py-2.5 rounded-2xl text-sm outline-none"
                :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text)', border: '1px solid var(--color-linear-border)' }"
              />
              <input
                v-model="form.contact"
                type="text"
                placeholder="微信 / 邮箱 / 电话"
                class="w-full px-3 py-3 sm:py-2.5 rounded-2xl text-sm outline-none"
                :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text)', border: '1px solid var(--color-linear-border)' }"
              />
            </div>
            <textarea
              v-model="form.message"
              rows="3"
              placeholder="想聊什么项目或需求"
              class="w-full px-3 py-3 sm:py-2.5 rounded-2xl text-sm outline-none resize-none"
              :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text)', border: '1px solid var(--color-linear-border)' }"
            ></textarea>
            <button
              type="submit"
              :disabled="submitting"
              class="w-full px-4 py-3 sm:py-2.5 rounded-full text-sm font-medium text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
              style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%);"
            >
              {{ submitting ? '提交中...' : '提交留言' }}
            </button>
            <p v-if="submitStatus" class="text-xs text-center text-emerald-500">{{ submitStatus }}</p>
            <p v-if="submitError" class="text-xs text-center text-red-400">{{ submitError }}</p>
          </form>

          <div class="mb-5 rounded-2xl p-3 text-sm leading-6" :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-secondary)' }">
            公开面试版暂不启用在线留言，避免无后端时提交失败。可以直接扫码或复制邮箱联系。
          </div>

          <div class="space-y-3">
            <button
              type="button"
              @click="activeQr = activeQr === 'wechat' ? '' : 'wechat'"
              class="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-transform hover:scale-[1.01]"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: linear-gradient(135deg, #07C160 0%, #0AC176 100%);">💬</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium" :style="{ color: 'var(--color-linear-text)' }">微信</div>
                <div class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">点击查看好友二维码</div>
              </div>
              <span class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">{{ activeQr === 'wechat' ? '收起' : '展开' }}</span>
            </button>

            <div
              v-if="activeQr === 'wechat'"
              class="rounded-2xl p-4 text-center"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <img
                :src="withBase(profile.contact.wechat)"
                alt="微信二维码"
                class="mx-auto w-44 h-44 rounded-xl object-contain bg-white p-2"
                draggable="false"
              />
              <p class="mt-2 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">微信扫码添加</p>
            </div>

            <button
              type="button"
              @click="activeQr = activeQr === 'xhs' ? '' : 'xhs'"
              class="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-transform hover:scale-[1.01]"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: linear-gradient(135deg, #FE2C55 0%, #FF4081 100%);">📕</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium" :style="{ color: 'var(--color-linear-text)' }">小红书</div>
                <div class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">点击查看主页二维码</div>
              </div>
              <span class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">{{ activeQr === 'xhs' ? '收起' : '展开' }}</span>
            </button>

            <div
              v-if="activeQr === 'xhs'"
              class="rounded-2xl p-4 text-center"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <img
                :src="withBase(profile.contact.xiaohongshu)"
                alt="小红书二维码"
                class="mx-auto w-44 h-44 rounded-xl object-contain bg-white p-2"
                draggable="false"
              />
              <p class="mt-2 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">小红书扫码关注</p>
            </div>

            <button
              type="button"
              @click="copyEmail"
              class="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-transform hover:scale-[1.02]"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%);">✉️</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium" :style="{ color: 'var(--color-linear-text)' }">邮箱</div>
                <div class="text-xs break-all" :style="{ color: 'var(--color-linear-text-tertiary)' }">{{ profile.contact.email }}</div>
              </div>
              <span class="text-xs shrink-0" :style="{ color: copiedEmail ? '#34d399' : 'var(--color-linear-text-tertiary)' }">
                {{ copiedEmail ? '已复制' : '复制' }}
              </span>
            </button>
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

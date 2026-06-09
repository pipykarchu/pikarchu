<script setup>
import { nextTick, ref } from 'vue'
import { useTracker } from '../composables/useTracker'

defineEmits(['open-contact'])

const t = {
  title: '\u667a\u80fd\u5ba2\u670d',
  subtitle: '\u53ef\u4ee5\u95ee\u6211\u4e2a\u4eba\u4ecb\u7ecd\u548c\u4f5c\u54c1\u4ecb\u7ecd',
  open: '\u6253\u5f00\u667a\u80fd\u5ba2\u670d',
  close: '\u5173\u95ed',
  contact: '\u7559\u8a00 / \u8054\u7cfb',
  placeholder: '\u8f93\u5165\u4f60\u60f3\u4e86\u89e3\u7684\u95ee\u9898',
  send: '\u53d1\u9001',
  sending: '\u601d\u8003\u4e2d...',
  intro: '\u4f60\u597d\uff0c\u6211\u53ef\u4ee5\u5e2e\u4f60\u4e86\u89e3\u8fd9\u4e2a\u4eba\u7ad9\u7684\u4e3b\u4eba\u3001\u4f5c\u54c1\u548c\u8054\u7cfb\u65b9\u5f0f\u3002',
  error: '\u6682\u65f6\u6ca1\u6709\u8fde\u4e0a\u667a\u80fd\u5ba2\u670d\uff0c\u53ef\u4ee5\u5148\u70b9\u51fb\u7559\u8a00\u5165\u53e3\u8054\u7cfb\u3002',
  empty: '\u8bf7\u5148\u8f93\u5165\u4e00\u4e2a\u95ee\u9898\u3002',
  configTip: '\u672a\u914d\u7f6e API Key \u65f6\u4f1a\u4f7f\u7528\u672c\u5730\u57fa\u7840\u56de\u590d\u3002'
}

const suggestions = [
  '\u4f60\u662f\u505a\u4ec0\u4e48\u7684\uff1f',
  '\u6709\u54ea\u4e9b\u4f5c\u54c1\uff1f',
  '\u600e\u4e48\u8054\u7cfb\u4f60\uff1f'
]

const open = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref([
  { role: 'assistant', content: t.intro }
])
const chatBody = ref(null)
const { track } = useTracker()

const scrollToBottom = async () => {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

const toggleOpen = () => {
  open.value = !open.value
  track(open.value ? 'chat_open' : 'chat_close', 'ai_chat')
}

const ask = async (preset = '') => {
  const content = String(preset || input.value).trim()
  if (!content) {
    input.value = ''
    return
  }

  input.value = ''
  messages.value.push({ role: 'user', content })
  loading.value = true
  track('chat_send', content.slice(0, 80))
  await scrollToBottom()

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value.slice(-8) })
    })
    const data = await response.json()

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'chat failed')
    }

    messages.value.push({ role: 'assistant', content: data.reply })
  } catch {
    messages.value.push({ role: 'assistant', content: t.error })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}
</script>

<template>
  <div class="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40">
    <Transition name="chat-panel">
      <section
        v-if="open"
        class="mb-3 w-[calc(100vw-2rem)] max-w-sm h-[min(620px,calc(100vh-7rem))] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        aria-live="polite"
      >
        <header
          class="px-4 py-3 flex items-center justify-between gap-3"
          :style="{ borderBottom: '1px solid var(--color-linear-border)' }"
        >
          <div class="min-w-0">
            <h3 class="text-sm font-semibold leading-5" :style="{ color: 'var(--color-linear-text)' }">
              {{ t.title }}
            </h3>
            <p class="text-xs leading-4 truncate" :style="{ color: 'var(--color-linear-text-tertiary)' }">
              {{ t.subtitle }}
            </p>
          </div>
          <button
            type="button"
            class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm"
            :style="{ color: 'var(--color-linear-text-secondary)', background: 'var(--color-linear-bg-tertiary)' }"
            :title="t.close"
            @click="toggleOpen"
          >
            x
          </button>
        </header>

        <div ref="chatBody" class="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          <div
            v-for="(message, index) in messages"
            :key="`${message.role}-${index}`"
            class="flex"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <p
              class="max-w-[82%] rounded-xl px-3 py-2 text-sm leading-6 whitespace-pre-wrap break-words"
              :style="message.role === 'user'
                ? { background: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)', color: '#fff' }
                : { background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text)' }"
            >
              {{ message.content }}
            </p>
          </div>

          <div v-if="loading" class="flex justify-start">
            <p
              class="max-w-[82%] rounded-xl px-3 py-2 text-sm leading-6"
              :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-secondary)' }"
            >
              {{ t.sending }}
            </p>
          </div>
        </div>

        <div class="px-3 pb-3 space-y-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in suggestions"
              :key="item"
              type="button"
              class="px-3 py-1.5 rounded-full text-xs leading-4"
              :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-secondary)' }"
              @click="ask(item)"
            >
              {{ item }}
            </button>
          </div>

          <form
            class="flex gap-2"
            @submit.prevent="ask()"
          >
            <input
              v-model="input"
              type="text"
              class="min-w-0 flex-1 rounded-full px-3 py-2.5 text-sm outline-none"
              :placeholder="t.placeholder"
              :disabled="loading"
              :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text)', border: '1px solid var(--color-linear-border)' }"
            />
            <button
              type="submit"
              class="w-16 rounded-full text-sm font-medium text-white disabled:opacity-60"
              :disabled="loading || !input.trim()"
              style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%);"
            >
              {{ t.send }}
            </button>
          </form>

          <button
            type="button"
            class="w-full rounded-full px-4 py-2.5 text-sm font-medium"
            :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text)' }"
            @click="$emit('open-contact')"
          >
            {{ t.contact }}
          </button>
        </div>
      </section>
    </Transition>

    <button
      type="button"
      class="w-20 h-20 md:w-24 md:h-24 transition-all duration-300 hover:-translate-y-1 hover:scale-105 flex items-center justify-center bg-transparent border-0 p-0"
      :title="t.open"
      @click="toggleOpen"
    >
      <img
        src="/mascot/pixiu-hero.png?v=0.1.0"
        alt=""
        class="w-full h-full object-contain drop-shadow-[0_14px_24px_rgba(167,139,250,0.32)]"
        draggable="false"
      />
    </button>
  </div>
</template>

<style scoped>
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>

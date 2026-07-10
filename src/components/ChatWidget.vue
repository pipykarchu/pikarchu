<script setup>
import { nextTick, ref } from 'vue'
import { useTracker } from '../composables/useTracker'
import profile from '../../content/profile.json'
import projects from '../../content/projects.json'
import services from '../../content/services.json'

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
  error: '\u6682\u65f6\u6ca1\u6709\u8fde\u4e0a\u5728\u7ebf AI\uff0c\u6211\u5148\u7528\u7ad9\u70b9\u8d44\u6599\u56de\u7b54\u57fa\u7840\u95ee\u9898\u3002',
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
const visibleProjects = [...projects]
  .filter(project => !project.hidden)
  .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

const includesAny = (text, keywords) => keywords.some(keyword => text.includes(keyword))

const formatProjectList = (items = visibleProjects.slice(0, 6)) => {
  return items
    .map((project, index) => `${index + 1}. ${project.title}：${project.shortDesc}`)
    .join('\n')
}

const getLocalReply = (question) => {
  const text = String(question || '').toLowerCase()

  if (includesAny(text, ['联系', '微信', '邮箱', '小红书', 'contact', '合作'])) {
    return [
      `可以通过页面里的“留言 / 联系”入口联系${profile.name}。`,
      profile.contact?.email ? `邮箱：${profile.contact.email}` : '',
      '也可以在联系弹窗里查看微信和小红书二维码。'
    ].filter(Boolean).join('\n')
  }

  if (includesAny(text, ['作品', '项目', '案例', 'demo', '做过', '有哪些'])) {
    return [
      `${profile.name}目前展示的重点作品有：`,
      formatProjectList(),
      '你可以点击作品卡片查看详情、PRD 或演示页面。'
    ].join('\n')
  }

  if (includesAny(text, ['服务', '定制', '咨询', '培训', '报价', '价格', '付费'])) {
    return [
      '目前站点里有两类服务入口：',
      ...services.map(item => `- ${item.title}：${item.desc}`),
      '具体报价和合作范围需要结合需求确认，建议点击“留言 / 联系”说明你的场景。'
    ].join('\n')
  }

  if (includesAny(text, ['skill', 'prd', '工作流', 'prompt', '提示词'])) {
    const skillProjects = visibleProjects.filter(project =>
      /skill|prd|工作流|漫剧|分镜|定妆/i.test(`${project.title} ${project.tags?.join(' ') || ''}`)
    ).slice(0, 5)

    return [
      `${profile.name}把 AI 能力沉淀成可复用工作流，不只是一次性 Prompt。`,
      formatProjectList(skillProjects),
      '这些 Skill 主要覆盖 PRD、剧本、分镜、定妆造和漫剧生产。'
    ].join('\n')
  }

  if (includesAny(text, ['你是谁', '做什么', '介绍', '主人', '个人', '定位', 'who'])) {
    return [
      `${profile.greeting}。`,
      `${profile.intro}`,
      `这个站点主要展示 AI 产品实践、工作流工具、内容生产项目和个人服务入口。`,
      `一句话定位：${profile.slogan}。`
    ].join('\n')
  }

  return [
    t.error,
    '你可以问我：',
    '1. 你是做什么的？',
    '2. 有哪些作品？',
    '3. 怎么联系你？',
    '4. 有哪些 Skill 或工作流？'
  ].join('\n')
}

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
    messages.value.push({ role: 'assistant', content: getLocalReply(content) })
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

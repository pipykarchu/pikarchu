<script setup>
import { computed, onMounted, ref } from 'vue'
import defaultServicePackages from '../../content/servicePackages.json'
import { withBase } from '../composables/useAssetPath'

const tokenKey = 'pixiyu_admin_token'
const staticDemoToken = 'static-demo-admin'
const routeParams = new URLSearchParams(window.location.search)
const isStaticAdminDemo = window.location.hostname.endsWith('github.io') || routeParams.has('staticAdminDemo')
const token = ref(localStorage.getItem(tokenKey) || '')
const username = ref('admin')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const saveStatus = ref('')
const summary = ref(null)
const activeTab = ref('messages')
const servicePackageDrafts = ref([])

const statusOptions = [
  { value: 'unread', label: '未读' },
  { value: 'read', label: '已读' },
  { value: 'replied', label: '已回复' },
  { value: 'archived', label: '已归档' }
]

const isAuthed = computed(() => Boolean(token.value))
const stats = computed(() => summary.value?.stats || {})
const contacts = computed(() => summary.value?.contacts || [])
const events = computed(() => summary.value?.recentEvents || [])
const eventCounts = computed(() => summary.value?.eventCounts || {})
const moduleUsage = computed(() => summary.value?.moduleUsage || [])
const retention = computed(() => summary.value?.retention || {})
const statusCounts = computed(() => summary.value?.statusCounts || {})
const servicePackages = computed(() => {
  const packages = summary.value?.servicePackages
  return Array.isArray(packages) && packages.length ? packages : defaultServicePackages
})

const statusLabel = (value) => statusOptions.find(item => item.value === value)?.label || value || '未读'

const createStaticDemoSummary = () => ({
  ok: true,
  stats: {
    contacts: 3,
    unreadContacts: 1,
    readContacts: 1,
    repliedContacts: 1,
    archivedContacts: 0,
    pageViews: 186,
    sessions: 42,
    eventsToday: 18,
    contacts7d: 2
  },
  contacts: [
    {
      id: 'demo-contact-001',
      name: '面试官演示',
      contact: 'demo@example.com',
      message: '想了解个人站如何把作品展示、智能客服、留言和后台复盘串成一个闭环。',
      status: 'unread',
      reminderStatus: 'demo',
      createdAt: '2026-07-08T10:20:00+08:00'
    },
    {
      id: 'demo-contact-002',
      name: '内容合作方',
      contact: 'wechat-demo',
      message: '关注漫剧工作流、娃娃仙成片验证和定妆造 Skill 的复用方式。',
      status: 'read',
      reminderStatus: 'demo',
      createdAt: '2026-07-07T17:40:00+08:00'
    },
    {
      id: 'demo-contact-003',
      name: '业务工具咨询',
      contact: 'ops-demo@example.com',
      message: '想看采购履行预警看板、视频学习助手和减肥记录仪的演示路径。',
      status: 'replied',
      reminderStatus: 'demo',
      createdAt: '2026-07-06T09:15:00+08:00'
    }
  ],
  recentEvents: [
    { id: 'demo-event-001', type: 'page_view', label: 'site_home_demo', path: '/', createdAt: '2026-07-08T10:18:00+08:00' },
    { id: 'demo-event-002', type: 'project_detail_open', label: '漫剧生产工作流', path: '/', createdAt: '2026-07-08T10:19:00+08:00' },
    { id: 'demo-event-003', type: 'chat_open', label: 'ai_chat', path: '/', createdAt: '2026-07-08T10:19:20+08:00' },
    { id: 'demo-event-004', type: 'contact_submit', label: 'contact_modal', path: '/', createdAt: '2026-07-08T10:20:00+08:00' }
  ],
  eventCounts: {
    page_view: 86,
    project_detail_open: 38,
    project_action_click: 21,
    chat_open: 18,
    chat_send: 9,
    contact_submit: 3
  },
  moduleUsage: [
    { module: '作品区', events: 59, sessions: 31, clicks: 21, opens: 38, actions: 21, usageRate: 73.8 },
    { module: '智能客服', events: 27, sessions: 18, clicks: 0, opens: 18, actions: 9, usageRate: 42.9 },
    { module: '联系转化', events: 11, sessions: 7, clicks: 4, opens: 4, actions: 3, usageRate: 16.7 },
    { module: '资料文档', events: 14, sessions: 9, clicks: 14, opens: 0, actions: 14, usageRate: 21.4 }
  ],
  retention: {
    totalSessions: 42,
    retainedSessions: 9,
    retentionRate: 21.4,
    active7dSessions: 26,
    previous7dSessions: 18,
    returning7dRate: 144.4
  },
  statusCounts: {
    unread: 1,
    read: 1,
    replied: 1,
    archived: 0
  },
  servicePackages: defaultServicePackages,
  reminder: {
    email: 'demo@example.com',
    enabled: false,
    provider: 'static-demo',
    note: 'GitHub Pages 静态演示版：展示后台能力，不发送真实邮件。'
  },
  security: {
    customAdminSecret: true,
    customAdminPassword: true,
    https: 'GitHub Pages 已提供 HTTPS；当前为静态演示后台。',
    rateLimit: true
  }
})

const refreshStaticStatusStats = () => {
  if (!summary.value?.contacts) return
  const counts = summary.value.contacts.reduce((acc, contact) => {
    acc[contact.status] = (acc[contact.status] || 0) + 1
    return acc
  }, {})
  summary.value.statusCounts = counts
  summary.value.stats = {
    ...summary.value.stats,
    unreadContacts: counts.unread || 0,
    readContacts: counts.read || 0,
    repliedContacts: counts.replied || 0,
    archivedContacts: counts.archived || 0
  }
}

const readJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(isStaticAdminDemo
      ? '线上静态演示后台没有连接真实 API，已切换为演示数据模式。'
      : '后台接口返回格式异常，请确认 API 服务已启动。')
  }
  return response.json()
}

const requestAdmin = async (path, options = {}) => {
  if (isStaticAdminDemo) {
    if (path === '/api/admin/summary') return createStaticDemoSummary()
    if (path.includes('/api/admin/contacts/')) return { ok: true }
    if (path === '/api/admin/service-packages') {
      return { ok: true, servicePackages: JSON.parse(options.body || '{}').packages || defaultServicePackages }
    }
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
      ...(options.headers || {})
    }
  })
  const data = await readJsonResponse(response)
  if (!response.ok || data.ok === false) throw new Error(data.error || '请求失败')
  return data
}

const loadSummary = async () => {
  if (!token.value) return
  loading.value = true
  error.value = ''
  try {
    summary.value = await requestAdmin('/api/admin/summary')
    servicePackageDrafts.value = servicePackages.value.map(cloneServicePackage)
  } catch (err) {
    error.value = err.message || '后台数据加载失败'
    if (String(error.value).includes('Unauthorized')) logout()
  } finally {
    loading.value = false
  }
}

const cloneServicePackage = (item = {}, index = 0) => ({
  id: item.id || `package-${index + 1}`,
  title: item.title || '',
  price: item.price || '',
  subtitle: item.subtitle || '',
  desc: item.desc || '',
  deliveryText: Array.isArray(item.delivery) ? item.delivery.join('\n') : '',
  cycle: item.cycle || ''
})

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    if (isStaticAdminDemo) {
      if (username.value !== 'admin' || password.value !== '1111') {
        throw new Error('演示账号或密码不正确')
      }
      token.value = staticDemoToken
      localStorage.setItem(tokenKey, staticDemoToken)
      password.value = ''
      summary.value = createStaticDemoSummary()
      servicePackageDrafts.value = servicePackages.value.map(cloneServicePackage)
      saveStatus.value = '当前为 GitHub Pages 静态演示后台，数据为虚拟样例，不写入服务器。'
      return
    }

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const data = await readJsonResponse(response)
    if (!response.ok || !data.ok) throw new Error(data.error || '登录失败')
    token.value = data.token
    localStorage.setItem(tokenKey, data.token)
    password.value = ''
    await loadSummary()
  } catch (err) {
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}

const logout = () => {
  token.value = ''
  summary.value = null
  localStorage.removeItem(tokenKey)
}

const updateStatus = async (contact, status) => {
  loading.value = true
  error.value = ''
  try {
    if (isStaticAdminDemo) {
      if (summary.value?.contacts) {
        summary.value.contacts = summary.value.contacts.map(item => (
          item.id === contact.id ? { ...item, status, statusUpdatedAt: new Date().toISOString() } : item
        ))
        refreshStaticStatusStats()
      }
      return
    }

    await requestAdmin(`/api/admin/contacts/${encodeURIComponent(contact.id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
    await loadSummary()
  } catch (err) {
    error.value = err.message || '状态更新失败'
  } finally {
    loading.value = false
  }
}

const addServicePackage = () => {
  servicePackageDrafts.value.push(cloneServicePackage({}, servicePackageDrafts.value.length))
}

const resetServicePackageDrafts = () => {
  servicePackageDrafts.value = servicePackages.value.map(cloneServicePackage)
  saveStatus.value = '已载入当前前台价格卡片，可继续修改后保存。'
}

const removeServicePackage = (index) => {
  if (servicePackageDrafts.value.length <= 1) {
    error.value = '至少保留一张价格卡片'
    return
  }
  servicePackageDrafts.value.splice(index, 1)
}

const saveServicePackages = async () => {
  loading.value = true
  error.value = ''
  saveStatus.value = ''
  try {
    const packages = servicePackageDrafts.value.map((item, index) => ({
      id: item.id || `package-${index + 1}`,
      title: item.title,
      price: item.price,
      subtitle: item.subtitle,
      desc: item.desc,
      delivery: item.deliveryText.split('\n').map(point => point.trim()).filter(Boolean),
      cycle: item.cycle
    }))

    if (isStaticAdminDemo) {
      summary.value = {
        ...summary.value,
        servicePackages: packages
      }
      servicePackageDrafts.value = packages.map(cloneServicePackage)
      saveStatus.value = '静态演示版已在当前页面模拟保存，刷新后会恢复默认演示数据。'
      return
    }

    const data = await requestAdmin('/api/admin/service-packages', {
      method: 'PATCH',
      body: JSON.stringify({ packages })
    })
    summary.value = {
      ...summary.value,
      servicePackages: data.servicePackages
    }
    servicePackageDrafts.value = data.servicePackages.map(cloneServicePackage)
    saveStatus.value = '价格卡片已保存，前台刷新后生效。'
  } catch (err) {
    error.value = err.message || '价格卡片保存失败'
  } finally {
    loading.value = false
  }
}

const formatTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadSummary)
</script>

<template>
  <main class="min-h-screen px-4 py-5 sm:px-6" :style="{ background: 'var(--color-linear-bg)', color: 'var(--color-linear-text)' }">
    <section class="mx-auto max-w-6xl">
      <header class="mb-5 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">个人 IP 运营后台</p>
          <h1 class="text-2xl font-bold leading-tight sm:text-3xl">留言与数据管理</h1>
        </div>
        <a
          :href="withBase('/')"
          class="rounded-full px-4 py-2 text-sm"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
        >
          返回前台
        </a>
      </header>

      <section
        v-if="!isAuthed"
        class="mx-auto mt-12 max-w-sm rounded-2xl p-5 shadow-xl"
        :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
      >
        <h2 class="mb-1 text-lg font-semibold">账号登录</h2>
        <p class="mb-5 text-sm" :style="{ color: 'var(--color-linear-text-secondary)' }">
          本地默认账号仅用于预览，上线前请改成环境变量里的强密码。
        </p>
        <form class="space-y-3" @submit.prevent="login">
          <input
            v-model="username"
            autocomplete="username"
            class="w-full rounded-2xl px-4 py-3 text-sm outline-none"
            :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
            placeholder="账号"
          />
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              class="w-full rounded-2xl py-3 pl-4 pr-20 text-sm outline-none"
              :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
              placeholder="密码"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs"
              :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text-secondary)' }"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </div>
          <button
            class="w-full rounded-full px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%);"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '登录后台' }}
          </button>
        </form>
        <p v-if="error" class="mt-3 text-center text-xs text-red-400">{{ error }}</p>
      </section>

      <section v-else class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex rounded-full p-1" :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }">
            <button
              v-for="tab in [
                { id: 'messages', label: '留言' },
                { id: 'analytics', label: '数据' },
                { id: 'pricing', label: '价格卡片' },
                { id: 'settings', label: '提醒与安全' }
              ]"
              :key="tab.id"
              class="rounded-full px-4 py-2 text-sm"
              :style="activeTab === tab.id ? { background: 'var(--color-linear-text)', color: 'var(--color-linear-bg)' } : { color: 'var(--color-linear-text-secondary)' }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="flex gap-2">
            <button
              class="rounded-full px-4 py-2 text-sm"
              :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
              @click="loadSummary"
            >
              刷新
            </button>
            <button
              class="rounded-full px-4 py-2 text-sm"
              :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
              @click="logout"
            >
              退出
            </button>
          </div>
        </div>

        <p v-if="error" class="rounded-2xl p-3 text-sm text-red-400" :style="{ background: 'var(--color-linear-bg-secondary)' }">{{ error }}</p>

        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div
            v-for="item in [
              { label: '总留言', value: stats.contacts || 0 },
              { label: '未读', value: stats.unreadContacts || 0 },
              { label: '浏览量', value: stats.pageViews || 0 },
              { label: '访客会话', value: stats.sessions || 0 }
            ]"
            :key="item.label"
            class="rounded-2xl p-4"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
          >
            <div class="text-2xl font-bold">{{ item.value }}</div>
            <div class="mt-1 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">{{ item.label }}</div>
          </div>
        </div>

        <section v-if="activeTab === 'messages'" class="space-y-3">
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="option in statusOptions"
              :key="option.value"
              class="rounded-2xl p-3 text-center text-sm"
              :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
            >
              <div class="font-semibold">{{ statusCounts[option.value] || 0 }}</div>
              <div class="mt-1 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">{{ option.label }}</div>
            </div>
          </div>

          <article
            v-for="item in contacts"
            :key="item.id"
            class="rounded-2xl p-4"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
          >
            <div class="mb-2 flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="font-semibold">{{ item.name || '未留称呼' }}</h3>
                <p class="break-all text-sm" :style="{ color: 'var(--color-linear-text-secondary)' }">{{ item.contact || '未留联系方式' }}</p>
              </div>
              <span class="shrink-0 rounded-full px-2 py-1 text-[11px]" :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-tertiary)' }">
                {{ statusLabel(item.status) }}
              </span>
            </div>
            <p class="whitespace-pre-wrap text-sm leading-relaxed">{{ item.message || '无留言内容' }}</p>
            <p class="mt-3 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">
              {{ formatTime(item.createdAt) }} · 邮件：{{ item.reminderStatus || 'unknown' }}
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                class="rounded-full px-3 py-1.5 text-xs"
                :style="item.status === option.value ? { background: 'var(--color-linear-text)', color: 'var(--color-linear-bg)' } : { background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-secondary)' }"
                @click="updateStatus(item, option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </article>

          <div v-if="!contacts.length" class="rounded-2xl p-8 text-center text-sm" :style="{ background: 'var(--color-linear-bg-secondary)', color: 'var(--color-linear-text-tertiary)' }">
            暂无留言
          </div>
        </section>

        <section v-if="activeTab === 'analytics'" class="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div class="rounded-2xl p-4" :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }">
            <h2 class="mb-3 font-semibold">行为类型</h2>
            <div class="space-y-2">
              <div v-for="(count, type) in eventCounts" :key="type" class="flex items-center justify-between text-sm">
                <span>{{ type }}</span>
                <span class="font-semibold">{{ count }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-2xl p-4" :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }">
            <h2 class="mb-3 font-semibold">留存率</h2>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">
                <div class="text-2xl font-bold">{{ retention.retentionRate || 0 }}%</div>
                <div class="mt-1 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">跨天回访率</div>
              </div>
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">
                <div class="text-2xl font-bold">{{ retention.retainedSessions || 0 }}</div>
                <div class="mt-1 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">跨天回访会话</div>
              </div>
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">
                <div class="text-2xl font-bold">{{ retention.active7dSessions || 0 }}</div>
                <div class="mt-1 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">近 7 天会话</div>
              </div>
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">
                <div class="text-2xl font-bold">{{ retention.returning7dRate || 0 }}%</div>
                <div class="mt-1 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">近 7 天环比活跃</div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl p-4 lg:col-span-2" :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }">
            <h2 class="mb-3 font-semibold">功能模块使用率</h2>
            <div class="space-y-3">
              <div v-for="item in moduleUsage" :key="item.module">
                <div class="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span class="font-medium">{{ item.module }}</span>
                  <span :style="{ color: 'var(--color-linear-text-secondary)' }">
                    {{ item.usageRate }}% · {{ item.sessions }} 会话 · {{ item.events }} 次
                  </span>
                </div>
                <div class="h-2 overflow-hidden rounded-full" :style="{ background: 'var(--color-linear-bg-tertiary)' }">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: `${Math.min(item.usageRate || 0, 100)}%`, background: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)' }"
                  ></div>
                </div>
              </div>
              <p v-if="!moduleUsage.length" class="text-sm" :style="{ color: 'var(--color-linear-text-tertiary)' }">
                暂无模块点击数据。
              </p>
            </div>
          </div>

          <div class="rounded-2xl p-4 lg:col-span-2" :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }">
            <h2 class="mb-3 font-semibold">最近行为</h2>
            <div class="space-y-3">
              <div v-for="event in events" :key="event.id" class="border-b pb-3 last:border-b-0" :style="{ borderColor: 'var(--color-linear-border)' }">
                <div class="flex flex-wrap items-center gap-2 text-sm">
                  <span class="font-semibold">{{ event.type }}</span>
                  <span :style="{ color: 'var(--color-linear-text-secondary)' }">{{ event.label || event.path }}</span>
                </div>
                <p class="mt-1 break-all text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">{{ formatTime(event.createdAt) }} · {{ event.path }}</p>
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'pricing'" class="space-y-4">
          <div
            class="rounded-2xl p-4"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold">前台价格卡片</h2>
                <p class="mt-1 text-sm" :style="{ color: 'var(--color-linear-text-secondary)' }">
                  修改商业版“可接单服务”里的套餐标题、价格、交付内容和周期。
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-sm"
                  :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)' }"
                  @click="addServicePackage"
                >
                  新增卡片
                </button>
                <button
                  type="button"
                  class="rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  style="background: linear-gradient(135deg, #14B8A6 0%, #60A5FA 100%);"
                  :disabled="loading"
                  @click="saveServicePackages"
                >
                  {{ loading ? '保存中...' : '保存价格卡片' }}
                </button>
              </div>
            </div>
            <p v-if="saveStatus" class="mt-3 text-sm text-emerald-500">{{ saveStatus }}</p>
          </div>

          <article
            v-for="(item, index) in servicePackageDrafts"
            :key="`${item.id}-${index}`"
            class="rounded-2xl p-4"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
          >
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="font-semibold">价格卡片 {{ index + 1 }}</h3>
              <button
                type="button"
                class="rounded-full px-3 py-1.5 text-xs"
                :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-secondary)' }"
                @click="removeServicePackage(index)"
              >
                删除
              </button>
            </div>

            <div class="grid gap-3 md:grid-cols-2">
              <label class="space-y-1 text-sm">
                <span :style="{ color: 'var(--color-linear-text-tertiary)' }">ID</span>
                <input
                  v-model="item.id"
                  class="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                  :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
                  placeholder="resume"
                />
              </label>
              <label class="space-y-1 text-sm">
                <span :style="{ color: 'var(--color-linear-text-tertiary)' }">标题</span>
                <input
                  v-model="item.title"
                  class="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                  :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
                  placeholder="简历 / JD 优化"
                />
              </label>
              <label class="space-y-1 text-sm">
                <span :style="{ color: 'var(--color-linear-text-tertiary)' }">价格</span>
                <input
                  v-model="item.price"
                  class="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                  :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
                  placeholder="99 元起"
                />
              </label>
              <label class="space-y-1 text-sm">
                <span :style="{ color: 'var(--color-linear-text-tertiary)' }">周期</span>
                <input
                  v-model="item.cycle"
                  class="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                  :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
                  placeholder="24-48 小时"
                />
              </label>
            </div>

            <label class="mt-3 block space-y-1 text-sm">
              <span :style="{ color: 'var(--color-linear-text-tertiary)' }">副标题</span>
              <input
                v-model="item.subtitle"
                class="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
                placeholder="适合求职、转岗、面试前冲刺"
              />
            </label>

            <label class="mt-3 block space-y-1 text-sm">
              <span :style="{ color: 'var(--color-linear-text-tertiary)' }">描述</span>
              <textarea
                v-model="item.desc"
                rows="3"
                class="w-full resize-none rounded-2xl px-3 py-2.5 text-sm outline-none"
                :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
                placeholder="这张价格卡片解决什么问题"
              ></textarea>
            </label>

            <label class="mt-3 block space-y-1 text-sm">
              <span :style="{ color: 'var(--color-linear-text-tertiary)' }">交付内容（每行一条）</span>
              <textarea
                v-model="item.deliveryText"
                rows="4"
                class="w-full resize-none rounded-2xl px-3 py-2.5 text-sm outline-none"
                :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
                placeholder="1 版简历修改建议&#10;JD 匹配亮点&#10;面试讲稿要点"
              ></textarea>
            </label>
          </article>

          <div
            v-if="!servicePackageDrafts.length"
            class="rounded-2xl p-6 text-center"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
          >
            <p class="text-sm" :style="{ color: 'var(--color-linear-text-secondary)' }">
              还没有加载到可编辑的价格卡片。
            </p>
            <button
              type="button"
              class="mt-3 rounded-full px-4 py-2 text-sm"
              :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)' }"
              @click="resetServicePackageDrafts"
            >
              载入当前前台价格卡片
            </button>
          </div>
        </section>

        <section v-if="activeTab === 'settings'" class="grid gap-4 lg:grid-cols-2">
          <div class="rounded-2xl p-5" :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }">
            <h2 class="mb-2 text-lg font-semibold">邮件提醒</h2>
            <p class="text-sm leading-relaxed" :style="{ color: 'var(--color-linear-text-secondary)' }">
              当前状态：{{ summary?.reminder?.note }}
            </p>
            <div class="mt-4 grid gap-3 text-sm">
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">收件邮箱：{{ summary?.reminder?.email }}</div>
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">发送方式：{{ summary?.reminder?.provider }}</div>
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">QQ 邮箱需要开启 SMTP，并使用授权码作为 SMTP_PASS。</div>
            </div>
          </div>

          <div class="rounded-2xl p-5" :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }">
            <h2 class="mb-2 text-lg font-semibold">上线安全</h2>
            <div class="grid gap-3 text-sm">
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">固定 ADMIN_SECRET：{{ summary?.security?.customAdminSecret ? '已配置' : '未配置' }}</div>
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">后台强密码：{{ summary?.security?.customAdminPassword ? '已配置' : '仍使用默认值' }}</div>
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">基础限流：{{ summary?.security?.rateLimit ? '已开启' : '未开启' }}</div>
              <div class="rounded-2xl p-3" :style="{ background: 'var(--color-linear-bg-tertiary)' }">HTTPS：{{ summary?.security?.https }}</div>
            </div>
          </div>
        </section>
      </section>
    </section>
  </main>
</template>

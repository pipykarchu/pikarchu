<script setup>
import { computed, onMounted, ref } from 'vue'
import defaultServicePackages from '../../content/servicePackages.json'

const tokenKey = 'pixiyu_admin_token'
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
const statusCounts = computed(() => summary.value?.statusCounts || {})
const servicePackages = computed(() => {
  const packages = summary.value?.servicePackages
  return Array.isArray(packages) && packages.length ? packages : defaultServicePackages
})

const statusLabel = (value) => statusOptions.find(item => item.value === value)?.label || value || '未读'

const requestAdmin = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`,
      ...(options.headers || {})
    }
  })
  const data = await response.json()
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
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    const data = await response.json()
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
          href="/"
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

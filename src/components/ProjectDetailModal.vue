<script setup>
import StatusBadge from './StatusBadge.vue'
import { useTracker } from '../composables/useTracker'

defineProps({
  project: { type: Object, default: null },
  accent: { type: String, default: '#A78BFA' }
})
defineEmits(['close'])

const { track } = useTracker()

const handleActionClick = (project, action) => {
  track('project_action_click', `${project?.id || project?.title || 'unknown'}:${action.label}`)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="project"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
        style="background: rgba(0,0,0,0.56);"
        @click.self="$emit('close')"
      >
        <article
          class="w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        >
          <div class="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-xl" :style="{ background: 'color-mix(in srgb, var(--color-linear-bg-secondary) 88%, transparent)', borderBottom: '1px solid var(--color-linear-border)' }">
            <div class="min-w-0">
              <div class="mb-2">
                <StatusBadge :status="project.status" />
              </div>
              <h3 class="text-lg md:text-2xl font-semibold leading-tight line-clamp-2 sm:truncate" :style="{ color: 'var(--color-linear-text)' }">
                {{ project.title }}
              </h3>
            </div>
            <button
              @click="$emit('close')"
              class="shrink-0 w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors"
              :style="{ color: 'var(--color-linear-text-secondary)', background: 'var(--color-linear-bg-tertiary)' }"
              aria-label="关闭"
            >
              x
            </button>
          </div>

          <div class="p-4 sm:p-6">
            <div v-if="project.cover" class="mb-5 sm:mb-6 h-44 md:h-64 rounded-2xl overflow-hidden" :style="{ background: 'var(--color-linear-bg-tertiary)' }">
              <img
                :src="project.cover + '?v=0.1.0'"
                :alt="project.title"
                class="w-full h-full object-cover"
                draggable="false"
              />
            </div>

            <p class="text-base leading-relaxed mb-5" :style="{ color: 'var(--color-linear-text-secondary)' }">
              {{ project.longDesc || project.shortDesc }}
            </p>

            <div v-if="project.tech?.length" class="mb-6">
              <h4 class="text-sm font-semibold mb-3" :style="{ color: 'var(--color-linear-text)' }">技术与能力栈</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in project.tech"
                  :key="item"
                  class="px-3 py-1 rounded-full text-xs"
                  :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-secondary)' }"
                >
                  {{ item }}
                </span>
              </div>
            </div>

            <div v-if="project.highlights?.length" class="mb-6">
              <h4 class="text-sm font-semibold mb-3" :style="{ color: 'var(--color-linear-text)' }">作品亮点</h4>
              <ul class="space-y-2">
                <li
                  v-for="item in project.highlights"
                  :key="item"
                  class="flex gap-2 text-sm leading-relaxed"
                  :style="{ color: 'var(--color-linear-text-secondary)' }"
                >
                  <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: accent }"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div v-if="project.actions?.length || project.links?.demo" class="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <template v-if="project.actions?.length">
                <a
                  v-for="action in project.actions.filter(item => item.href && !item.disabled)"
                  :key="action.label"
                  :href="action.href"
                  target="_blank"
                  rel="noreferrer"
                  class="px-5 py-3 sm:py-2.5 rounded-lg text-sm font-medium text-white text-center transition-transform hover:-translate-y-0.5"
                  :style="{ background: `linear-gradient(135deg, ${accent} 0%, #F472B6 100%)` }"
                  @click="handleActionClick(project, action)"
                >
                  {{ action.label }}
                </a>
                <button
                  v-for="action in project.actions.filter(item => !item.href || item.disabled)"
                  :key="action.label"
                  type="button"
                  disabled
                  class="px-5 py-3 sm:py-2.5 rounded-lg text-sm font-medium text-center cursor-not-allowed opacity-60"
                  :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-tertiary)', border: '1px solid var(--color-linear-border)' }"
                >
                  {{ action.label }}
                </button>
              </template>
              <a
                v-else-if="project.links?.demo"
                :href="project.links.demo"
                target="_blank"
                rel="noreferrer"
                class="px-5 py-3 sm:py-2.5 rounded-lg text-sm font-medium text-white text-center transition-transform hover:-translate-y-0.5"
                :style="{ background: `linear-gradient(135deg, ${accent} 0%, #F472B6 100%)` }"
                @click="handleActionClick(project, { label: 'Demo' })"
              >
                Demo
              </a>
            </div>

            <p v-if="project.links?.demoNote" class="mt-3 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">
              {{ project.links.demoNote }}
            </p>
          </div>
        </article>
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

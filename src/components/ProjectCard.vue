<script setup>
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  project: { type: Object, required: true },
  accent: { type: String, default: '#A78BFA' }
})

const handleClick = () => {
  if (props.project.links?.demo) window.open(props.project.links.demo, '_blank')
}
</script>

<template>
  <div
    @click="handleClick"
    class="group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
    :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', minHeight: '180px' }"
  >
    <div
      class="absolute -top-px -left-px -right-px h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
      :style="{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }"
    ></div>

    <div class="flex items-start justify-between mb-3">
      <h4 class="text-base font-semibold leading-tight" :style="{ color: 'var(--color-linear-text)' }">
        {{ project.title }}
      </h4>
      <StatusBadge :status="project.status" />
    </div>

    <p class="text-sm leading-relaxed flex-1" :style="{ color: 'var(--color-linear-text-secondary)' }">
      {{ project.shortDesc }}
    </p>

    <div v-if="project.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
      <span
        v-for="t in project.tags"
        :key="t"
        class="px-2 py-0.5 rounded-md text-[11px]"
        :style="{ background: 'var(--color-linear-bg-tertiary)', color: 'var(--color-linear-text-tertiary)' }"
      >
        {{ t }}
      </span>
    </div>
  </div>
</template>

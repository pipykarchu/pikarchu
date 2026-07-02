<script setup>
import { onBeforeUnmount, ref } from 'vue'
import StatusBadge from './StatusBadge.vue'
import { withBase, withVersion } from '../composables/useAssetPath'

const props = defineProps({
  project: { type: Object, required: true },
  accent: { type: String, default: '#A78BFA' }
})
const emit = defineEmits(['open-detail'])

const bitten = ref(false)
const biteNonce = ref(0)
let detailTimer = null

const getDetailDelay = () => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 0
  return 420
}

const handleClick = () => {
  bitten.value = true
  biteNonce.value++

  window.clearTimeout(detailTimer)
  detailTimer = window.setTimeout(() => {
    emit('open-detail', props.project)
  }, getDetailDelay())
}

onBeforeUnmount(() => {
  window.clearTimeout(detailTimer)
})
</script>

<template>
  <div
    @click="handleClick"
    class="card-bite group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col rounded-lg"
    :class="{ bitten }"
    :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)', minHeight: '220px' }"
  >
    <div class="bite-cut"></div>
    <svg
      v-if="bitten"
      class="bite-trim"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M 1 0 A 27 27 0 0 0 28 27"
        fill="none"
        :stroke="accent"
        stroke-width="1.3"
        stroke-dasharray="2 3"
        stroke-linecap="round"
      />
    </svg>

    <div
      class="absolute -top-px left-2 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity"
      :style="{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }"
    ></div>

    <div v-if="biteNonce > 0" :key="biteNonce" class="pixiu-bite" aria-hidden="true"></div>

    <div class="p-4 sm:p-5 flex flex-col flex-1 relative z-[1]">
      <div class="flex items-start justify-between gap-3 mb-3 pr-7">
        <h4 class="text-base font-semibold leading-tight" :style="{ color: 'var(--color-linear-text)' }">
          {{ project.title }}
        </h4>
        <StatusBadge :status="project.status" />
      </div>

      <p class="text-sm leading-relaxed flex-1" :style="{ color: 'var(--color-linear-text-secondary)' }">
        {{ project.shortDesc }}
      </p>

      <div v-if="project.cover" class="mt-4 aspect-[16/9] rounded-lg overflow-hidden" :style="{ background: 'var(--color-linear-bg-tertiary)' }">
        <img
          :src="withVersion(project.cover)"
          :alt="project.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          draggable="false"
        />
      </div>

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

      <div class="mt-4 flex items-center justify-between gap-3 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">
        <span>{{ project.highlights?.length ? project.highlights.length + ' 个亮点' : '查看详情' }}</span>
        <span v-if="project.links?.demo" class="font-medium" :style="{ color: accent }">可体验 →</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bite-cut {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 0;
  height: 0;
  background: var(--color-linear-bg);
  border-bottom-left-radius: 100%;
  pointer-events: none;
  z-index: 3;
  transition:
    width 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-bite.bitten .bite-cut {
  width: 28px;
  height: 28px;
}

.bite-trim {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  pointer-events: none;
  z-index: 4;
  opacity: 0;
  transition: opacity 0.18s ease 0.26s;
}

.card-bite.bitten .bite-trim {
  opacity: 0.7;
}

.pixiu-bite {
  position: absolute;
  top: -34px;
  right: -22px;
  width: 78px;
  height: 78px;
  pointer-events: none;
  background-image: v-bind("'url(' + withVersion('/mascot/pixiu-bite-sprite.png') + ')'");
  background-size: auto 100%;
  background-position: 0 0;
  background-repeat: no-repeat;
  filter: drop-shadow(0 6px 14px rgba(167, 139, 250, 0.4));
  transform-origin: 30% 90%;
  will-change: transform, opacity;
  z-index: 5;
  animation:
    pixiuBiteFrames 0.2s steps(2, end) forwards,
    pixiuBite 0.42s forwards;
}

@keyframes pixiuBiteFrames {
  from { background-position: 0 0; }
  to { background-position: -156px 0; }
}

@keyframes pixiuBite {
  0% {
    opacity: 0;
    transform: translate(12px, -10px) scale(0.86) rotate(-10deg);
    animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  30% {
    opacity: 1;
    transform: translate(0, 0) scale(1.02) rotate(-5deg);
    animation-timing-function: cubic-bezier(0.55, 0, 0.45, 1);
  }
  58% {
    opacity: 1;
    transform: translate(-7px, 7px) scale(1.18) rotate(9deg);
    animation-timing-function: cubic-bezier(0.55, 0, 0.45, 1);
  }
  100% {
    opacity: 0;
    transform: translate(12px, -10px) scale(0.72) rotate(-12deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pixiu-bite { animation: none; opacity: 0; }
  .bite-cut, .bite-trim { transition: none; }
}
</style>

<script setup>
import { ref } from 'vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  project: { type: Object, required: true },
  accent: { type: String, default: '#A78BFA' }
})
const emit = defineEmits(['open-detail'])

const bitten = ref(false)
const biteNonce = ref(0)

const handleClick = () => {
  bitten.value = true
  biteNonce.value++
  emit('open-detail', props.project)
}
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
          :src="project.cover + '?v=0.1.0'"
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
    width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  transition: opacity 0.5s ease 0.55s;
}

.card-bite.bitten .bite-trim {
  opacity: 0.7;
}

.pixiu-bite {
  position: absolute;
  top: -28px;
  right: -16px;
  width: 64px;
  height: 64px;
  pointer-events: none;
  background-image: url('/mascot/pixiu-hero.png?v=0.1.0');
  background-size: 220% auto;
  background-position: 50% 12%;
  background-repeat: no-repeat;
  filter: drop-shadow(0 6px 14px rgba(167, 139, 250, 0.4));
  transform-origin: 30% 90%;
  will-change: transform, opacity;
  z-index: 5;
  animation: pixiuBite 1.1s forwards;
}

@keyframes pixiuBite {
  0% {
    opacity: 0;
    transform: translate(60px, -45px) scale(0.2) rotate(-30deg);
    animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  20% {
    opacity: 1;
    transform: translate(0, 0) scale(1) rotate(-6deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
  }
  38% {
    opacity: 1;
    transform: translate(-12px, 12px) scale(1.18) rotate(14deg);
    animation-timing-function: cubic-bezier(0.55, 0, 0.45, 1);
  }
  52% {
    opacity: 1;
    transform: translate(-4px, 4px) scale(1.05) rotate(-2deg);
    animation-timing-function: cubic-bezier(0.4, 0, 1, 0.6);
  }
  70% {
    opacity: 0.5;
    transform: translate(25px, -18px) scale(0.7) rotate(-12deg);
  }
  100% {
    opacity: 0;
    transform: translate(60px, -50px) scale(0.15) rotate(-28deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pixiu-bite { animation: none; opacity: 0; }
  .bite-cut, .bite-trim { transition: none; }
}
</style>

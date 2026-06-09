<script setup>
import { computed, ref } from 'vue'
import { useContent } from '../composables/useContent'
import { useTracker } from '../composables/useTracker'
import ProjectCard from './ProjectCard.vue'
import ProjectDetailModal from './ProjectDetailModal.vue'

const props = defineProps({
  mode: { type: String, default: 'business' }
})
const { categories, projectsByCategory } = useContent()
const { track } = useTracker()
const selectedProject = ref(null)

const selectedCategory = computed(() => {
  if (!selectedProject.value) return null
  return categories.value.find(cat => cat.id === selectedProject.value.category)
})

const openProject = (project) => {
  selectedProject.value = project
  track('project_detail_open', project.title || project.id)
}
</script>

<template>
  <section id="projects" class="py-12 px-4 sm:px-6 md:py-18">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 md:mb-11 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-3" :style="{ color: 'var(--color-linear-text)' }">
          {{ mode === 'business' ? '可参考案例' : '貔貅囤的宝贝' }}
        </h2>
        <p class="text-sm sm:text-base" :style="{ color: 'var(--color-linear-text-secondary)' }">
          {{ mode === 'business' ? '用真实项目说明我能交付什么，不只停留在口头介绍' : '按领域归档 · 状态徽章一目了然' }}
        </p>
      </div>

      <div class="space-y-9 md:space-y-12">
        <div v-for="cat in categories" :key="cat.id" :id="'cat-' + cat.id">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
            <span class="text-2xl shrink-0">{{ cat.icon }}</span>
            <h3 class="text-xl md:text-2xl font-semibold" :style="{ color: 'var(--color-linear-text)' }">
              {{ cat.title }}
            </h3>
            <span class="basis-full sm:basis-auto text-sm" :style="{ color: 'var(--color-linear-text-tertiary)' }">
              · {{ cat.desc }}
            </span>
          </div>

          <div v-if="projectsByCategory(cat.id).length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <ProjectCard
              v-for="p in projectsByCategory(cat.id)"
              :key="p.id"
              :project="p"
              :accent="cat.accent"
              @open-detail="openProject"
            />
          </div>
          <div
            v-else
            class="p-6 md:p-8 rounded-lg text-center text-sm"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px dashed var(--color-linear-border)', color: 'var(--color-linear-text-tertiary)' }"
          >
            🐾 貔貅还没在这个区囤上货 · 已加入待办
          </div>
        </div>
      </div>
    </div>

    <ProjectDetailModal
      :project="selectedProject"
      :accent="selectedCategory?.accent"
      @close="selectedProject = null"
    />
  </section>
</template>

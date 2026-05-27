<script setup>
import { useContent } from '../composables/useContent'
import ProjectCard from './ProjectCard.vue'

const { categories, projectsByCategory } = useContent()
</script>

<template>
  <section id="projects" class="py-20 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="mb-12 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-3" :style="{ color: 'var(--color-linear-text)' }">
          貔貅囤的宝贝
        </h2>
        <p class="text-base" :style="{ color: 'var(--color-linear-text-secondary)' }">
          按领域归档 · 状态徽章一目了然
        </p>
      </div>

      <div class="space-y-14">
        <div v-for="cat in categories" :key="cat.id" :id="'cat-' + cat.id">
          <div class="flex items-center gap-3 mb-5">
            <span class="text-2xl">{{ cat.icon }}</span>
            <h3 class="text-xl md:text-2xl font-semibold" :style="{ color: 'var(--color-linear-text)' }">
              {{ cat.title }}
            </h3>
            <span class="text-sm" :style="{ color: 'var(--color-linear-text-tertiary)' }">
              · {{ cat.desc }}
            </span>
          </div>

          <div v-if="projectsByCategory(cat.id).length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProjectCard
              v-for="p in projectsByCategory(cat.id)"
              :key="p.id"
              :project="p"
              :accent="cat.accent"
            />
          </div>
          <div
            v-else
            class="p-8 rounded-2xl text-center text-sm"
            :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px dashed var(--color-linear-border)', color: 'var(--color-linear-text-tertiary)' }"
          >
            🐾 貔貅还没在这个区囤上货 · 已加入待办
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useContent } from '../composables/useContent'
import { useTracker } from '../composables/useTracker'
import { useInteractionSound } from '../composables/useInteractionSound'
import { withBase, withVersion } from '../composables/useAssetPath'
import ProjectDetailModal from './ProjectDetailModal.vue'

defineProps({ mode: { type: String, default: 'business' } })

const { categories, projectsByCategory } = useContent()
const { track } = useTracker()
const { enabled: soundEnabled, available: soundAvailable, toggle: toggleSound, play: playSound } = useInteractionSound()
const selectedProject = ref(null)
const workFilter = ref('project')
const focusedProjects = ref({})
const catalogRoot = ref(null)
const revealed = ref(new Set())
const observerActive = ref(false)
const groups = [
  { id: 'project', label: '项目' },
  { id: 'tool', label: '工具' },
  { id: 'method', label: '技能与模板' },
  { id: 'all', label: '全部' }
]
const typeLabels = { project: '项目', tool: '工具', method: '技能与模板' }
const statusLabels = { live: '可体验', wip: '进行中', idea: '构思中', paid: '可合作', case: '阶段成果', documented: '已沉淀' }
let reducedMotion = false
let observer = null

const selectedCategory = computed(() => categories.value.find((cat) => cat.id === selectedProject.value?.category))
const total = computed(() => categories.value.reduce((sum, cat) => sum + projectsByCategory(cat.id).length, 0))
const workCount = (type) => projectsByCategory('work').filter((item) => type === 'all' || (item.workType || 'project') === type).length
const listedProjects = (category) => {
  const list = projectsByCategory(category)
  return category === 'work' && workFilter.value !== 'all'
    ? list.filter((item) => (item.workType || 'project') === workFilter.value)
    : list
}
const activeProject = (category) => {
  const list = listedProjects(category)
  return list.find((item) => item.id === focusedProjects.value[category]) || list[0] || null
}
const focusProject = (category, project) => { focusedProjects.value[category] = project.id }
const projectLabel = (project) => project.sourceLabel || typeLabels[project.workType] || statusLabels[project.status] || '作品'
const primaryAction = (project) => {
  if (project?.archive) return { href: project.archive, label: project.workType === 'method' ? '下载方法说明' : '下载项目摘要', download: true }
  return project?.actions?.find((item) => item.href && !item.disabled) || (project?.links?.demo ? { href: project.links.demo, label: '打开作品' } : null)
}
const openProject = (project) => {
  selectedProject.value = project
  playSound('select')
  track('project_detail_open', project.id)
}
const selectGroup = (type) => {
  workFilter.value = type
  playSound('filter')
  const url = new URL(window.location.href)
  if (type === 'project') url.searchParams.delete('work')
  else url.searchParams.set('work', type)
  url.hash = 'cat-work'
  window.history.replaceState({}, '', url)
  track('work_group_select', type)
}
const movePreview = (event) => {
  if (reducedMotion || event.pointerType === 'touch') return
  const box = event.currentTarget.getBoundingClientRect()
  if (!box.width || !box.height) return
  const x = (event.clientX - box.left) / box.width
  const y = (event.clientY - box.top) / box.height
  event.currentTarget.style.setProperty('--preview-x', x * 100 + '%')
  event.currentTarget.style.setProperty('--preview-y', y * 100 + '%')
  event.currentTarget.style.setProperty('--tilt-x', (0.5 - y) * 3 + 'deg')
  event.currentTarget.style.setProperty('--tilt-y', (x - 0.5) * 3 + 'deg')
}
const resetPreview = (event) => {
  event.currentTarget.style.setProperty('--tilt-x', '0deg')
  event.currentTarget.style.setProperty('--tilt-y', '0deg')
}
const syncLegacyHash = () => {
  const legacy = { '#work-portfolio': 'project', '#work-methods': 'method', '#work-archives': 'all' }
  const type = legacy[window.location.hash]
  if (!type) return
  workFilter.value = type
  nextTick(() => {
    const target = document.getElementById('cat-work')
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 130, behavior: 'auto' })
  })
}

onMounted(() => {
  reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
  const initial = new URLSearchParams(window.location.search).get('work')
  if (groups.some((group) => group.id === initial)) workFilter.value = initial
  syncLegacyHash()
  window.addEventListener('hashchange', syncLegacyHash)
  if (!reducedMotion && 'IntersectionObserver' in window) {
    observerActive.value = true
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        revealed.value.add(entry.target.dataset.category)
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.08 })
    catalogRoot.value?.querySelectorAll('[data-category]').forEach((chapter) => observer.observe(chapter))
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('hashchange', syncLegacyHash)
})
</script>

<template>
  <section id="projects" ref="catalogRoot" class="catalog" aria-labelledby="catalog-title">
    <div class="catalog-intro">
      <div>
        <p class="catalog-kicker">作品目录 / {{ total }} 份探索</p>
        <h2 id="catalog-title">{{ mode === 'business' ? '从这里，看我做过什么。' : '貔貅囤的宝贝。' }}</h2>
        <p class="catalog-description">项目、工具和方法，各有自己的位置。选一项，慢慢展开。</p>
      </div>
      <button
        type="button"
        class="sound-switch"
        :class="{ 'is-on': soundEnabled }"
        :disabled="!soundAvailable"
        :aria-pressed="soundEnabled"
        :aria-label="soundEnabled ? '关闭交互音效' : '开启交互音效'"
        title="默认静音，开启后仅在点击时播放轻提示音"
        @click="toggleSound"
      >
        <svg viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M4 8v6M9 4v14M14 7v8M19 9v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        <span>音效{{ soundEnabled ? '开' : '关' }}</span>
      </button>
    </div>

    <nav class="catalog-navigation" aria-label="作品领域">
      <a v-for="(cat, index) in categories" :key="cat.id" :href="'#cat-' + cat.id">
        <span class="nav-index">0{{ index + 1 }}</span>{{ cat.title }}
        <span class="nav-count">{{ projectsByCategory(cat.id).length }}</span>
      </a>
    </nav>

    <section
      v-for="(cat, categoryIndex) in categories"
      :id="'cat-' + cat.id"
      :key="cat.id"
      class="catalog-chapter"
      :class="{ 'waiting-reveal': observerActive && !revealed.has(cat.id) }"
      :style="{ '--catalog-accent': cat.accent }"
      :data-category="cat.id"
      :aria-labelledby="'chapter-' + cat.id"
    >
      <template v-if="cat.id === 'work'">
        <span id="work-portfolio" class="legacy-anchor"></span>
        <span id="work-methods" class="legacy-anchor"></span>
        <span id="work-archives" class="legacy-anchor"></span>
      </template>
      <header class="chapter-heading">
        <div class="chapter-title">
          <span class="chapter-number">0{{ categoryIndex + 1 }}</span>
          <div><h3 :id="'chapter-' + cat.id">{{ cat.title }}</h3><p>{{ cat.desc }}</p></div>
        </div>
        <span class="chapter-count">{{ projectsByCategory(cat.id).length }} 份内容</span>
      </header>

      <div v-if="cat.id === 'work'" class="work-groups" role="group" aria-label="工作内容类型">
        <button v-for="group in groups" :key="group.id" type="button" :aria-pressed="workFilter === group.id" :class="{ active: workFilter === group.id }" @click="selectGroup(group.id)">
          {{ group.label }}<span>{{ workCount(group.id) }}</span>
        </button>
      </div>

      <div v-if="listedProjects(cat.id).length" class="showcase-layout">
        <div class="project-directory">
          <button
            v-for="(project, index) in listedProjects(cat.id)"
            :key="project.id"
            type="button"
            class="project-row"
            :class="{ 'is-active': activeProject(cat.id)?.id === project.id }"
            :style="{ '--row-index': index }"
            aria-haspopup="dialog"
            :aria-expanded="selectedProject?.id === project.id"
            @mouseenter="focusProject(cat.id, project)"
            @focus="focusProject(cat.id, project)"
            @click="openProject(project)"
          >
            <span class="row-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="row-copy">
              <span class="row-meta">{{ projectLabel(project) }}<span v-if="project.period"> · {{ project.period }}</span></span>
              <span class="row-title">{{ project.title }}</span>
              <span class="row-description">{{ project.shortDesc }}</span>
            </span>
            <span class="row-arrow" aria-hidden="true">↗</span>
          </button>
        </div>

        <aside class="preview-stage" aria-label="当前作品预览" @pointermove="movePreview" @pointerleave="resetPreview">
          <span class="preview-ambient" aria-hidden="true"></span>
          <Transition name="preview-switch" mode="out-in">
            <div v-if="activeProject(cat.id)" :key="activeProject(cat.id).id" class="preview-content">
              <div class="preview-meta"><span>{{ projectLabel(activeProject(cat.id)) }}</span><span>{{ statusLabels[activeProject(cat.id).status] || '查看详情' }}</span></div>
              <div v-if="activeProject(cat.id).cover" class="preview-image">
                <img :src="withVersion(activeProject(cat.id).cover)" :alt="activeProject(cat.id).title + '作品封面'" loading="lazy" />
              </div>
              <div v-else class="preview-type" aria-hidden="true">{{ cat.id === 'work' ? typeLabels[activeProject(cat.id).workType] || '作品' : cat.title }}</div>
              <h4>{{ activeProject(cat.id).title }}</h4>
              <p class="preview-description">{{ activeProject(cat.id).shortDesc }}</p>
              <ul v-if="activeProject(cat.id).highlights?.length" class="preview-evidence">
                <li v-for="item in activeProject(cat.id).highlights.slice(0, 2)" :key="item">{{ item }}</li>
              </ul>
              <div class="preview-actions">
                <button type="button" @click="openProject(activeProject(cat.id))">展开{{ activeProject(cat.id).workType === 'method' ? '方法' : '详情' }} <span aria-hidden="true">↗</span></button>
                <a v-if="primaryAction(activeProject(cat.id))" :href="withBase(primaryAction(activeProject(cat.id)).href)" :download="primaryAction(activeProject(cat.id)).download ? '' : undefined" :target="primaryAction(activeProject(cat.id)).download ? undefined : '_blank'" rel="noreferrer">{{ primaryAction(activeProject(cat.id)).label }}</a>
              </div>
            </div>
          </Transition>
        </aside>
      </div>
      <p v-else class="chapter-empty">这一页还在慢慢积累。</p>
    </section>

    <ProjectDetailModal :project="selectedProject" :accent="selectedCategory?.accent" @close="selectedProject = null" />
  </section>
</template>

<style scoped>
.catalog { max-width: 1200px; margin: 0 auto; padding: 70px 24px 50px; scroll-margin-top: 85px; }
.catalog-intro { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; margin-bottom: 38px; }
.catalog-kicker { margin: 0 0 14px; color: var(--color-linear-text-tertiary); font-size: 12px; letter-spacing: .12em; }
.catalog-intro h2 { margin: 0; font-size: clamp(30px, 4.4vw, 52px); line-height: 1.2; letter-spacing: -.05em; font-weight: 600; }
.catalog-description { margin: 18px 0 0; font-size: 15px; line-height: 1.8; color: var(--color-linear-text-secondary); }
.sound-switch { display: inline-flex; align-items: center; gap: 9px; min-height: 44px; padding: 7px 0 7px 12px; border: 0; background: none; color: var(--color-linear-text-tertiary); font-size: 12px; cursor: pointer; white-space: nowrap; }
.sound-switch svg { width: 22px; height: 22px; }
.sound-switch.is-on { color: var(--color-linear-text); }
.sound-switch:disabled { opacity: .45; cursor: default; }
.catalog-navigation { position: sticky; top: 62px; z-index: 15; display: flex; gap: 32px; padding: 13px 0; border-top: 1px solid var(--color-linear-border); border-bottom: 1px solid var(--color-linear-border); background: color-mix(in srgb, var(--color-linear-bg) 93%, transparent); backdrop-filter: blur(15px); overflow-x: auto; scrollbar-width: none; }
.catalog-navigation::-webkit-scrollbar { display: none; }
.catalog-navigation a { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; color: var(--color-linear-text); font-size: 14px; font-weight: 550; white-space: nowrap; text-decoration: none; }
.nav-index, .nav-count { font-size: 10px; color: var(--color-linear-text-tertiary); font-variant-numeric: tabular-nums; }
.nav-index { margin-right: 4px; }
.catalog-navigation a:hover .nav-index { color: var(--color-linear-purple); }
.catalog-chapter { position: relative; padding-top: 60px; padding-bottom: 42px; scroll-margin-top: 140px; transition: opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
.catalog-chapter.waiting-reveal { opacity: 0; transform: translateY(22px); }
.catalog-chapter + .catalog-chapter { border-top: 1px solid var(--color-linear-border); }
.legacy-anchor { position: absolute; top: 0; scroll-margin-top: 140px; }
.chapter-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 22px; }
.chapter-title { display: flex; align-items: flex-start; gap: 18px; }
.chapter-number { padding-top: 8px; color: var(--catalog-accent); font-size: 12px; font-variant-numeric: tabular-nums; }
.chapter-title h3 { font-size: clamp(25px, 3vw, 36px); line-height: 1.25; font-weight: 600; letter-spacing: -.035em; margin: 0; }
.chapter-title p { color: var(--color-linear-text-secondary); font-size: 13px; line-height: 1.8; margin: 9px 0 0; }
.chapter-count { color: var(--color-linear-text-tertiary); font-size: 11px; white-space: nowrap; padding-bottom: 3px; }
.work-groups { display: flex; flex-wrap: wrap; gap: 26px; margin: 0 0 13px 32px; }
.work-groups button { position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 5px 0 10px; border: 0; background: none; color: var(--color-linear-text-tertiary); font-size: 13px; cursor: pointer; }
.work-groups button::after { content: ''; position: absolute; left: 0; bottom: 2px; width: 100%; height: 1px; background: var(--color-linear-text); transform: scaleX(0); transform-origin: left; transition: transform .25s ease; }
.work-groups button.active { color: var(--color-linear-text); }
.work-groups button.active::after { transform: scaleX(1); }
.work-groups button span { font-size: 10px; font-variant-numeric: tabular-nums; opacity: .65; }
.showcase-layout { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 56px; align-items: start; }
.project-directory { min-width: 0; }
.project-row { width: 100%; display: grid; grid-template-columns: 22px minmax(0, 1fr) 20px; gap: 14px; align-items: start; padding: 25px 0; border: 0; border-bottom: 1px solid var(--color-linear-border); border-radius: 0; background: transparent; text-align: left; color: var(--color-linear-text); cursor: pointer; animation: row-arrive .55s both; animation-delay: calc(var(--row-index) * 45ms); }
.row-number { padding-top: 23px; color: var(--color-linear-text-tertiary); font-size: 10px; font-variant-numeric: tabular-nums; transition: color .2s ease; }
.row-copy { display: flex; flex-direction: column; min-width: 0; }
.row-meta { color: var(--color-linear-text-tertiary); font-size: 10px; line-height: 1.8; margin-bottom: 7px; }
.row-title { font-size: clamp(17px, 1.9vw, 22px); line-height: 1.45; letter-spacing: -.025em; font-weight: 550; transform-origin: left; transition: transform .25s cubic-bezier(.2,.8,.2,1), color .25s ease; }
.row-description { margin-top: 10px; color: var(--color-linear-text-secondary); font-size: 13px; line-height: 1.9; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.row-arrow { color: var(--color-linear-text-tertiary); font-size: 21px; padding-top: 20px; opacity: .4; transform: translate(-3px, 3px); transition: transform .25s ease, opacity .25s ease; }
.project-row.is-active .row-number { color: var(--catalog-accent); }
.project-row.is-active .row-title { transform: translateX(5px); }
.project-row.is-active .row-arrow { opacity: 1; transform: translate(0, 0); color: var(--catalog-accent); }
.project-row:hover, .project-row:focus-visible { background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--catalog-accent) 4%, transparent)); }
.preview-stage { position: sticky; top: 155px; min-width: 0; padding: 22px 0 20px 30px; border-left: 1px solid var(--color-linear-border); isolation: isolate; perspective: 1200px; }
.preview-ambient { position: absolute; inset: -8% -10%; z-index: -1; opacity: .65; background: radial-gradient(ellipse at var(--preview-x, 55%) var(--preview-y, 40%), color-mix(in srgb, var(--catalog-accent) 10%, transparent), transparent 63%); pointer-events: none; }
.preview-content { transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)); transform-origin: center; transition: transform .5s cubic-bezier(.2,.8,.2,1); }
.preview-meta { display: flex; justify-content: space-between; gap: 12px; color: var(--color-linear-text-tertiary); font-size: 10px; letter-spacing: .05em; }
.preview-image { display: flex; align-items: center; justify-content: center; height: 200px; margin: 20px 0; overflow: hidden; }
.preview-image img { width: 100%; height: 100%; object-fit: contain; transition: transform .7s cubic-bezier(.2,.8,.2,1); }
.preview-stage:hover .preview-image img { transform: scale(1.035); }
.preview-type { margin: 24px 0 14px; font-size: clamp(50px, 7vw, 86px); font-weight: 650; line-height: 1.2; letter-spacing: -.08em; color: transparent; -webkit-text-stroke: 1px color-mix(in srgb, var(--catalog-accent) 40%, var(--color-linear-border)); user-select: none; }
.preview-content h4 { margin: 15px 0 12px; font-size: clamp(24px, 2.8vw, 32px); line-height: 1.4; letter-spacing: -.04em; font-weight: 550; text-wrap: pretty; }
.preview-description { color: var(--color-linear-text-secondary); font-size: 14px; line-height: 1.95; margin: 0; }
.preview-evidence { margin: 22px 0 0; padding: 0 0 0 13px; list-style: disc; color: var(--color-linear-text-secondary); font-size: 11px; line-height: 1.9; }
.preview-evidence li + li { margin-top: 9px; }
.preview-actions { display: flex; flex-wrap: wrap; gap: 20px; align-items: center; margin-top: 24px; }
.preview-actions button, .preview-actions a { display: inline-flex; align-items: center; gap: 16px; min-height: 44px; border: 0; border-bottom: 1px solid var(--color-linear-text); border-radius: 0; background: none; padding: 5px 0; color: var(--color-linear-text); font-size: 12px; text-decoration: none; cursor: pointer; }
.preview-actions a { border-bottom-color: var(--color-linear-border); color: var(--color-linear-text-secondary); }
.chapter-empty { margin: 20px 0; color: var(--color-linear-text-tertiary); font-size: 14px; line-height: 2; }
.preview-switch-enter-active, .preview-switch-leave-active { transition: opacity .2s ease, translate .25s cubic-bezier(.2,.8,.2,1); }
.preview-switch-enter-from { opacity: 0; translate: 0 12px; }
.preview-switch-leave-to { opacity: 0; translate: 0 -8px; }
@keyframes row-arrive { from { opacity: 0; translate: 0 10px; } to { opacity: 1; translate: 0 0; } }
@media (max-width: 900px) {
  .showcase-layout { gap: 30px; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); }
  .preview-stage { padding-left: 22px; }
  .preview-evidence { display: none; }
  .preview-image { height: 160px; }
}
@media (max-width: 680px) {
  .catalog { padding: 45px 18px 25px; }
  .catalog-intro { align-items: start; gap: 15px; margin-bottom: 26px; }
  .catalog-intro h2 { font-size: 30px; }
  .catalog-kicker { font-size: 10px; }
  .catalog-description { font-size: 13px; }
  .sound-switch { padding: 2px 0; gap: 6px; }
  .sound-switch svg { width: 18px; }
  .catalog-navigation { top: 58px; gap: 25px; }
  .catalog-navigation a { font-size: 13px; gap: 6px; }
  .nav-index { display: none; }
  .catalog-chapter { padding-top: 38px; padding-bottom: 32px; scroll-margin-top: 130px; }
  .chapter-title { gap: 12px; }
  .chapter-number { padding-top: 5px; }
  .chapter-title h3 { font-size: 28px; }
  .chapter-count { font-size: 10px; }
  .work-groups { margin-left: 25px; gap: 23px; }
  .work-groups button { font-size: 12px; }
  .showcase-layout { display: block; }
  .preview-stage { display: none; }
  .project-row { gap: 10px; grid-template-columns: 15px minmax(0, 1fr) 18px; padding: 21px 0; }
  .row-title { font-size: 19px; }
  .row-description { font-size: 12px; }
  .row-meta { font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .catalog-chapter.waiting-reveal { opacity: 1; transform: none; }
  .catalog-chapter, .project-row, .row-title, .row-arrow, .preview-content, .preview-image img, .preview-switch-enter-active, .preview-switch-leave-active, .work-groups button::after { animation: none; transition: none; }
  .project-row.is-active .row-title, .preview-content, .preview-stage:hover .preview-image img { transform: none; }
  .preview-switch-enter-from, .preview-switch-leave-to { translate: none; }
}
</style>

<script setup>
import { computed } from 'vue'
import { useContent } from '../composables/useContent'
import { withVersion } from '../composables/useAssetPath'

const props = defineProps({ mode: { type: String, default: 'business' }, modeLabel: { type: String, default: '合作服务' } })
defineEmits(['open-contact', 'scroll-to-projects', 'scroll-to-services', 'set-mode'])
const { projects, categories } = useContent()
const visible = computed(() => projects.value.filter((item) => !item.hidden))
const heroCopy = computed(() => props.mode === 'demo' ? {
  badge: '皮玺玉 / 产品与 AI 实践',
  lines: ['我是皮玺玉。', '这是我的作品目录。'],
  slogan: '从智能耳机 APP，到业务规划、工具和工作流。',
  intro: '工作、学习、内容和生活，都在下面慢慢展开。',
  primary: '看看我做过什么', secondary: '',
  metrics: [
    { value: String(visible.value.length), label: '作品条目' },
    { value: String(categories.value.length), label: '探索领域' },
    { value: String(visible.value.filter((item) => item.workType === 'method').length), label: '工作方法' }
  ]
} : {
  badge: '合作服务 / 远程交付',
  lines: ['工具、工作流，', '还有清晰的产品方案。'],
  slogan: '从具体问题出发，一起把事情往前推进。',
  intro: 'AI 工作流定制、HTML / Excel 小工具、PRD 与求职材料。可以先从一件小事开始。',
  primary: '查看合作方式', secondary: '看看作品集',
  metrics: [{ value: '99+', label: '小单起价' }, { value: '24h', label: '快单反馈' }, { value: '远程', label: '在线交付' }]
})
const moveArt = (event) => {
  if (event.pointerType === 'touch' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const box = event.currentTarget.getBoundingClientRect()
  if (!box.width || !box.height) return
  event.currentTarget.style.setProperty('--art-x', ((event.clientX - box.left) / box.width - 0.5) * 18 + 'px')
  event.currentTarget.style.setProperty('--art-y', ((event.clientY - box.top) / box.height - 0.5) * 14 + 'px')
}
const resetArt = (event) => {
  event.currentTarget.style.setProperty('--art-x', '0px')
  event.currentTarget.style.setProperty('--art-y', '0px')
}
</script>

<template>
  <section class="intro-hero">
    <div class="hero-layout">
      <div class="hero-copy">
        <p class="hero-eyebrow">{{ heroCopy.badge }}</p>
        <h1><span v-for="line in heroCopy.lines" :key="line">{{ line }}</span></h1>
        <p class="hero-slogan">{{ heroCopy.slogan }}</p>
        <p class="hero-intro">{{ heroCopy.intro }}</p>
        <div class="hero-actions">
          <button type="button" class="hero-primary" @click="mode === 'business' ? $emit('scroll-to-services') : $emit('scroll-to-projects')">{{ heroCopy.primary }} <span aria-hidden="true">↗</span></button>
          <button v-if="heroCopy.secondary" type="button" class="hero-secondary" @click="$emit('set-mode', mode === 'business' ? 'demo' : 'business')">{{ heroCopy.secondary }} <span aria-hidden="true">→</span></button>
        </div>
        <dl class="hero-facts">
          <div v-for="metric in heroCopy.metrics" :key="metric.label"><dd>{{ metric.value }}</dd><dt>{{ metric.label }}</dt></div>
        </dl>
      </div>
      <figure class="hero-art" @pointermove="moveArt" @pointerleave="resetArt">
        <span class="orbit orbit-one" aria-hidden="true"></span>
        <span class="orbit orbit-two" aria-hidden="true"></span>
        <div class="mascot-parallax"><img :src="withVersion('/mascot/pixiu-hero.png')" alt="我的 AI 貔貅" class="hero-mascot" draggable="false" /></div>
        <figcaption><span>AI 貔貅</span><span>陪我囤一点有意思的东西</span></figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.intro-hero { max-width: 1200px; margin: 0 auto; padding: 80px 24px 36px; overflow: hidden; }
.hero-layout { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, .8fr); gap: 36px; align-items: center; }
.hero-eyebrow { margin: 0 0 25px; font-size: 12px; letter-spacing: .12em; color: var(--color-linear-text-secondary); }
.hero-copy h1 { margin: 0; font-size: clamp(34px, 4.65vw, 61px); line-height: 1.3; font-weight: 600; letter-spacing: -.055em; }
.hero-copy h1 span { display: block; }
.hero-slogan { margin: 27px 0 0; font-size: clamp(14px, 1.5vw, 18px); line-height: 1.8; color: var(--color-linear-text-secondary); }
.hero-intro { margin: 9px 0 0; color: var(--color-linear-text-tertiary); font-size: 13px; line-height: 1.9; max-width: 480px; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 22px; margin: 30px 0 0; }
.hero-primary { display: inline-flex; align-items: center; justify-content: space-between; gap: 32px; min-height: 48px; padding: 13px 20px; background: var(--color-linear-text); color: var(--color-linear-bg); border: 1px solid var(--color-linear-text); border-radius: 3px; font-size: 13px; transition: translate .25s ease; }
.hero-primary:hover { translate: 0 -3px; }
.hero-primary span { font-size: 19px; }
.hero-secondary { display: inline-flex; gap: 14px; align-items: center; min-height: 44px; border: 0; border-bottom: 1px solid var(--color-linear-border); border-radius: 0; padding: 5px 0; background: none; color: var(--color-linear-text-secondary); font-size: 12px; }
.hero-facts { display: flex; gap: 30px; margin: 38px 0 0; }
.hero-facts div + div { border-left: 1px solid var(--color-linear-border); padding-left: 30px; }
.hero-facts dd { margin: 0; font-size: 22px; line-height: 1.3; font-weight: 500; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.hero-facts dt { margin-top: 7px; font-size: 10px; color: var(--color-linear-text-tertiary); }
.hero-art { position: relative; min-width: 0; margin: 0; height: 400px; display: flex; align-items: center; justify-content: center; }
.mascot-parallax { width: 90%; max-width: 340px; transform: translate3d(var(--art-x, 0px), var(--art-y, 0px), 0); transition: transform .6s cubic-bezier(.2,.8,.2,1); }
.hero-mascot { width: 100%; object-fit: contain; user-select: none; animation: mascot-drift 7s ease-in-out infinite; }
.orbit { position: absolute; width: 95%; aspect-ratio: 1; border: 1px solid var(--color-linear-border); border-radius: 50%; pointer-events: none; }
.orbit-one { animation: orbit-turn 40s linear infinite; }
.orbit-two { width: 78%; opacity: .5; animation: orbit-turn 30s linear reverse infinite; }
.hero-art figcaption { position: absolute; bottom: 0; left: 15px; right: 0; display: flex; justify-content: space-between; gap: 15px; color: var(--color-linear-text-tertiary); font-size: 10px; line-height: 1.8; }
@keyframes mascot-drift { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
@keyframes orbit-turn { from { transform: rotate(-18deg) scaleY(.66); } to { transform: rotate(342deg) scaleY(.66); } }
@media (max-width: 800px) {
  .intro-hero { padding-top: 45px; }
  .hero-layout { gap: 10px; }
  .hero-art { height: 330px; }
  .hero-art figcaption { left: 0; flex-direction: column; gap: 0; }
  .hero-facts { gap: 22px; }
  .hero-facts div + div { padding-left: 22px; }
}
@media (max-width: 600px) {
  .intro-hero { padding: 36px 18px 10px; }
  .hero-layout { grid-template-columns: minmax(0, 1fr); }
  .hero-eyebrow { font-size: 10px; margin-bottom: 20px; }
  .hero-copy h1 { font-size: clamp(32px, 7.4vw, 44px); }
  .hero-slogan { margin-top: 22px; font-size: 14px; }
  .hero-actions { margin-top: 24px; }
  .hero-facts { margin-top: 28px; }
  .hero-art { height: 255px; max-width: 310px; width: 100%; margin: 18px auto 0; }
  .mascot-parallax { max-width: 230px; }
  .hero-art figcaption { flex-direction: row; bottom: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-mascot, .orbit { animation: none; }
  .mascot-parallax { transform: none; transition: none; }
  .orbit { transform: rotate(-18deg) scaleY(.66); }
  .hero-primary { transition: none; }
  .hero-primary:hover { translate: none; }
}
</style>

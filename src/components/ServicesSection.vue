<script setup>
import { computed } from 'vue'
import { useContent } from '../composables/useContent'

const { services } = useContent()
const props = defineProps({
  mode: { type: String, default: 'business' }
})
defineEmits(['open-contact', 'scroll-to-projects'])

const packages = [
  {
    id: 'resume',
    title: '简历 / JD 优化',
    price: '99 元起',
    subtitle: '适合求职、转岗、面试前冲刺',
    desc: '围绕目标岗位改简历表达、项目讲法和面试自我介绍，让材料更贴近岗位要求。',
    delivery: ['1 版简历修改建议', 'JD 匹配亮点', '面试讲稿要点'],
    cycle: '24-48 小时'
  },
  {
    id: 'prd',
    title: 'PRD / 项目方案',
    price: '199 元起',
    subtitle: '适合有想法但说不清需求的人',
    desc: '把一个产品想法整理成目标用户、场景、功能范围、页面结构和交付计划。',
    delivery: ['PRD 文档', 'MVP 范围', '风险和验收标准'],
    cycle: '1-3 天'
  },
  {
    id: 'workflow',
    title: 'AI 工作流定制',
    price: '299 元起',
    subtitle: '适合重复写文档、整理资料、做表的人',
    desc: '把你的重复工作拆成可复用流程，沉淀成提示词、SOP、表格模板或本地工具。',
    delivery: ['流程拆解', '可复用提示词', '操作 SOP'],
    cycle: '2-4 天'
  },
  {
    id: 'tool',
    title: 'HTML / Excel 小工具',
    price: '399 元起',
    subtitle: '适合需要演示、看板、自动分析的人',
    desc: '做一个可打开、可演示、可交付的小页面或表格分析工具，优先解决一个明确问题。',
    delivery: ['单页工具或看板', '演示数据', '使用说明'],
    cycle: '3-7 天'
  }
]

const serviceGridClass = computed(() => {
  if (props.mode === 'business') return 'md:grid-cols-2 xl:grid-cols-4'
  if (services.value.length === 1) return 'md:grid-cols-1'
  if (services.value.length === 2) return 'md:grid-cols-2'
  return 'md:grid-cols-3'
})

const typeStyle = {
  free: { gradient: 'linear-gradient(135deg, #34D399 0%, #60A5FA 100%)', icon: '🎁' },
  paid: { gradient: 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)', icon: '✨' },
  private: { gradient: 'linear-gradient(135deg, #FB923C 0%, #F472B6 100%)', icon: '💬' }
}

const handleClick = (action, emit) => {
  if (action === 'open-contact') emit('open-contact')
  else if (action === 'scroll-to-projects') emit('scroll-to-projects')
}
</script>

<template>
  <section id="services" class="py-12 px-4 sm:px-6 md:py-18 relative">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 md:mb-11 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-3" :style="{ color: 'var(--color-linear-text)' }">
          {{ mode === 'business' ? '可接单服务' : '找貔貅帮忙' }}
        </h2>
        <p class="text-sm sm:text-base" :style="{ color: 'var(--color-linear-text-secondary)' }">
          {{ mode === 'business' ? '先从小单开始，价格按复杂度确认' : '挑顺手的入口 · 都欢迎' }}
        </p>
      </div>

      <div v-if="mode === 'business'" class="grid gap-4 md:gap-5" :class="serviceGridClass">
        <article
          v-for="item in packages"
          :key="item.id"
          class="service-package p-5 sm:p-6 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        >
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <h4 class="text-lg font-semibold mb-1" :style="{ color: 'var(--color-linear-text)' }">
                {{ item.title }}
              </h4>
              <p class="text-xs leading-relaxed" :style="{ color: 'var(--color-linear-text-tertiary)' }">
                {{ item.subtitle }}
              </p>
            </div>
            <strong class="shrink-0 text-base" style="color: #14B8A6;">{{ item.price }}</strong>
          </div>

          <p class="text-sm leading-relaxed mb-4 flex-1" :style="{ color: 'var(--color-linear-text-secondary)' }">
            {{ item.desc }}
          </p>

          <ul class="space-y-2 mb-5">
            <li
              v-for="point in item.delivery"
              :key="point"
              class="flex gap-2 text-xs leading-relaxed"
              :style="{ color: 'var(--color-linear-text-secondary)' }"
            >
              <span class="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style="background: #14B8A6;"></span>
              <span>{{ point }}</span>
            </li>
          </ul>

          <div class="mb-4 text-xs" :style="{ color: 'var(--color-linear-text-tertiary)' }">
            预计周期：{{ item.cycle }}
          </div>

          <button
            @click="$emit('open-contact')"
            class="w-full py-3 md:py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5"
            style="background: linear-gradient(135deg, #14B8A6 0%, #60A5FA 100%);"
          >
            咨询这个套餐 →
          </button>
        </article>
      </div>

      <div v-else class="grid gap-4 md:gap-5" :class="serviceGridClass">
        <div
          v-for="s in services"
          :key="s.id"
          class="p-5 sm:p-6 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
          :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
        >
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-4"
            :style="{ background: typeStyle[s.type].gradient }"
          >
            {{ typeStyle[s.type].icon }}
          </div>

          <h4 class="text-lg font-semibold mb-1" :style="{ color: 'var(--color-linear-text)' }">
            {{ s.title }}
          </h4>
          <p class="text-xs mb-3" :style="{ color: 'var(--color-linear-text-tertiary)' }">
            {{ s.subtitle }}
          </p>
          <p class="text-sm leading-relaxed mb-5 flex-1" :style="{ color: 'var(--color-linear-text-secondary)' }">
            {{ s.desc }}
          </p>

          <button
            @click="handleClick(s.ctaAction, $emit)"
            class="w-full py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
            :style="{ background: typeStyle[s.type].gradient, color: 'white' }"
          >
            {{ s.ctaText }} →
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineEmits(['open-contact', 'scroll-to-projects'])

const demoFormats = [
  {
    title: '15 秒结果预览',
    desc: '先展示输入资料，再展示页面自动生成的分析、看板或文档结果。',
    bestFor: '适合放在商业版首屏下方，快速证明不是静态截图。'
  },
  {
    title: '30 秒操作录屏',
    desc: '按“上传/输入 - 点击生成 - 查看结果 - 导出交付”的顺序录一遍。',
    bestFor: '适合发小红书、闲鱼和私聊客户，降低解释成本。'
  },
  {
    title: '60 秒案例讲解',
    desc: '补一句业务背景、解决的问题、交付物和适合人群。',
    bestFor: '适合面试、客户沟通和作品集详情页。'
  }
]
</script>

<template>
  <section id="proof" class="py-12 px-4 sm:px-6 md:py-18">
    <div class="max-w-6xl mx-auto">
      <div
        class="rounded-lg p-5 sm:p-6 md:p-8"
        :style="{ background: 'var(--color-linear-bg-secondary)', border: '1px solid var(--color-linear-border)' }"
      >
        <div class="grid lg:grid-cols-[0.8fr_1.2fr] gap-6 md:gap-8 items-start">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style="color: #14B8A6;">
              Demo Proof
            </p>
            <h2 class="text-2xl md:text-3xl font-bold mb-3" :style="{ color: 'var(--color-linear-text)' }">
              案例需要做成“看得见变化”的操作演示
            </h2>
            <p class="text-sm sm:text-base leading-relaxed mb-5" :style="{ color: 'var(--color-linear-text-secondary)' }">
              现在的案例说明已经能讲清能力，但接单页面还需要动态证据。优先做轻量录屏或动图：让客户看到资料输入后，页面、表格或文档真的发生变化。
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                class="px-5 py-3 rounded-lg text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                style="background: linear-gradient(135deg, #14B8A6 0%, #60A5FA 100%);"
                @click="$emit('scroll-to-projects')"
              >
                查看可录屏案例
              </button>
              <button
                type="button"
                class="px-5 py-3 rounded-lg text-sm font-medium transition-transform hover:-translate-y-0.5"
                :style="{ background: 'var(--color-linear-bg-tertiary)', border: '1px solid var(--color-linear-border)', color: 'var(--color-linear-text)' }"
                @click="$emit('open-contact')"
              >
                咨询交付范围
              </button>
            </div>
          </div>

          <div class="grid sm:grid-cols-3 gap-3">
            <article
              v-for="item in demoFormats"
              :key="item.title"
              class="rounded-lg p-4"
              :style="{ background: 'var(--color-linear-bg-tertiary)' }"
            >
              <h3 class="text-sm font-semibold mb-2" :style="{ color: 'var(--color-linear-text)' }">
                {{ item.title }}
              </h3>
              <p class="text-xs leading-relaxed mb-3" :style="{ color: 'var(--color-linear-text-secondary)' }">
                {{ item.desc }}
              </p>
              <p class="text-[11px] leading-relaxed" :style="{ color: 'var(--color-linear-text-tertiary)' }">
                {{ item.bestFor }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

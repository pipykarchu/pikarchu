<script setup>
const props = defineProps({
  status: { type: String, default: 'wip' }
})

const config = {
  live: { label: 'Live', dotClass: 'bg-emerald-400', textClass: 'text-emerald-500', borderClass: 'border-emerald-400/30 bg-emerald-400/10' },
  wip: { label: 'WIP', dotClass: 'bg-purple-400', textClass: 'text-purple-500', borderClass: 'border-purple-400/30 bg-purple-400/10' },
  idea: { label: 'Idea', dotClass: 'bg-zinc-400', textClass: 'text-zinc-500', borderClass: 'border-zinc-400/30 bg-zinc-400/10' },
  paid: { label: 'Paid', dotClass: 'bg-pink-400', textClass: 'text-pink-500', borderClass: 'border-pink-400/30 bg-pink-400/10' }
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border"
    :class="config[props.status]?.borderClass + ' ' + config[props.status]?.textClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="config[props.status]?.dotClass"></span>
    {{ config[props.status]?.label }}
  </span>
</template>

import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useInteractionSound() {
  const enabled = ref(false)
  const available = ref(false)
  let context = null
  let lastPlayedAt = 0

  onMounted(() => {
    available.value = Boolean(window.AudioContext || window.webkitAudioContext)
  })

  const play = async (kind = 'select') => {
    if (!enabled.value || !available.value) return
    const now = Date.now()
    if (now - lastPlayedAt < 90) return
    lastPlayedAt = now
    try {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext
        context = new Audio()
      }
      if (context.state === 'suspended') await context.resume()
      if (!enabled.value || context.state !== 'running') return
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const time = context.currentTime
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(kind === 'filter' ? 440 : 660, time)
      oscillator.frequency.exponentialRampToValueAtTime(kind === 'filter' ? 660 : 880, time + 0.075)
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(0.018, time + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
      oscillator.start(time)
      oscillator.stop(time + 0.14)
    } catch {
      enabled.value = false
    }
  }

  const toggle = () => {
    if (!available.value) return
    enabled.value = !enabled.value
    if (enabled.value) play('filter')
  }

  onBeforeUnmount(() => {
    if (context && context.state !== 'closed') context.close().catch(() => {})
  })

  return { enabled, available, toggle, play }
}

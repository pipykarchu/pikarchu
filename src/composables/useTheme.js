import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'pixiyu-theme'
const theme = ref('light')

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return 'light'
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
}

let initialized = false

export function useTheme() {
  if (!initialized && typeof window !== 'undefined') {
    theme.value = getInitialTheme()
    applyTheme(theme.value)
    initialized = true

    watchEffect(() => {
      applyTheme(theme.value)
      localStorage.setItem(STORAGE_KEY, theme.value)
    })
  }

  const toggle = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggle }
}

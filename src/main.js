import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
requestAnimationFrame(() => {
  document.documentElement.classList.remove('theme-preload')
})

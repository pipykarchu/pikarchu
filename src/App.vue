<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import CategorySection from './components/CategorySection.vue'
import ServicesSection from './components/ServicesSection.vue'
import OperationDemoSection from './components/OperationDemoSection.vue'
import AppFooter from './components/AppFooter.vue'
import ContactModal from './components/ContactModal.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import ChatWidget from './components/ChatWidget.vue'
import { useTracker } from './composables/useTracker'

const APP_VERSION = '0.1.0'
const contactOpen = ref(false)
const isAdminRoute = window.location.pathname.startsWith('/admin')
const { track } = useTracker()
const allowedModes = new Set(['business', 'demo'])
const initialMode = new URLSearchParams(window.location.search).get('mode')
const siteMode = ref(allowedModes.has(initialMode) ? initialMode : 'demo')
const modeLabel = computed(() => siteMode.value === 'demo' ? '演示版' : '商业版')

const setSiteMode = (mode) => {
  if (!allowedModes.has(mode) || siteMode.value === mode) return

  siteMode.value = mode
  const url = new URL(window.location.href)
  if (mode === 'demo') url.searchParams.delete('mode')
  else url.searchParams.set('mode', mode)
  window.history.replaceState({}, '', url)
  track('mode_switch', mode)
}

const handleOpenContact = () => {
  track('contact_open', 'contact_modal')
  contactOpen.value = true
}

const handleScrollToProjects = () => {
  track('button_click', 'scroll_to_projects')
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const handleScrollToServices = () => {
  track('button_click', 'scroll_to_services')
  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  track('page_view', `site_home_${siteMode.value}`)
})
</script>

<template>
  <AdminDashboard v-if="isAdminRoute" />
  <div v-else id="top">
    <AppHeader
      :mode="siteMode"
      @set-mode="setSiteMode"
      @open-contact="handleOpenContact"
    />
    <main>
      <HeroSection
        :mode="siteMode"
        :mode-label="modeLabel"
        @set-mode="setSiteMode"
        @open-contact="handleOpenContact"
        @scroll-to-projects="handleScrollToProjects"
        @scroll-to-services="handleScrollToServices"
      />
      <template v-if="siteMode === 'business'">
        <ServicesSection
          :mode="siteMode"
          @open-contact="handleOpenContact"
          @scroll-to-projects="handleScrollToProjects"
        />
        <OperationDemoSection
          @open-contact="handleOpenContact"
          @scroll-to-projects="handleScrollToProjects"
        />
        <CategorySection :mode="siteMode" />
      </template>
      <template v-else>
        <CategorySection :mode="siteMode" />
        <ServicesSection
          :mode="siteMode"
          @open-contact="handleOpenContact"
          @scroll-to-projects="handleScrollToProjects"
        />
      </template>
    </main>
    <AppFooter />
    <ContactModal v-model="contactOpen" />
    <ChatWidget @open-contact="handleOpenContact" />
  </div>
</template>

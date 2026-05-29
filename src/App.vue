<script setup>
import { onMounted, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import CategorySection from './components/CategorySection.vue'
import ServicesSection from './components/ServicesSection.vue'
import AppFooter from './components/AppFooter.vue'
import ContactModal from './components/ContactModal.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import { useTracker } from './composables/useTracker'

const APP_VERSION = '0.1.0'
const contactOpen = ref(false)
const isAdminRoute = window.location.pathname.startsWith('/admin')
const { track } = useTracker()

const handleOpenContact = () => {
  track('contact_open', 'contact_modal')
  contactOpen.value = true
}
const handleScrollToProjects = () => {
  track('button_click', 'scroll_to_projects')
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  track('page_view', 'site_home')
})
</script>

<template>
  <AdminDashboard v-if="isAdminRoute" />
  <div v-else id="top">
    <AppHeader @open-contact="handleOpenContact" />
    <main>
      <HeroSection
        @open-contact="handleOpenContact"
        @scroll-to-projects="handleScrollToProjects"
      />
      <CategorySection />
      <ServicesSection
        @open-contact="handleOpenContact"
        @scroll-to-projects="handleScrollToProjects"
      />
    </main>
    <AppFooter />
    <ContactModal v-model="contactOpen" />

    <button
      @click="handleOpenContact"
      class="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30 w-20 h-20 md:w-24 md:h-24 transition-all duration-300 hover:-translate-y-1 hover:scale-105 flex items-center justify-center bg-transparent border-0 p-0"
      title="加皮玺玉"
    >
      <img
        src="/mascot/pixiu-hero.png?v=0.1.0"
        alt="貔貅"
        class="w-full h-full object-contain drop-shadow-[0_14px_24px_rgba(167,139,250,0.32)]"
        draggable="false"
      />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import CategorySection from './components/CategorySection.vue'
import ServicesSection from './components/ServicesSection.vue'
import AppFooter from './components/AppFooter.vue'
import ContactModal from './components/ContactModal.vue'

const APP_VERSION = '0.1.0'
const contactOpen = ref(false)

const handleOpenContact = () => { contactOpen.value = true }
const handleScrollToProjects = () => {
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div id="top">
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
      class="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
      style="background: linear-gradient(135deg, #A78BFA 0%, #F472B6 100%); box-shadow: 0 12px 32px rgba(167,139,250,0.4);"
      title="加皮玺玉"
    >
      <span class="text-2xl">🐉</span>
    </button>
  </div>
</template>

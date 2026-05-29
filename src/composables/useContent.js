import { ref } from 'vue'
import profile from '../../content/profile.json'
import categories from '../../content/categories.json'
import projects from '../../content/projects.json'
import services from '../../content/services.json'

export function useContent() {
  const profileRef = ref(profile)
  const categoriesRef = ref([...categories].sort((a, b) => a.order - b.order))
  const projectsRef = ref([...projects].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)))
  const servicesRef = ref(services)

  const loadContent = async () => {
    try {
      const response = await fetch('/api/content')
      if (!response.ok) return

      const data = await response.json()
      profileRef.value = data.profile ?? profileRef.value
      categoriesRef.value = data.categories
        ? [...data.categories].sort((a, b) => a.order - b.order)
        : categoriesRef.value
      projectsRef.value = data.projects
        ? [...data.projects].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
        : projectsRef.value
      servicesRef.value = data.services ?? servicesRef.value
    } catch {
      // Keep static JSON as the fallback when the API is not running.
    }
  }

  loadContent()

  const projectsByCategory = (categoryId) => {
    return projectsRef.value.filter(p => p.category === categoryId)
  }

  return {
    profile: profileRef,
    categories: categoriesRef,
    projects: projectsRef,
    services: servicesRef,
    projectsByCategory
  }
}

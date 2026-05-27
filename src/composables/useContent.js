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

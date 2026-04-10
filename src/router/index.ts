import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/lesson/:id',
      component: () => import('../views/LessonView.vue'),
    },
    {
      path: '/review',
      component: () => import('../views/ReviewView.vue'),
    },
    {
      path: '/settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

export default router

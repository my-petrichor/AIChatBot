import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { ChatLayout } from '@/components/views/chat/layout'
import { Homepage } from '@/components/homepage'
import { ApproveRegistration } from '@/components/business/approveRegistration'
import { RejectRegistration } from '@/components/business/rejectRegistration'

const routes: RouteRecordRaw[] = [
  {
    path: '/index',
    name: 'Homepage',
    component: Homepage,
  },
  {
    path: '/chat/:uuid?',
    name: 'Chat',
    component: ChatLayout,
  },
  {
    path: '/users/approve_registration',
    name: 'approveRegistration',
    component: ApproveRegistration,
  },
  {
    path: '/users/reject_registration',
    name: 'rejectRegistration',
    component: RejectRegistration,
  },
  {
    path: '/',
    name: 'Base',
    redirect: '/index',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}

import { ApproveRegistration } from '@/components/business/approveRegistration'
import { RejectRegistration } from '@/components/business/rejectRegistration'
import { Homepage } from '@/components/homepage'
import { ChatLayout } from '@/components/views/chat/layout'
import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

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
  // {
  //   path: '/chat/stylechat/marketing_writing',
  //   name: 'marketingWriting',
  //   component: MarketingWriting,
  // },
  // {
  //   path: '/chat/stylechat/style_change',
  //   name: 'styleChange',
  //   component: StyleChange,
  // },
  // {
  //   path: '/chat/stylechat/memeber_promotion_copywriting',
  //   name: 'memeberPromotionCopywriting',
  //   component: MemeberPromotionCopywriting,
  // }
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

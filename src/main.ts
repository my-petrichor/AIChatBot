import 'mavon-editor/dist/css/index.css'

import { createApp } from 'vue'
import ElementTiptapPlugin from 'element-tiptap-vue3-fixed'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets, setupScrollbarStyle } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
import 'element-tiptap-vue3-fixed/lib/style.css'
async function bootstrap() {
  const app = createApp(App)
  setupAssets()

  setupScrollbarStyle()

  setupStore(app)

  setupI18n(app)

  await setupRouter(app)

  app.use(ElementTiptapPlugin)
  app.mount('#app')
}

bootstrap()

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import Ripple from 'primevue/ripple'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import router from './router'
import messages, {
  fallbackLocale,
  localeStorageKey,
  resolveInitialLocale,
} from './locales'
import { primeVueConfig } from './app/primevue/primevue.config'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import './assets/styles/main.css'

const app = createApp(App)
const initialLocale = resolveInitialLocale()
const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale,
  messages,
})

document.documentElement.lang = initialLocale

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PrimeVue, primeVueConfig)
app.use(ToastService)
app.directive('ripple', Ripple)

app.mount('#app')

i18n.global.locale.value = initialLocale
localStorage.setItem(localeStorageKey, initialLocale)

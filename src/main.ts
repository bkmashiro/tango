import { createApp } from 'vue'
import './assets/design-tokens.css'
import './assets/main.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')

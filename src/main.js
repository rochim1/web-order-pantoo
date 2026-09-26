import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import router from './router'
import { apolloClient } from './graphql/client'
import './assets/styles/main.css'
import './assets/styles/mobile-app.css'

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App)
})

app.use(router)
app.mount('#app')

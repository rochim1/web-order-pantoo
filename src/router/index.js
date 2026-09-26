import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/:instansiId/:tokoId/:tableId',
    name: 'Menu',
    component: () => import('@/pages/MenuPage.vue'),
    meta: { transition: 'fade' }
  },
  {
    path: '/:instansiId/:tokoId/:tableId/cart',
    name: 'Cart',
    component: () => import('@/pages/CartPage.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/:instansiId/:tokoId/:tableId/order/:orderId',
    name: 'OrderStatus',
    component: () => import('@/pages/OrderStatusPage.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Error',
    component: () => import('@/pages/ErrorPage.vue'),
    meta: { transition: 'fade' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router

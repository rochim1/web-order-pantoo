<template>
  <div class="page menu-page">
    <!-- Header -->
    <header class="menu-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="header-top">
          <div class="brand-area">
            <div class="brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 11l1.5-6A2 2 0 016.44 3.5h11.12A2 2 0 0119.5 5L21 11" />
                <path d="M3 11h18v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z" />
                <path d="M9 17v2m6-2v2M5 21h14" />
              </svg>
            </div>
            <div>
              <h1 class="brand-title">Menu Digital</h1>
              <p class="brand-subtitle">Pesan langsung dari meja Anda</p>
            </div>
          </div>
          <div class="table-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <span>{{ tableContext?.name || `Meja ${route.params.tableId.slice(-3)}` }}<small v-if="tableContext?.floor || tableContext?.area"> · {{ [tableContext.floor, tableContext.area].filter(Boolean).join(' / ') }}</small></span>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari menu..."
            class="search-input"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Category Tabs -->
    <CategoryTabs
      v-if="tableContext?.available !== false"
      :categories="categories"
      :active-category="activeCategory"
      @select="activeCategory = $event"
    />

    <!-- Loading State -->
    <div v-if="loading || tableLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Memuat menu...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || tableError || !tableContext" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4m0 4h.01" />
      </svg>
      <p>QR meja tidak valid atau data toko tidak dapat dimuat</p>
      <button class="btn-retry" @click="retryLoad">Coba Lagi</button>
    </div>

    <div v-else-if="tableContext.available === false" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M8 2v4m8-4v4M3 10h18" />
      </svg>
      <p>{{ tableContext.name }} sedang memiliki pesanan aktif</p>
      <small>Silakan lihat status pesanan sebelumnya atau hubungi kasir.</small>
    </div>

    <!-- Menu Grid -->
    <div v-else class="menu-grid">
      <MenuItem
        v-for="product in filteredProducts"
        :key="product._id"
        :product="product"
        :cart-qty="getCartQty(product._id)"
        @add="addToCart"
        @increment="incrementQty"
        @decrement="decrementQty"
      />

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="empty-state">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M8 11h6" />
        </svg>
        <p>Tidak ada menu ditemukan</p>
      </div>
    </div>

    <!-- Floating Cart Button -->
    <transition name="cart-fab">
      <button
        v-if="cartItemCount > 0 && tableContext?.available !== false"
        class="cart-fab"
        :class="{ pulse: justAdded }"
        @click="goToCart"
      >
        <div class="cart-fab-content">
          <div class="cart-fab-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            <span class="cart-fab-count">{{ cartItemCount }} item</span>
          </div>
          <span class="cart-fab-total">{{ formatPrice(cartTotal) }}</span>
        </div>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { GET_MENU, GET_TABLE_CONTEXT } from '@/graphql/queries'
import { useCart } from '@/composables/useCart'
import MenuItem from '@/components/MenuItem.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'

const route = useRoute()
const router = useRouter()
const cartScope = `${route.params.instansiId}:${route.params.tokoId}:${route.params.tableId}`
const { addToCart, incrementQty, decrementQty, getCartQty, cartTotal, cartItemCount } = useCart(cartScope)

const searchQuery = ref('')
const activeCategory = ref('Semua')
const justAdded = ref(false)

// Fetch menu
const { result, loading, error, refetch } = useQuery(GET_MENU, () => ({
  instansi_id: route.params.instansiId,
  toko_id: route.params.tokoId
}))

const {
  result: tableResult,
  loading: tableLoading,
  error: tableError,
  refetch: refetchTable
} = useQuery(GET_TABLE_CONTEXT, () => ({
  instansi_id: route.params.instansiId,
  toko_id: route.params.tokoId,
  table_id: route.params.tableId
}))

const tableContext = computed(() => tableResult.value?.GetPOSTablePublic || null)

function retryLoad() {
  refetch()
  refetchTable()
}

const products = computed(() => {
  const data = result.value?.GetPOSMenuPublic || []
  return data.filter((p) => p.status !== 'deleted' && p.status !== 'nonaktif')
})

const categories = computed(() => {
  const cats = [...new Set(products.value.map((p) => p.kategori).filter(Boolean))]
  return cats.sort()
})

const filteredProducts = computed(() => {
  let list = products.value

  if (activeCategory.value !== 'Semua') {
    list = list.filter((p) => p.kategori === activeCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (p) =>
        p.nama?.toLowerCase().includes(q) ||
        p.kode?.toLowerCase().includes(q) ||
        p.deskripsi?.toLowerCase().includes(q)
    )
  }

  return list
})

// Pulse animation when item added
watch(cartItemCount, (newVal, oldVal) => {
  if (newVal > oldVal) {
    justAdded.value = true
    setTimeout(() => (justAdded.value = false), 600)
  }
})

function goToCart() {
  const { instansiId, tokoId, tableId } = route.params
  router.push(`/${instansiId}/${tokoId}/${tableId}/cart`)
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0)
}
</script>

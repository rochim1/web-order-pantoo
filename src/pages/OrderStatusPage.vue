<template>
  <div class="page order-status-page">
    <nav class="status-toolbar" aria-label="Navigasi pesanan">
      <button class="btn-back" type="button" aria-label="Kembali ke menu" @click="orderAgain">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <span>Detail pesanan</span>
    </nav>
    <!-- Header -->
    <header v-if="order" class="status-header">
      <div class="status-header-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <h1 class="status-title">{{ statusTitle }}</h1>
      <p class="status-subtitle">{{ statusSubtitle }}</p>
    </header>

    <!-- Loading -->
    <div v-if="loading && !order" class="status-loading" role="status" aria-label="Memuat status pesanan">
      <div class="skeleton status-skeleton-icon"></div>
      <div class="skeleton status-skeleton-title"></div>
      <div class="skeleton status-skeleton-subtitle"></div>
      <div class="skeleton status-skeleton-card"></div>
      <div class="skeleton status-skeleton-card short"></div>
      <span class="sr-only">Memuat pesanan...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error && !order" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4m0 4h.01" />
      </svg>
      <p>Gagal memuat pesanan</p>
      <button class="btn-retry" @click="refetch()">Coba Lagi</button>
    </div>

    <!-- Order Content -->
    <div v-else-if="order" class="order-content">
      <!-- Order Number Card -->
      <div class="order-number-card">
        <span class="order-number-label">Nomor Pesanan</span>
        <span class="order-number-value">{{ order.order_no }}</span>
        <span v-if="order.table?.name" class="order-table-name">{{ order.table.name }}</span>
      </div>

      <!-- Status Stepper -->
      <div class="status-section">
        <h3 class="section-title">Status Pesanan</h3>
        <StatusStepper :current-status="order.status" />
      </div>

      <!-- Payment Status -->
      <div class="payment-status-section">
        <div class="payment-badge" :class="paymentClass">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" />
          </svg>
          <span>{{ paymentLabel }}</span>
        </div>
        <p class="payment-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4m0-4h.01" />
          </svg>
          {{ order.status_pembayaran === 'lunas' ? 'Pembayaran diterima' : 'Pembayaran dilakukan langsung di kasir' }}
        </p>
      </div>

      <div v-if="order.web_order_pay_before_processing && order.status_pembayaran !== 'lunas' && !isFinalStatus" class="pay-before-processing-notice" role="status">
        <strong>Bayar di kasir agar pesanan diproses</strong>
        <span>Tunjukkan nomor pesanan {{ order.order_no }} kepada kasir. Pembayaran online belum tersedia.</span>
      </div>

      <!-- Order Items -->
      <div class="order-items-section">
        <h3 class="section-title">Detail Pesanan</h3>
        <div class="order-items-list">
          <div v-for="item in order.items" :key="item.nama" class="order-item-row">
            <div class="order-item-info">
              <span class="order-item-name">{{ item.nama }}</span>
              <span class="order-item-qty">× {{ item.qty }}</span>
              <span v-if="item.preparation_mode === 'station'" class="order-item-production">{{ productionLabel(item.production_status) }}</span>
            </div>
            <span class="order-item-price">{{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>
        <div class="order-total-divider"></div>
        <div class="order-total-row">
          <span>Total</span>
          <span class="order-total-value">{{ formatPrice(order.grand_total) }}</span>
        </div>
      </div>

      <!-- Order Time -->
      <div v-if="order.createdAt" class="order-time">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span>Dipesan pada {{ formatDate(order.createdAt) }}</span>
      </div>

      <!-- Auto-refresh indicator -->
      <div class="auto-refresh-info">
        <div class="refresh-dot"></div>
        <span>{{ realtimeConnected ? 'Status tersambung langsung' : 'Status diperbarui otomatis' }}</span>
      </div>

      <!-- Action Buttons -->
      <div v-if="isFinalStatus" class="order-actions">
        <button class="btn-primary" @click="orderAgain">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Buat Pesanan Baru
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { GET_ORDER_STATUS } from '@/graphql/queries'
import StatusStepper from '@/components/StatusStepper.vue'
import { usePublicOrderRealtime } from '@/composables/usePublicOrderRealtime'

const route = useRoute()
const router = useRouter()
const tokenStorageKey = `pantoo_order_token:${route.params.orderId}`
const publicToken = String(route.query.token || sessionStorage.getItem(tokenStorageKey) || '')
if (route.query.token) sessionStorage.setItem(tokenStorageKey, String(route.query.token))
onMounted(() => {
  if (route.query.token) router.replace({ path: route.path })
})

const { result, loading, error, refetch } = useQuery(
  GET_ORDER_STATUS,
  () => ({
    instansi_id: route.params.instansiId,
    toko_id: route.params.tokoId,
    order_id: route.params.orderId,
    public_token: publicToken || undefined
  }),
  {
    pollInterval: 10000 // Poll every 10 seconds
  }
)

const order = computed(() => result.value?.GetPOSOrderPublic || null)
const { connected: realtimeConnected } = usePublicOrderRealtime({
  orderId: route.params.orderId,
  token: publicToken,
  onChanged: () => refetch()
})

const isFinalStatus = computed(() => ['Selesai', 'Batal'].includes(order.value?.status))
const productionLabel = (status) => ({
  queued: 'Menunggu dapur',
  preparing: 'Sedang disiapkan',
  ready: 'Siap disajikan',
  served: 'Sudah disajikan',
  voided: 'Dibatalkan',
}[status] || 'Menunggu dapur')
const statusTitle = computed(() => {
  if (order.value?.web_order_pay_before_processing && order.value?.status_pembayaran !== 'lunas' && !isFinalStatus.value) return 'Menunggu Pembayaran'
  if (order.value?.status === 'Selesai') return 'Pesanan Selesai'
  if (order.value?.status === 'Batal') return 'Pesanan Dibatalkan'
  if (order.value?.status === 'Siap') return 'Pesanan Siap'
  if (order.value?.status === 'Disajikan') return 'Pesanan Telah Disajikan'
  if (order.value?.status === 'Diproses') return 'Pesanan Sedang Diproses'
  return 'Pesanan Diterima'
})
const statusSubtitle = computed(() => {
  if (order.value?.web_order_pay_before_processing && order.value?.status_pembayaran !== 'lunas' && !isFinalStatus.value) return 'Silakan bayar di kasir agar pesanan mulai diproses.'
  if (order.value?.status === 'Selesai') return 'Terima kasih telah memesan di tempat kami.'
  if (order.value?.status === 'Batal') return 'Silakan hubungi staf apabila Anda memerlukan bantuan.'
  if (order.value?.status === 'Siap') return 'Pesanan Anda siap untuk disajikan atau diambil.'
  if (order.value?.status === 'Disajikan') return 'Selamat menikmati pesanan Anda.'
  if (order.value?.status === 'Diproses') return 'Dapur sedang menyiapkan pesanan Anda.'
  return 'Pesanan menunggu konfirmasi staf.'
})

const paymentClass = computed(() => {
  if (!order.value) return ''
  return order.value.status_pembayaran === 'lunas' ? 'paid' : 'unpaid'
})

const paymentLabel = computed(() => {
  if (!order.value) return ''
  return order.value.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Bayar'
})

function orderAgain() {
  const { instansiId, tokoId, tableId } = route.params
  router.push(`/${instansiId}/${tokoId}/${tableId}`)
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0)
}

function formatDate(dateStr) {
  try {
    const date = new Date(Number(dateStr) || dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div class="page cart-page">
    <!-- Header -->
    <header class="cart-header">
      <button class="btn-back" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="page-title">Keranjang Anda</h1>
      <span class="cart-count-badge" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
    </header>

    <!-- Empty State -->
    <div v-if="cartItems.length === 0" class="empty-cart">
      <div class="empty-cart-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
      </div>
      <h2>Keranjang Kosong</h2>
      <p>Belum ada item yang ditambahkan</p>
      <button class="btn-primary" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Lihat Menu
      </button>
    </div>

    <!-- Cart Content -->
    <div v-else class="cart-content">
      <!-- Cart Items -->
      <div class="cart-items-list">
        <CartItem
          v-for="item in cartItems"
          :key="item.product._id"
          :item="item"
          @update-qty="updateQty"
          @remove="removeFromCart"
          @update-note="updateItemNote"
        />
      </div>

      <!-- Customer Name -->
      <div class="form-section">
        <label class="form-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Nama Pemesan {{ requireCustomer ? '(wajib)' : '(opsional)' }}
        </label>
        <input
          v-model="customerNameInput"
          type="text"
          class="form-input"
          placeholder="Masukkan nama Anda..."
          :required="requireCustomer"
        />
      </div>

      <!-- Order Note -->
      <div class="form-section">
        <label class="form-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M16 13H8m8 4H8m2-8H8" />
          </svg>
          Catatan Pesanan (opsional)
        </label>
        <textarea
          v-model="orderNoteInput"
          class="form-textarea"
          placeholder="Contoh: tidak pedas, extra sambal..."
          rows="3"
        ></textarea>
      </div>

      <!-- Order Summary -->
      <OrderSummary :items="cartItems" :total="cartTotal" />

      <!-- Submit Button -->
      <button
        class="btn-submit"
        :disabled="submitting"
        @click="submitOrder"
      >
        <div v-if="submitting" class="btn-loading">
          <div class="loading-spinner small"></div>
          <span>Mengirim pesanan...</span>
        </div>
        <div v-else class="btn-submit-content">
          <span>Kirim Pesanan</span>
          <span class="btn-submit-total">{{ formatPrice(cartTotal) }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { CREATE_ORDER, GET_TABLE_CONTEXT } from '@/graphql/queries'
import { useCart } from '@/composables/useCart'
import CartItem from '@/components/CartItem.vue'
import OrderSummary from '@/components/OrderSummary.vue'

const route = useRoute()
const router = useRouter()
const cartScope = `${route.params.instansiId}:${route.params.tokoId}:${route.params.tableId}`
const {
  cartItems,
  cartTotal,
  cartItemCount,
  updateQty,
  removeFromCart,
  updateItemNote,
  clearCart
} = useCart(cartScope)

const customerNameInput = ref('')
const orderNoteInput = ref('')
const submitting = ref(false)
const { result: tableResult } = useQuery(GET_TABLE_CONTEXT, () => ({
  instansi_id: route.params.instansiId,
  toko_id: route.params.tokoId,
  table_id: route.params.tableId
}))
const requireCustomer = computed(() => tableResult.value?.GetPOSTablePublic?.require_customer === true)

const { mutate: createOrder } = useMutation(CREATE_ORDER)

function requestKey(instansiId, tokoId, tableId) {
  return `pantoo_order_request:${instansiId}:${tokoId}:${tableId}`
}

function getOrCreateRequestId(instansiId, tokoId, tableId) {
  const key = requestKey(instansiId, tokoId, tableId)
  let value = sessionStorage.getItem(key)
  if (!value) {
    value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    sessionStorage.setItem(key, value)
  }
  return value
}

async function submitOrder() {
  if (cartItems.length === 0) return
  if (requireCustomer.value && !customerNameInput.value.trim()) {
    alert('Nama pemesan wajib diisi untuk toko ini.')
    return
  }
  submitting.value = true

  try {
    const { instansiId, tokoId, tableId } = route.params

    // Build items array for mutation
    const items = cartItems.map((item) => ({
      produk_id: item.product._id,
      nama: item.product.nama,
      qty: item.qty,
      harga_satuan: item.product.harga_jual,
      catatan: item.note || undefined
    }))

    // Build combined notes
    const notes = []
    if (orderNoteInput.value.trim()) {
      notes.push(orderNoteInput.value.trim())
    }

    const result = await createOrder({
      instansi_id: instansiId,
      toko_id: tokoId,
      table_id: tableId,
      pelanggan_nama: customerNameInput.value.trim() || undefined,
      items,
      catatan: notes.length > 0 ? notes.join('; ') : undefined,
      client_request_id: getOrCreateRequestId(instansiId, tokoId, tableId)
    })

    const order = result?.data?.CreatePOSOrderPublic
    if (order?._id) {
      clearCart()
      sessionStorage.removeItem(requestKey(instansiId, tokoId, tableId))
      if (order.public_token) sessionStorage.setItem(`pantoo_order_token:${order._id}`, order.public_token)
      router.replace(`/${instansiId}/${tokoId}/${tableId}/order/${order._id}`)
    }
  } catch (err) {
    console.error('Order submission error:', err)
    const graphError = err?.graphQLErrors?.[0] || err?.cause?.graphQLErrors?.[0]
    const message = graphError?.message || err?.message || ''
    const isOccupied = graphError?.extensions?.code === 'CONFLICT' || /meja.*(tidak tersedia|terisi)/i.test(message)
    alert(isOccupied
      ? 'Meja ini sudah memiliki pesanan aktif. Silakan lihat status pesanan sebelumnya atau hubungi kasir.'
      : (message || 'Gagal mengirim pesanan. Silakan coba lagi.'))
  } finally {
    submitting.value = false
  }
}

function goBack() {
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
</script>

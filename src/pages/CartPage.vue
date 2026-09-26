<template>
  <div class="page cart-page">
    <!-- Header -->
    <header class="cart-header">
      <button type="button" class="btn-back" aria-label="Kembali ke menu" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="cart-header-copy">
        <h1 class="page-title">Keranjang</h1>
        <p>Periksa pesanan sebelum dikirim</p>
      </div>
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
      <div class="cart-context-bar">
        <span>{{ tableContext?.name || 'Meja Anda' }} · {{ cartItemCount }} item</span>
        <button type="button" @click="goBack">+ Tambah menu</button>
      </div>

      <div v-if="tableLoading" class="cart-context-loading" role="status">Memeriksa meja...</div>
      <div v-else-if="tableError || !tableContext" class="cart-feedback error" role="alert">
        Meja gagal dimuat. Periksa koneksi dan coba lagi.
        <button type="button" @click="refetchTable()">Coba lagi</button>
      </div>
      <div v-else-if="tableContext.available === false" class="cart-feedback warning" role="status">
        Meja ini sudah memiliki pesanan aktif. Hubungi kasir jika ingin menambah menu.
      </div>

      <!-- Cart Items -->
      <h2 class="cart-section-title">Item pesanan</h2>
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

      <!-- Customer mode -->
      <div class="form-section">
        <span class="form-label">Data pemesan</span>
        <div class="customer-mode-options" role="group" aria-label="Pilih cara memesan">
          <button type="button" :class="['customer-mode-option', { active: !customerProfileRequested }]" :aria-pressed="!customerProfileRequested" @click="customerProfileRequested = false">Pesan sebagai tamu</button>
          <button type="button" :class="['customer-mode-option', { active: customerProfileRequested }]" :aria-pressed="customerProfileRequested" @click="customerProfileRequested = true">Daftarkan saat bayar</button>
        </div>
        <p class="customer-mode-caption">{{ customerProfileRequested ? 'Nomor Anda diteruskan ke kasir. Kasir akan mengonfirmasi profil pelanggan saat pembayaran; belum otomatis terdaftar.' : 'Nama bebas untuk mengenali pesanan. Tidak membuat profil pelanggan.' }}</p>
      </div>

      <!-- Customer Name -->
      <div class="form-section">
        <label class="form-label" for="customer-name">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Nama Pemesan {{ requireCustomer || customerProfileRequested ? '(wajib)' : '(opsional)' }}
        </label>
        <input
          id="customer-name"
          ref="customerNameField"
          v-model="customerName"
          type="text"
          class="form-input"
          placeholder="Masukkan nama Anda..."
          :required="requireCustomer || customerProfileRequested"
        />
      </div>

      <div v-if="customerProfileRequested" class="form-section">
        <label class="form-label" for="customer-phone">Nomor telepon (wajib)</label>
        <input
          id="customer-phone"
          ref="customerPhoneField"
          v-model="customerPhone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          class="form-input"
          placeholder="Contoh: 081234567890"
          required
        />
        <p class="customer-mode-caption">Dengan mengirim pesanan, Anda meminta kasir menggunakan nama dan nomor ini untuk menghubungkan atau membuat profil pelanggan.</p>
      </div>

      <!-- Order Note -->
      <div class="form-section">
        <label class="form-label" for="order-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M16 13H8m8 4H8m2-8H8" />
          </svg>
          Catatan Pesanan (opsional)
        </label>
        <textarea
          id="order-note"
          v-model="orderNote"
          class="form-textarea"
          placeholder="Contoh: tidak pedas, extra sambal..."
          rows="3"
        ></textarea>
      </div>

      <!-- Order Summary -->
      <OrderSummary :items="cartItems" :total="cartTotal" />

      <div class="cart-payment-hint" role="note">
        <strong>Pembayaran di kasir</strong>
        <span v-if="tableContext?.web_order_pay_before_processing">Pesanan akan mulai diproses setelah Anda membayar di kasir. Tunjukkan nomor pesanan setelah dikirim.</span>
        <span v-else>Bayar langsung di kasir setelah pesanan dikirim. Tidak ada pembayaran online di halaman ini.</span>
      </div>
      <div v-if="submitError" class="cart-feedback error" role="alert">{{ submitError }}</div>

      <!-- Submit Button -->
      <button
        class="btn-submit"
        type="button"
        :disabled="submitting || tableLoading || !!tableError || !tableContext?.available"
        @click="submitOrder"
      >
        <div v-if="submitting" class="btn-loading">
          <div class="loading-spinner small"></div>
          <span>Mengirim pesanan...</span>
        </div>
        <div v-else class="btn-submit-content">
          <span>{{ tableLoading ? 'Memeriksa meja...' : 'Kirim Pesanan' }}</span>
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
  customerName,
  customerPhone,
  customerProfileRequested,
  orderNote,
  updateQty,
  removeFromCart,
  updateItemNote,
  clearCart
} = useCart(cartScope)

const customerNameField = ref(null)
const customerPhoneField = ref(null)
const submitError = ref('')
const submitting = ref(false)
const { result: tableResult, loading: tableLoading, error: tableError, refetch: refetchTable } = useQuery(
  GET_TABLE_CONTEXT,
  () => ({
    instansi_id: route.params.instansiId,
    toko_id: route.params.tokoId,
    table_id: route.params.tableId
  }),
  { fetchPolicy: 'network-only' }
)
const tableContext = computed(() => tableResult.value?.GetPOSTablePublic || null)
const requireCustomer = computed(() => tableContext.value?.require_customer === true)

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
  submitError.value = ''
  if (tableLoading.value || tableError.value || !tableContext.value) {
    submitError.value = 'Data meja belum siap. Coba muat ulang sebelum mengirim pesanan.'
    return
  }
  if (tableContext.value.available === false) {
    submitError.value = 'Meja sudah memiliki pesanan aktif. Hubungi kasir untuk menambah menu.'
    return
  }
  if ((requireCustomer.value || customerProfileRequested.value) && !customerName.value.trim()) {
    submitError.value = 'Nama pemesan wajib diisi untuk toko ini.'
    customerNameField.value?.focus()
    return
  }
  if (customerProfileRequested.value && !/^\+?[0-9]{8,15}$/.test(customerPhone.value.replace(/[\s().-]/g, ''))) {
    submitError.value = 'Nomor telepon pelanggan harus berisi 8–15 angka.'
    customerPhoneField.value?.focus()
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
    if (orderNote.value.trim()) {
      notes.push(orderNote.value.trim())
    }

    const result = await createOrder({
      instansi_id: instansiId,
      toko_id: tokoId,
      table_id: tableId,
      pelanggan_nama: customerName.value.trim() || undefined,
      pelanggan_telepon: customerProfileRequested.value ? customerPhone.value.trim() : undefined,
      customer_profile_requested: customerProfileRequested.value,
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
    } else {
      submitError.value = 'Pesanan belum terkonfirmasi. Periksa koneksi lalu coba lagi.'
    }
  } catch (err) {
    console.error('Order submission error:', err)
    const graphError = err?.graphQLErrors?.[0] || err?.cause?.graphQLErrors?.[0]
    const message = graphError?.message || err?.message || ''
    const isOccupied = graphError?.extensions?.code === 'CONFLICT' || /meja.*(tidak tersedia|terisi)/i.test(message)
    submitError.value = isOccupied
      ? 'Meja ini sudah memiliki pesanan aktif. Silakan lihat status pesanan sebelumnya atau hubungi kasir.'
      : (message || 'Gagal mengirim pesanan. Silakan coba lagi.')
    if (isOccupied) {
      try { await refetchTable() } catch { /* Keep the actionable error above. */ }
    }
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

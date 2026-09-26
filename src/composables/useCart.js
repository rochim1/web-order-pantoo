import { reactive, computed, watch } from 'vue'

const carts = new Map()
const storageKey = (scope) => `pantoo_cart:${scope}`

function loadState(scope) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(storageKey(scope)) || '{}')
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      customerName: String(parsed.customerName || ''),
      customerPhone: String(parsed.customerPhone || ''),
      customerProfileRequested: parsed.customerProfileRequested === true,
      orderNote: String(parsed.orderNote || '')
    }
  } catch {
    return { items: [], customerName: '', customerPhone: '', customerProfileRequested: false, orderNote: '' }
  }
}

function stateFor(scope) {
  if (carts.has(scope)) return carts.get(scope)
  const state = reactive(loadState(scope))
  watch(state, (value) => {
    try {
      sessionStorage.setItem(storageKey(scope), JSON.stringify(value))
    } catch {
      // Storage is optional; the in-memory cart remains usable.
    }
  }, { deep: true })
  carts.set(scope, state)
  return state
}

export function useCart(scope = 'default') {
  const state = stateFor(scope)
  const maxQty = (item) => {
    const stock = Number(item?.product?.stok)
    return Number.isFinite(stock) && stock >= 0 ? stock : Number.POSITIVE_INFINITY
  }

  const removeFromCart = (productId) => {
    const index = state.items.findIndex((item) => item.product._id === productId)
    if (index > -1) state.items.splice(index, 1)
  }
  const addToCart = (product) => {
    const existing = state.items.find((item) => item.product._id === product._id)
    if (existing) existing.qty = Math.min(existing.qty + 1, maxQty(existing))
    else if (Number(product.stok) !== 0) {
      state.items.push({
        product: {
          _id: product._id, nama: product.nama, harga_jual: product.harga_jual,
          gambar: product.gambar, kategori: product.kategori, stok: product.stok
        },
        qty: 1,
        note: ''
      })
    }
  }
  const updateQty = (productId, qty) => {
    const item = state.items.find((row) => row.product._id === productId)
    if (!item) return
    const normalized = Math.min(Number(qty || 0), maxQty(item))
    if (normalized <= 0) removeFromCart(productId)
    else item.qty = normalized
  }
  const updateItemNote = (productId, note) => {
    const item = state.items.find((row) => row.product._id === productId)
    if (item) item.note = String(note || '').slice(0, 300)
  }
  const incrementQty = (productId) => {
    const item = state.items.find((row) => row.product._id === productId)
    if (item) item.qty = Math.min(item.qty + 1, maxQty(item))
  }
  const decrementQty = (productId) => {
    const item = state.items.find((row) => row.product._id === productId)
    if (!item) return
    if (item.qty <= 1) removeFromCart(productId)
    else item.qty -= 1
  }
  const clearCart = () => {
    state.items.splice(0, state.items.length)
    state.customerName = ''
    state.customerPhone = ''
    state.customerProfileRequested = false
    state.orderNote = ''
    sessionStorage.removeItem(storageKey(scope))
  }
  const getCartQty = (productId) => state.items.find((item) => item.product._id === productId)?.qty || 0
  const cartTotal = computed(() => state.items.reduce(
    (sum, item) => sum + Number(item.product.harga_jual || 0) * Number(item.qty || 0), 0
  ))
  const cartItemCount = computed(() => state.items.reduce((sum, item) => sum + Number(item.qty || 0), 0))

  return {
    cartItems: state.items,
    customerName: computed({ get: () => state.customerName, set: (value) => { state.customerName = value } }),
    customerPhone: computed({ get: () => state.customerPhone, set: (value) => { state.customerPhone = value } }),
    customerProfileRequested: computed({
      get: () => state.customerProfileRequested,
      set: (value) => {
        state.customerProfileRequested = value === true
        if (!state.customerProfileRequested) state.customerPhone = ''
      }
    }),
    orderNote: computed({ get: () => state.orderNote, set: (value) => { state.orderNote = value } }),
    addToCart, removeFromCart, updateQty, updateItemNote, incrementQty, decrementQty,
    clearCart, getCartQty, cartTotal, cartItemCount
  }
}

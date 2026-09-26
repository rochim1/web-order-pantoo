<template>
  <article class="cart-item">
    <div class="cart-item-main">
      <div class="cart-item-thumb" aria-hidden="true">
        <img v-if="item.product.gambar && !imageFailed" :src="item.product.gambar" :alt="item.product.nama" @error="imageFailed = true" />
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M3 11h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2Zm1-1 1.5-5h13L20 10M8 17v3m8-3v3M5 20h14" />
        </svg>
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-name">{{ item.product.nama }}</h4>
        <p class="cart-item-price">{{ formatPrice(item.product.harga_jual) }} / item</p>
      </div>
      <button type="button" class="btn-remove" :aria-label="`Hapus ${item.product.nama}`" @click="$emit('remove', item.product._id)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
        </svg>
      </button>
    </div>

    <div class="cart-item-bottom">
      <div class="qty-control">
        <button type="button" class="btn-qty" :aria-label="`Kurangi ${item.product.nama}`" @click="onDecrement">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14" />
          </svg>
        </button>
        <span class="qty-value">{{ item.qty }}</span>
        <button type="button" class="btn-qty btn-qty-plus" :disabled="atStockLimit" :aria-label="`Tambah ${item.product.nama}`" @click="onIncrement">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      <p class="cart-item-subtotal">{{ formatPrice(item.product.harga_jual * item.qty) }}</p>
    </div>

    <label class="cart-item-note">
      <span>Catatan item</span>
      <input
        type="text"
        class="input-note"
        placeholder="Catatan item (opsional)..."
        :value="item.note"
        @input="$emit('updateNote', item.product._id, $event.target.value)"
      />
    </label>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }
})

const imageFailed = ref(false)
const atStockLimit = computed(() => {
  const stock = Number(props.item.product.stok)
  return Number.isFinite(stock) && stock >= 0 && props.item.qty >= stock
})

const emit = defineEmits(['updateQty', 'remove', 'updateNote'])

function onIncrement() {
  emit('updateQty', props.item.product._id, props.item.qty + 1)
}

function onDecrement() {
  if (props.item.qty <= 1) {
    emit('remove', props.item.product._id)
  } else {
    emit('updateQty', props.item.product._id, props.item.qty - 1)
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0)
}
</script>

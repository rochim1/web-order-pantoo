<template>
  <div class="menu-item-card" :class="{ 'out-of-stock': isOutOfStock }">
    <div class="menu-item-image">
      <img
        v-if="product.gambar && !imageFailed"
        :src="product.gambar"
        :alt="product.nama"
        loading="lazy"
        @error="onImageError"
      />
      <div v-else class="menu-item-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 11l1.5-6A2 2 0 016.44 3.5h11.12A2 2 0 0119.5 5L21 11" />
          <path d="M3 11h18v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z" />
          <path d="M9 17v2m6-2v2M5 21h14" />
        </svg>
      </div>
      <span v-if="isOutOfStock" class="stock-badge">Habis</span>
    </div>

    <div class="menu-item-info">
      <h3 class="menu-item-name">{{ product.nama }}</h3>
      <p v-if="product.deskripsi" class="menu-item-desc">{{ product.deskripsi }}</p>
      <p class="menu-item-price">{{ formatPrice(product.harga_jual) }}</p>
    </div>

    <div class="menu-item-action">
      <template v-if="!isOutOfStock && !orderingDisabled">
        <button
          v-if="cartQty === 0"
          class="btn-add"
          @click="$emit('add', product)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div v-else class="qty-control">
          <button class="btn-qty" @click="$emit('decrement', product._id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14" />
            </svg>
          </button>
          <span class="qty-value">{{ cartQty }}</span>
          <button class="btn-qty btn-qty-plus" @click="$emit('increment', product._id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  product: { type: Object, required: true },
  cartQty: { type: Number, default: 0 },
  orderingDisabled: { type: Boolean, default: false }
})

defineEmits(['add', 'increment', 'decrement'])

const isOutOfStock = computed(() => props.product.stok === 0 || props.product.status === 'nonaktif')
const imageFailed = ref(false)

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0)
}

function onImageError() {
  imageFailed.value = true
}
</script>

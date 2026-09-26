<template>
  <div class="menu-item-card" :class="{ 'out-of-stock': isOutOfStock }">
    <div class="menu-item-image" :class="`menu-art-${categoryKind}`">
      <img
        v-if="product.gambar && !imageFailed"
        :src="product.gambar"
        :alt="product.nama"
        loading="lazy"
        @error="onImageError"
      />
      <div v-else class="menu-item-placeholder">
        <span class="menu-art-orbit" aria-hidden="true"></span>
        <svg v-if="categoryKind === 'drink'" width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 12h24l-3 34a9 9 0 0 1-18 0l-3-34ZM22 20h20M26 53h12M29 12V6h12" />
          <path d="M25 31c4 3 10 3 14 0" />
        </svg>
        <svg v-else-if="categoryKind === 'food'" width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M13 43h38M19 43a13 13 0 0 1 26 0M10 50h44M32 23v-4M22 24l-3-4M42 24l3-4" />
          <path d="M16 50a5 5 0 0 0 5 5h22a5 5 0 0 0 5-5" />
        </svg>
        <svg v-else width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M14 31c0-10 8-18 18-18s18 8 18 18-8 18-18 18-18-8-18-18ZM15 30c11 1 20 8 24 17M37 15c-1 11 5 21 12 25" />
          <path d="M18 52h28" />
        </svg>
      </div>
      <span v-if="product.kategori" class="menu-image-category">{{ product.kategori }}</span>
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
          type="button"
          class="btn-add"
          :aria-label="`Tambah ${product.nama} ke keranjang`"
          @click="$emit('add', product)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Tambah</span>
        </button>
        <div v-else class="qty-control">
          <button type="button" class="btn-qty" :aria-label="`Kurangi ${product.nama}`" @click="$emit('decrement', product._id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14" />
            </svg>
          </button>
          <span class="qty-value">{{ cartQty }}</span>
          <button type="button" class="btn-qty btn-qty-plus" :disabled="cartQty >= Number(product.stok)" :aria-label="`Tambah ${product.nama}`" @click="$emit('increment', product._id)">
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
const categoryKind = computed(() => {
  const category = String(props.product.kategori || '').toLowerCase()
  if (/minum|drink|beverage|kopi|coffee|tea/.test(category)) return 'drink'
  if (/makan|food|meal|rice|nasi|pasta/.test(category)) return 'food'
  return 'snack'
})
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

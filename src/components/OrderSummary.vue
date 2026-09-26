<template>
  <div class="order-summary-card">
    <h3 class="order-summary-title">Ringkasan Pesanan</h3>

    <div class="order-summary-items">
      <div v-for="item in items" :key="item.nama || item.product?.nama" class="summary-row">
        <span class="summary-item-name">
          {{ item.nama || item.product?.nama }}
          <span class="summary-item-qty">× {{ item.qty }}</span>
        </span>
        <span class="summary-item-price">
          {{ formatPrice(item.subtotal || (item.product?.harga_jual || item.harga_satuan || 0) * item.qty) }}
        </span>
      </div>
    </div>

    <div class="order-summary-divider"></div>

    <div class="summary-row summary-total">
      <span>Total</span>
      <span>{{ formatPrice(total) }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 }
})

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0)
}
</script>

<template>
  <div class="cart-item">
    <div class="cart-item-info">
      <h4 class="cart-item-name">{{ item.product.nama }}</h4>
      <p class="cart-item-price">{{ formatPrice(item.product.harga_jual) }}</p>
    </div>

    <div class="cart-item-controls">
      <div class="qty-control">
        <button class="btn-qty" @click="onDecrement">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14" />
          </svg>
        </button>
        <span class="qty-value">{{ item.qty }}</span>
        <button class="btn-qty btn-qty-plus" @click="onIncrement">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      <p class="cart-item-subtotal">{{ formatPrice(item.product.harga_jual * item.qty) }}</p>
    </div>

    <div class="cart-item-note">
      <input
        type="text"
        class="input-note"
        placeholder="Catatan item (opsional)..."
        :value="item.note"
        @input="$emit('updateNote', item.product._id, $event.target.value)"
      />
    </div>

    <button class="btn-remove" @click="$emit('remove', item.product._id)" title="Hapus item">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true }
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

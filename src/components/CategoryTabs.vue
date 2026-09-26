<template>
  <div class="category-tabs">
    <div class="category-tabs-scroll">
      <button
        class="category-pill"
        :class="{ active: activeCategory === 'Semua' }"
        @click="$emit('select', 'Semua')"
      >
        Semua
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        class="category-pill"
        :class="{ active: activeCategory === cat }"
        @click="$emit('select', cat)"
      >
        {{ cat }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  activeCategory: { type: String, default: 'Semua' }
})

defineEmits(['select'])
</script>

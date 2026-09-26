<template>
  <div class="status-stepper">
    <div
      v-for="(step, index) in steps"
      :key="step.key"
      class="stepper-step"
      :class="{
        completed: stepIndex > index,
        active: stepIndex === index,
        pending: stepIndex < index
      }"
    >
      <div class="stepper-icon">
        <svg v-if="stepIndex > index" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span v-else class="stepper-number">{{ index + 1 }}</span>
        <span v-if="stepIndex === index" class="stepper-pulse"></span>
      </div>
      <div class="stepper-label">{{ step.label }}</div>
      <div v-if="index < steps.length - 1" class="stepper-line" :class="{ filled: stepIndex > index }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentStatus: { type: String, default: 'baru' }
})

const steps = [
  { key: 'baru', label: 'Baru' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'siap', label: 'Siap' },
  { key: 'selesai', label: 'Selesai' }
]

const stepIndex = computed(() => {
  const idx = steps.findIndex((s) => s.key === props.currentStatus)
  return idx >= 0 ? idx : 0
})
</script>

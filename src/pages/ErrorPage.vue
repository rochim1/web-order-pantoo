<template>
  <div class="page error-page">
    <div class="error-content">
      <div class="error-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
      </div>
      <h1 class="error-title">Halaman Tidak Ditemukan</h1>
      <p class="error-desc">
        Link QR Code mungkin salah atau sudah tidak berlaku.
        Silakan scan ulang QR Code di meja Anda.
      </p>
      <div class="error-illustration">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="3" height="3" />
          <rect x="18" y="18" width="3" height="3" />
          <rect x="14" y="18" width="3" height="3" />
          <rect x="18" y="14" width="3" height="3" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
// Error page — no logic needed
</script>

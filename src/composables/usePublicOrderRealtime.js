import { onMounted, onUnmounted, ref } from 'vue'

function websocketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin
  const url = new URL(apiUrl, window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = '/notifications'
  url.search = ''
  return url.toString()
}

export function usePublicOrderRealtime({ orderId, token, onChanged }) {
  const connected = ref(false)
  let socket
  let reconnectTimer
  let stopped = false

  const connect = () => {
    if (stopped || !orderId || !token) return
    socket = new WebSocket(websocketUrl())
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'public_order_auth', order_id: orderId, public_token: token }))
    }
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'public_order_auth_success') connected.value = true
        if (message.type === 'pos_order_changed' && String(message.data?.order_id) === String(orderId)) onChanged?.()
      } catch {
        // A malformed realtime message must not break polling fallback.
      }
    }
    socket.onclose = () => {
      connected.value = false
      if (!stopped) reconnectTimer = setTimeout(connect, 5000)
    }
  }

  onMounted(connect)
  onUnmounted(() => {
    stopped = true
    clearTimeout(reconnectTimer)
    socket?.close()
  })
  return { connected }
}

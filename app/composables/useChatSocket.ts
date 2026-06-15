import { io, type Socket } from 'socket.io-client'
import { onBeforeUnmount } from 'vue'

let socket: Socket | null = null
let refCount = 0

export function useChatSocket() {
  if (!socket) {
    socket = io({
      path: '/api/socket.io',
      withCredentials: true,
      autoConnect: true
    })
  }
  refCount += 1
  onBeforeUnmount(() => {
    refCount -= 1
    if (refCount <= 0 && socket) {
      socket.disconnect()
      socket = null
      refCount = 0
    }
  })
  return socket
}

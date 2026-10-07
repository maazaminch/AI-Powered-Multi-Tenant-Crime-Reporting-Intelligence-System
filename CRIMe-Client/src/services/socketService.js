import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  // Connect to socket
  connect() {
    if (this.socket) {
      return this.socket
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false
    })

    this.socket.on('connect', () => {
      this.connected = true
    })

    this.socket.on('disconnect', () => {
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Notification socket connection failed:', error.message)
    })

    this.socket.connect()
    return this.socket
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  // Listen to events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // Emit events
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Check if connected
  isConnected() {
    return this.connected
  }
}

export default new SocketService()

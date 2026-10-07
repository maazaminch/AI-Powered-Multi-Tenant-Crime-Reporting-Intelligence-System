import React, { useCallback, useEffect, useRef, useState } from 'react'
import { QueryProvider } from './lib/queryClient.jsx'
import { AppRouter } from './lib/router.jsx'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/auth/useAuth.js'
import { useSocket } from './hooks/notifications/useSocket.js'

const AuthInitializer = ({ onInitialized }) => {
  const { initializeAuth } = useAuth()
  const initializeAuthRef = useRef(initializeAuth)

  useEffect(() => {
    initializeAuthRef.current().finally(onInitialized)
  }, [onInitialized])

  return null
}

const NotificationSocket = ({ authInitialized }) => {
  useSocket(authInitialized)
  return null
}

function App() {
  const [authInitialized, setAuthInitialized] = useState(false)
  const handleAuthInitialized = useCallback(() => {
    setAuthInitialized(true)
  }, [])

  return (
    <QueryProvider>
      <AuthInitializer onInitialized={handleAuthInitialized} />
      <NotificationSocket authInitialized={authInitialized} />
      <AppRouter />
      <Toaster richColors position="top-right" closeButton />
    </QueryProvider>
  )
}

export default App

import React, { useEffect } from 'react'
import { QueryProvider } from './lib/queryClient.jsx'
import { AppRouter } from './lib/router.jsx'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/useAuth.js'

const AuthInitializer = () => {
  const { initializeAuth } = useAuth()

  useEffect(() => {
    initializeAuth()
  }, [])

  return null
}


function App() {

  return (
    <QueryProvider>
      <AuthInitializer/>
      <AppRouter />
      <Toaster richColors position="top-right" closeButton />
    </QueryProvider>
  )
}

export default App

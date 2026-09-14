import React, { useEffect, useRef, useState } from 'react'

const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = 'Sign in with Google',
  className = '',
  disabled = false
}) => {
  const buttonRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google?.accounts?.id) {
        setIsLoaded(true)
      }
    }

    // Check immediately
    checkGoogleLoaded()

    // Check while GSI script is loading
    const interval = setInterval(checkGoogleLoaded, 100)

    const timeout = setTimeout(() => {
      clearInterval(interval)

      if (!window.google?.accounts?.id) {
        onError?.('Google Identity Services failed to load')
      }
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [onError])

  useEffect(() => {
    if (!isLoaded || !buttonRef.current || disabled) {
      return
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
      onError?.('Google Client ID is not configured')
      return
    }

    try {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: (response) => {
          if (!response?.credential) {
            onError?.('Google did not return an ID token')
            return
          }

          onSuccess?.(response.credential)
        },

        auto_select: false,
        cancel_on_tap_outside: true
      })

      // Clear any previously rendered button
      buttonRef.current.innerHTML = ''

      // Render Google's official Sign in with Google button
      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 400
        }
      )
    } catch (error) {
      console.error('Google Sign-In initialization failed:', error)
      onError?.('Unable to initialize Google Sign-In')
    }
  }, [isLoaded, onSuccess, onError, disabled])

  if (!isLoaded) {
    return (
      <div
        className={`w-full flex items-center justify-center py-3 ${className}`}
      >
        <span className="text-sm text-gray-400">
          Loading Google Sign-In...
        </span>
      </div>
    )
  }

  return (
    <div
      className={`w-full flex justify-center ${className} ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      <div ref={buttonRef} />
    </div>
  )
}

export default GoogleSignInButton

import React, { useEffect, useRef, useState } from 'react'

const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = 'Sign in with Google',
  className = '',
  disabled = false
}) => {
  const buttonRef = useRef(null)
  const initializedRef = useRef(false)

  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  const [isLoaded, setIsLoaded] = useState(false)

  // Keep latest callbacks without re-running Google initialization
  useEffect(() => {
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  }, [onSuccess, onError])


  // ───── Wait for Google Identity Services ─────

  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google?.accounts?.id) {
        setIsLoaded(true)
        return true
      }

      return false
    }

    if (checkGoogleLoaded()) {
      return
    }

    const interval = setInterval(() => {
      if (checkGoogleLoaded()) {
        clearInterval(interval)
      }
    }, 100)

    const timeout = setTimeout(() => {
      clearInterval(interval)

      if (!window.google?.accounts?.id) {
        onErrorRef.current?.(
          'Google Identity Services failed to load'
        )
      }
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])


  // ───── Initialize Google + render button ─────

  useEffect(() => {
    if (
      !isLoaded ||
      !buttonRef.current ||
      disabled ||
      initializedRef.current
    ) {
      return
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
      onErrorRef.current?.(
        'Google Client ID is not configured'
      )
      return
    }

    try {

      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: (response) => {

          if (!response?.credential) {
            onErrorRef.current?.(
              'Google did not return an ID token'
            )
            return
          }

          onSuccessRef.current?.(
            response.credential
          )
        },

        auto_select: false,
        cancel_on_tap_outside: true
      })


      buttonRef.current.innerHTML = ''


      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: text === 'Sign up with Google'
            ? 'signup_with'
            : 'signin_with',
          shape: 'rectangular',
          width: 400
        }
      )


      initializedRef.current = true

    } catch (error) {

      console.error(
        'Google Sign-In initialization failed:',
        error
      )

      onErrorRef.current?.(
        'Unable to initialize Google Sign-In'
      )
    }

  }, [isLoaded, disabled, text])


  return (
    <div
      className={`w-full flex justify-center ${className} ${
        disabled
          ? 'pointer-events-none opacity-60'
          : ''
      }`}
    >
      {!isLoaded ? (
        <span className="text-sm text-gray-400 py-3">
          Loading Google Sign-In...
        </span>
      ) : (
        <div ref={buttonRef} />
      )}
    </div>
  )
}

export default GoogleSignInButton

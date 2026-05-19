import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../../components/features/auth/LoginForm'

const LoginPage = () => {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to your citizen or staff account
        </p>
      </div>

      <LoginForm />

      <div className="mt-8 space-y-3 text-center text-sm text-muted-foreground">
        <p>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register as a citizen
          </Link>
        </p>
        <p>
          Need to report without an account?{' '}
          <Link
            to="/report"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Guest reporting
          </Link>
        </p>
        <p>
          <Link to="/" className="font-medium hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage

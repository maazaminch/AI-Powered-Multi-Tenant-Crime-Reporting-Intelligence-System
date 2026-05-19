import React from 'react'
import { Link } from 'react-router-dom'
import RegisterForm from '../../components/features/auth/RegisterForm'

const InviteRegisterPage = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Invite Registration</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your private registration using the invite link sent to your email.
        </p>
      </div>

      <RegisterForm />

      <div className="mt-8 space-y-3 text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in here
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

export default InviteRegisterPage

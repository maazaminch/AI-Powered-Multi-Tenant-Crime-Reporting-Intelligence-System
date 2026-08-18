import React, { useState } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/Card'
import { useAuth } from '../../../hooks/auth/useAuth'
import { useNavigate } from 'react-router-dom'
import GoogleSignInButton from './GoogleSignInButton'

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { login, googleLogin, error, clearError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
     try {
      const res = await login(formData)
      const user = res?.data?.user

      if (user.role === 'CITIZEN')
        { navigate('/citizen/dashboard') }
      else if (user.role === 'POLICE')
        { if (user.isStationHead)
          { navigate('/station-head/dashboard') }
        else { navigate('/police/dashboard') } }
      else if (user.role === 'ADMIN')
        { if (user.isSuperAdmin)
          { navigate('/superadmin/dashboard') }
        else { navigate('/admin/dashboard') } }

   }  finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (idToken) => {
    setIsGoogleLoading(true)
    try {
      const res = await googleLogin(idToken)
      const user = res?.data?.user

      if (user.role === 'CITIZEN')
        { navigate('/citizen/dashboard') }
      else if (user.role === 'POLICE')
        { if (user.isStationHead)
          { navigate('/station-head/dashboard') }
        else { navigate('/police/dashboard') } }
      else if (user.role === 'ADMIN')
        { if (user.isSuperAdmin)
          { navigate('/superadmin/dashboard') }
        else { navigate('/admin/dashboard') } }
    } catch (err) {
      console.error('Google login failed:', err)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleError = (errorMessage) => {
    console.error('Google sign-in error:', errorMessage)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
          
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              variant="success"
              type="submit" 
              className="w-full py-2" 
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

            <GoogleSignInButton
            onSuccess={handleGoogleLogin}
            onError={handleGoogleError}
            text="Sign in with Google"
            disabled={isGoogleLoading}
          />

          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm

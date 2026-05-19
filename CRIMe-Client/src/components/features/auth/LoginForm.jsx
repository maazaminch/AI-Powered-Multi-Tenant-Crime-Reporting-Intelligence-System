import React, { useState } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/Card'
import { useAuth } from '../../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { login, error, clearError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
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
          { navigate('/police/station-dashboard') }
        else { navigate('/police/assigned-cases') } }
      else if (user.role === 'ADMIN')
        { if (user.isSuperAdmin)
          { navigate('/superadmin/dashboard') }
        else { navigate('/admin/dashboard') } }

   }  finally {
      setIsLoading(false)
    }
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
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-2" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm

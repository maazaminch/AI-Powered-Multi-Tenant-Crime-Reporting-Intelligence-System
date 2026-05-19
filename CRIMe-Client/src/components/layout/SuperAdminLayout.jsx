import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const SuperAdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/superadmin/dashboard', label: 'Dashboard' },
    { path: '/superadmin/tenants', label: 'Tenants' },
    { path: '/superadmin/admins', label: 'Admins' },
    { path: '/superadmin/pending-requests', label: 'Pending Requests' },
    { path: '/superadmin/analytics', label: 'Analytics' },
    { path: '/superadmin/audit-logs', label: 'Audit Logs' },
    { path: '/superadmin/settings', label: 'Settings' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - attached to header */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="mt-24 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-md transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Header */}
      <header className="bg-black shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 ml-0">
          <div className="flex items-center justify-between">
            {/* Hamburger Button in Header */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors mr-4"
              aria-label="Toggle sidebar"
            >
              {isOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </button>

            <h1 className="text-2xl font-bold text-white">Super Admin Panel</h1>
            
            <nav className="flex space-x-6">
              <Link 
                to="/auth/logout" 
                className="text-white hover:text-gray-300 font-medium transition-colors"
              >
                Logout
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* <footer className="bg-blue-900 text-white bottom-0 left-0 right-0 py-6 px-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Crime Reporting System. All rights reserved.</p>
        </div>
      </footer> */}
    </div>
  )
}

export default SuperAdminLayout

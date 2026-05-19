import React from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }) =>
  cn(
    'font-medium text-white transition-colors hover:text-gray-300',
    isActive && 'text-gray-300 underline underline-offset-4'
  )

const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-black shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="text-2xl font-bold text-white">
              Crime Reporting System
            </Link>

            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/report" className={navLinkClass}>
                Guest Report
              </NavLink>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-blue-900 px-6 py-6 text-white">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Crime Reporting System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout

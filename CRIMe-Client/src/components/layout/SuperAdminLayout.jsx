import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useNotifications } from '../../hooks/notifications/useNotifications'
import { Bell } from 'lucide-react' 

import useAuthStore from '../../store/authStore'

import { Button } from "../ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/Dropdown-menu"

const SuperAdminLayout = () => {
  const { headerNotifications, unreadCount, isLoading } = useNotifications()
  const headerNotificationsList = headerNotifications?.notifications || []

  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/superadmin/dashboard', label: 'Dashboard' },
    { path: '/superadmin/tenants', label: 'Tenants' },
    { path: '/superadmin/admins', label: 'Admins' },
    { path: '/superadmin/pending-requests', label: 'Pending Requests' },
    { path: '/superadmin/system-analytics', label: 'System Analytics' },
    { path: '/superadmin/audit-logs', label: 'Audit Logs' },
    { path: '/superadmin/notifications', label: 'Notifications' }
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 z-30"
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
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {/* Hamburger Button in Header */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-500 rounded-md transition-colors mr-4"
                aria-label="Toggle sidebar"
              >
                {isOpen ? (
                  <X size={24} className="text-white" />
                ) : (
                  <Menu size={24} className="text-white" />
                )}
              </button>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-white">Super Admin Panel</h1>
            </div>

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="relative p-2 bg-white hover:bg-gray-500">
                    <Bell size={20} className="text-black" />
                    {unreadCount?.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                        {unreadCount.unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96" align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  {isLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading notifications...</div>
                  ) : headerNotificationsList.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">No notifications yet.</div>
                  ) : (
                    <div className="max-h-72 space-y-2 overflow-y-auto p-2 cursor-pointer">
                      {headerNotificationsList.map((notification) => (
                        <div key={notification._id} className={`rounded-md border px-3 py-2 ${!notification.isRead ? 'bg-slate-100' : 'bg-white'}`}>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className='cursor-pointer border border-slate-300 hover:bg-gray-900' >
                    <Link to="/superadmin/notifications">View all notifications</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-black bg-white hover:bg-gray-500">My Account</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-500' >
                      Profile
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-500' >
                      Billing
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-500'  >
                      Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-500' >Admins</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Invite Admins</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem className='cursor-pointer hover:bg-gray-500' >Email</DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-500' >Change Password</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className='cursor-pointer hover:bg-gray-500' onSelect={handleLogout}>
                      Log out
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'

// Importing layouts
import PublicLayout from '../components/layout/PublicLayout'
import SuperAdminLayout from '../components/layout/SuperAdminLayout'
import AdminLayout from '../components/layout/AdminLayout'
// import PoliceLayout from '../components/layout/PoliceLayout'
// import CitizenLayout from '../components/layout/CitizenLayout'

// Importing public pages
import HomePage from '../pages/public/HomePage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import InviteRegisterPage from '../pages/public/InviteRegisterPage'
import GuestReportPage from '../pages/public/GuestReportPage'


// Importing SuperAdmin pages
import SuperAdminDashboard from '../pages/superadmin/DashboardPage'
import TenantsPage from '../pages/superadmin/TenantsPage'
import AdminsPage from '../pages/superadmin/AdminsPage'
import PendingRequestsPage from '../pages/superadmin/PendingRequestsPage'
import SystemAnalyticsPage from '../pages/superadmin/SystemAnalyticsPage'
import AuditLogsPage from '../pages/superadmin/AuditLogsPage'
import NotificationsPage from '../pages/superadmin/NotificationsPage'

// Importing Admin pages
import AdminDashboard from '../pages/admin/DashboardPage'

// // Importing Police pages
// import PoliceCases from '../pages/police/AssignedCasesPage'

// // Importing Citizen pages
// import CitizenDashboard from '../pages/citizen/DashboardPage'

// // Importing Unauthorized page
// import Unauthorized from '../pages/UnauthorizedPage'






// Placeholder pages for now
const CitizenDashboard = () => (
  <div className="min-h-screen bg-background p-8">
    <h1 className="text-2xl font-bold">Citizen Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome, Citizen!</p>
  </div>
)

const PoliceCases = () => (
  <div className="min-h-screen bg-background p-8">
    <h1 className="text-2xl font-bold">Police Assigned Cases</h1>
    <p className="text-gray-600 mt-2">No cases assigned yet.</p>
  </div>
)

// const AdminDashboard = () => (
//   <div className="min-h-screen bg-background p-8">
//     <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//     <p className="text-gray-600 mt-2">Admin panel working</p>
//   </div>
// )

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
      <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
    </div>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'register/invite',
        element: <InviteRegisterPage />
      },
      {
        path: 'report',
        element: <GuestReportPage />
      }
    ]
  },
  {
    path: '/superadmin/*',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']} requiredFlags={{ isSuperAdmin: true }}>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <SuperAdminDashboard />
      },
      {
        path: 'tenants',
        element: <TenantsPage />
      },
      {
        path: 'admins',
        element: <AdminsPage />
      },
      {
        path: 'pending-requests',
        element: <PendingRequestsPage />
      },
      {
        path: 'system-analytics',
        element: <SystemAnalyticsPage />
      },
      {
        path: 'audit-logs',
        element: <AuditLogsPage />
      },
      {
        path: 'notifications',
        element: <NotificationsPage />
      }
    ]
  },
    {
    path: '/admin/*',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']} requiredFlags={{ isSuperAdmin: false }}>
        <AdminLayout />
       </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />
      },
      //  {
      //   path: 'police-stations',
      //   element: <PoliceStationsPage />
      // },
      // {
      //   path: 'station-heads',
      //   element: <StationHeadsPage />
      // },
      // {
      //   path: 'pending-requests',
      //   element: <PendingRequestsPage />
      // },
      // {
      //   path: 'system-analytics',
      //   element: <SystemAnalyticsPage />
      // },
      // {
      //   path: 'audit-logs',
      //   element: <AuditLogsPage />
      // },
      // {
      //   path: 'notifications',
      //   element: <NotificationsPage />
      // }
    ]
  },
  {
    path: '/citizen/*',
    element: (
      <ProtectedRoute allowedRoles={['CITIZEN']}>
        <div className="min-h-screen bg-background">Citizen Layout</div>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <CitizenDashboard />
      }
    ]
  },
  {
    path: '/police/*',
    element: (
      <ProtectedRoute allowedRoles={['POLICE']}>
        <div className="min-h-screen bg-background">Police Layout</div>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'assigned-cases',
        element: <PoliceCases />
      }
    ]
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  }
])

export const AppRouter = () => <RouterProvider router={router} />

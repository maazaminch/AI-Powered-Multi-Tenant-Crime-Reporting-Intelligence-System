import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'

// Importing layouts
import PublicLayout from '../components/layout/PublicLayout'
import SuperAdminLayout from '../components/layout/SuperAdminLayout'
import AdminLayout from '../components/layout/AdminLayout'
import StationHeadLayout from '../components/layout/StationHeadLayout'
import PoliceLayout from '../components/layout/PoliceLayout'
import CitizenLayout from '../components/layout/CitizenLayout'

// Importing public pages
import HomePage from '../pages/public/HomePage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import InviteRegisterPage from '../pages/public/InviteRegisterPage'

// Importing public guest pages
import PublicReportPage from '../pages/public-content/PublicReportPage'
import PublicSuccessPage from '../pages/public-content/PublicSuccessPage'
import PublicTrackPage from '../pages/public-content/PublicTrackPage'
import PublicCaseDetailsPage from '../pages/public-content/PublicCaseDetailsPage'

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
import PoliceStationsPage from '../pages/admin/PoliceStationsPage'
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage'
import PendingPolicePage from '../pages/admin/PendingPolicePage'
import PoliceManagementPage from '../pages/admin/PoliceManagementPage'
import TenantAnalyticsPage from '../pages/admin/TenantAnalyticsPage'
import TenantCasesPage from '../pages/admin/TenantCasesPage'
import AdminCaseDetailsPage from '../pages/admin/CaseDetailsPage'
import AdminAuditLogsPage from '../pages/admin/AuditLogsPage'

// Importing StationHead pages
import StationHeadDashboard from '../pages/station-head/DashboardPage'
import StationPolicePage from '../pages/station-head/StationPolicePage'
import StationCasesPage from '../pages/station-head/StationCasesPage'
import CaseDetailsPage from '../pages/station-head/CaseDetailsPage'
import StationAnalyticsPage from '../pages/station-head/StationAnalyticsPage'
import StationHeadNotificationPage from '../pages/station-head/StationHeadNotificationPage'

// Importing Police pages
import PoliceDashboard from '../pages/police/DashboardPage'
import PoliceCasesPage from '../pages/police/CasesPage'
import PoliceCaseDetailsPage from '../pages/police/CaseDetailsPage'
import PoliceNotificationPage from '../pages/police/PoliceNotificationPage'

// Importing Citizen pages
import CitizenDashboard from '../pages/citizen/DashboardPage'
import CitizenCasesPage from '../pages/citizen/CitizenCasesPage'
import CitizenCaseDetailsPage from '../pages/citizen/CaseDetailsPage'
import CitizenNotificationsPage from '../pages/citizen/CitizenNotificationPage'
import ReportCasePage from '../pages/citizen/ReportCasePage'



// // Importing Unauthorized page
// import Unauthorized from '../pages/UnauthorizedPage'






// Placeholder pages for now
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
        element: <PublicReportPage />
      },
      {
        path: 'public/report',
        element: <PublicReportPage />
      },
      {
        path: 'public/success',
        element: <PublicSuccessPage />
      },
      {
        path: 'public/track',
        element: <PublicTrackPage />
      },
      {
        path: 'public/case-details/:caseId',
        element: <PublicCaseDetailsPage />
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
       {
        path: 'police-stations',
        element: <PoliceStationsPage />
      },
      {
        path: 'police-management',
        element: <PoliceManagementPage />
      },
      {
        path: 'pending-police',
        element: <PendingPolicePage />
      },
      {
        path: 'tenant-cases',
        element: <TenantCasesPage />
      },
      {
        path: 'case-details/:caseId',
        element: <AdminCaseDetailsPage />
      },
      {
        path: 'tenant-analytics',
        element: <TenantAnalyticsPage />
      },
      {
        path: 'audit-logs',
        element: <AdminAuditLogsPage />
      },
      {
        path: 'notifications',
        element: <AdminNotificationsPage />
      }
    ]
  },
  {
    path: '/station-head/*',
    element: (
      <ProtectedRoute allowedRoles={['POLICE']} requiredFlags={{ isStationHead: true }}>
        <StationHeadLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <StationHeadDashboard />
      },
      {
        path: 'station-police',
        element: <StationPolicePage />
      },
      {
        path: 'station-cases',
        element: <StationCasesPage />
      },
      {
        path: 'case-details/:caseId',
        element: <CaseDetailsPage />
      },
      {
        path: 'station-analytics',
        element: <StationAnalyticsPage/>
      },
      {
        path: 'notifications',
        element: <StationHeadNotificationPage />
      }
    ]
  },
  {
    path: '/police/*',
    element: (
      <ProtectedRoute allowedRoles={['POLICE']} requiredFlags={{ isStationHead: false }}>
        <PoliceLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <PoliceDashboard />
      },
      {
        path: 'cases',
        element: <PoliceCasesPage />
      },
      {
        path: 'case-details/:caseId',
        element: <PoliceCaseDetailsPage />
      },
      {
        path: 'notifications',
        element: <PoliceNotificationPage />
      }
    ]
  },
  {
    path: '/citizen/*',
    element: (
      <ProtectedRoute allowedRoles={['CITIZEN']}>
        <CitizenLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <CitizenDashboard />
      },
      {
        path: 'cases',
        element: <CitizenCasesPage />
      },
      {
        path: 'report-case',
        element: <ReportCasePage />
      },
      {
        path: 'case-details/:caseId',
        element: <CitizenCaseDetailsPage />
      },
      {
        path: 'notifications',
        element: <CitizenNotificationsPage />
      }
    ]
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  }
])

export const AppRouter = () => <RouterProvider router={router} />

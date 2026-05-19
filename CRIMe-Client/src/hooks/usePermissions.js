import useAuthStore from '../store/authStore'

export const usePermissions = () => {
  const { user, isCitizen, isPolice, isAdmin, isSuperAdmin, isStationHead } = useAuthStore()

  // Permission checks
  const canCreateCase = isCitizen()
  const canViewOwnCases = isCitizen()
  const canInvestigateCases = isPolice()
  const canAssignCases = isStationHead()
  const canManageUsers = isAdmin()
  const canManageStations = isAdmin()
  const canManageTenants = isSuperAdmin()
  const canApproveUsers = isAdmin() || isSuperAdmin()
  const canAssignStationHead = isAdmin()
  const canViewAllCases = isAdmin() || isStationHead()
  const canCloseCases = isAdmin()

  // Route permissions
  const canAccessCitizenRoutes = isCitizen()
  const canAccessPoliceRoutes = isPolice()
  const canAccessAdminRoutes = isAdmin()
  const canAccessSuperAdminRoutes = isSuperAdmin()
  const canAccessStationHeadRoutes = isStationHead()

  return {
    // User info
    user,
    userRole: user?.role,

    // Basic permissions
    canCreateCase,
    canViewOwnCases,
    canInvestigateCases,
    canAssignCases,
    canManageUsers,
    canManageStations,
    canManageTenants,
    canApproveUsers,
    canAssignStationHead,
    canViewAllCases,
    canCloseCases,

    // Route permissions
    canAccessCitizenRoutes,
    canAccessPoliceRoutes,
    canAccessAdminRoutes,
    canAccessSuperAdminRoutes,
    canAccessStationHeadRoutes,

    // Role checks
    isCitizen: isCitizen(),
    isPolice: isPolice(),
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    isStationHead: isStationHead(),

    // Tenant info
    tenantId: user?.tenantId,
    policeStationId: user?.policeStationId
  }
}

export default usePermissions

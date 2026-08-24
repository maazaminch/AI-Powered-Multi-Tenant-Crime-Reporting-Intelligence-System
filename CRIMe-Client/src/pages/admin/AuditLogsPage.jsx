import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuditLogs, useAuditStats } from '../../hooks/auditLog/useAuditLog'
import { useUsers } from '../../hooks/user/useUsers'
import AuditFilters from '../../components/features/auditLog/AuditFilters'
import AuditTable from '../../components/features/auditLog/AuditTable'
import AuditStats from '../../components/features/auditLog/AuditStats'

import { 
  Shield, 
  Building, 
  Activity
} from 'lucide-react'

const AdminAuditLogsPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    search: '',
    action: '',
    targetType: '',
    userId: '',
    startDate: '',
    endDate: '',
    severity: ''
  })

  const { logs, pagination, isLoading, error, refetch } = useAuditLogs(filters)
  const { stats, isLoading: statsLoading } = useAuditStats()
  const { users, isLoading: usersLoading } = useUsers()

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ 
      ...prev, 
      [key]: value,
      page: 1 // Reset to page 1 when filters change
    }))
  }

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      search: '',
      action: '',
      targetType: '',
      userId: '',
      startDate: '',
      endDate: '',
      severity: ''
    })
  }

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Building className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Tenant Audit Logs</CardTitle>
              <CardDescription className="text-slate-600">
                Monitor activities within your tenant. Track user actions, security events, and system changes for your organization.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <AuditStats stats={stats} isLoading={statsLoading} />

      {/* Filters */}
      <AuditFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        users={users}
      />

      {/* Audit Logs Table */}
      <AuditTable 
        logs={logs}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        onPageChange={handlePageChange}
        onRefetch={refetch}
      />

      {/* Info Card */}
      <Card className="border border-slate-200 bg-indigo-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">Tenant Audit Information</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                These audit logs show all activities within your tenant only. Use the filters to focus on specific users, actions, or time periods. 
                Regular audit trails help maintain security compliance and provide accountability for all system changes within your organization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminAuditLogsPage
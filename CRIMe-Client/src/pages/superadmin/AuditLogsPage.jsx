import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuditLogs, useAuditStats } from '../../hooks/auditLog/useAuditLog'
import AuditFilters from '../../components/features/auditLog/AuditFilters'
import AuditTable from '../../components/features/auditLog/AuditTable'
import AuditStats from '../../components/features/auditLog/AuditStats'

import { 
  Shield, 
  FileText, 
  Activity
} from 'lucide-react'

const AuditLogsPage = () => {
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
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">System Audit Logs</CardTitle>
              <CardDescription className="text-slate-600">
                Monitor all system activities across all tenants. Track user actions, security events, and system changes.
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
      <Card className="border border-slate-200 bg-blue-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">Audit Log Information</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Audit logs provide a comprehensive trail of all system activities. As a Super Admin, you have access to logs from all tenants. 
                Use the filters above to narrow down specific actions, time periods, or sensitivity levels. 
                Logs are automatically retained according to system policy and can be exported for compliance purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuditLogsPage
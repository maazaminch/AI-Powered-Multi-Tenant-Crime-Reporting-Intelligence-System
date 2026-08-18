import React from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { formatDateTime } from '../../../lib/utils'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import Loader from '../../ui/feedback/Loader'
import ErrorState from '../../ui/feedback/ErrorState'
import NoData from '../../ui/feedback/NoData'

const AuditTable = ({ logs, pagination, isLoading, error, onPageChange, onRefetch }) => {
  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'UPDATE': 'bg-blue-100 text-blue-800 border-blue-200',
      'DELETE': 'bg-red-100 text-red-800 border-red-200',
      'LOGIN': 'bg-purple-100 text-purple-800 border-purple-200',
      'LOGOUT': 'bg-slate-100 text-slate-800 border-slate-200',
      'UPLOAD': 'bg-amber-100 text-amber-800 border-amber-200',
      'DOWNLOAD': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'VIEW': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
    return colors[action] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  const getSensitivityColor = (sensitivity) => {
    const colors = {
      'PUBLIC': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'INTERNAL': 'bg-blue-100 text-blue-800 border-blue-200',
      'CONFIDENTIAL': 'bg-amber-100 text-amber-800 border-amber-200',
      'RESTRICTED': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[sensitivity] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  const getSuccessVariant = (success) => {
    return success ? 'success' : 'destructive'
  }

  if (isLoading) {
    return (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <Loader text="Loading audit logs..." fullScreen={false} />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <ErrorState title="Error loading audit logs" />
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <NoData message="No audit logs found" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Audit Logs</h3>
          <Button
            onClick={onRefetch}
            variant="outline"
            size="sm"
            className="border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Timestamp</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Action</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Target</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">User</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Sensitivity</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">IP Address</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-sm text-slate-600 font-mono">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="p-3">
                    <Badge className={`text-xs font-medium border ${getActionColor(log.action)}`}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-medium">{log.targetType}</span>
                      {log.targetName && (
                        <span className="text-xs text-slate-500">{log.targetName}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {log.actor.userId?.name || 'Guest'}
                      </span>
                      {log.actor.userId?.email && (
                        <span className="text-xs text-slate-500">{log.actor.userId.email}</span>
                      )}
                      {log.actor.role && (
                        <Badge variant="outline" className="text-xs mt-1 w-fit">
                          {log.actor.role}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={`text-xs font-medium border ${getSensitivityColor(log.sensitivity)}`}>
                      {log.sensitivity}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={getSuccessVariant(log.success)} className="text-xs font-medium">
                      {log.success ? 'Success' : 'Failed'}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-slate-600 font-mono">
                    {log.ipAddress}
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {log.duration ? `${log.duration}ms` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {pagination.currentPage} of {pagination.totalPages} pages 
            ({pagination.total} total logs)
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuditTable
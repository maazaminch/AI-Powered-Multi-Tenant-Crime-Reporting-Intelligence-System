import React, { useState } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Search, Filter, X } from 'lucide-react'
import SearchDropdown from '../../common/SearchDropdown'

const AuditFilters = ({ filters, onFilterChange, onReset, users = [] }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'UPLOAD']
  const targetTypes = ['CASE', 'CASE_UPDATE', 'EVIDENCE', 'USER', 'TENANT', 'POLICE_STATION', 'AUTH', 'PROFILE-UPDATE']
  const sensitivities = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']

  // Convert users to dropdown options - only include users with fullName
  const userOptions = users
    .filter(user => user?.fullName)
    .map(user => ({
      value: user._id,
      label: user.fullName
    }))

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by user name, email, action, case ID, or target..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 border-slate-300 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
                <SearchDropdown
                  value={filters.userId}
                  onChange={(value) => onFilterChange('userId', value)}
                  options={userOptions}
                  placeholder="All Users"
                  searchPlaceholder="Search users..."
                  emptyMessage="No users found"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => onFilterChange('action', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Actions</option>
                  {actions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Type</label>
                <select
                  value={filters.targetType}
                  onChange={(e) => onFilterChange('targetType', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Target Types</option>
                  {targetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sensitivity</label>
                <select
                  value={filters.sensitivity}
                  onChange={(e) => onFilterChange('sensitivity', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Sensitivity Levels</option>
                  {sensitivities.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFilterChange('startDate', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFilterChange('endDate', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={onReset}
                  variant="outline"
                  className="w-full h-10 border-slate-300 hover:bg-slate-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AuditFilters
import React from 'react'
import { useNavigate } from "react-router-dom"
import { useDashboardStats } from '../../hooks/admin/useDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import StatCard from '../../components/common/StatCard'
import Loader from '../../components/ui/feedback/Loader'
import ErrorState from '../../components/ui/feedback/ErrorState'
import { useRecentActivity } from '../../hooks/auditLog/useAuditLog'


const AdminDashboard = () => {

  const { dashboardStats, isLoading, error } = useDashboardStats()
  const navigate = useNavigate()


    const {recentActivities, isLoading: isLoadingActivity, error: errorActivity} = useRecentActivity()
  
  
    function formatRelativeTime(date) {
    const diff = (Date.now() - new Date(date)) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(date).toLocaleDateString()
  }


  return (
    <div className="space-y-6" >
      {/* System Overview */}
      <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{dashboardStats?.tenant?.name} - {dashboardStats?.tenant?.type}</CardTitle>

        <CardDescription>
          Overview of all Police Stations and Tenant performance
        </CardDescription>
      </CardHeader>

       <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          <StatCard
            title="Total Police Stations"
            value={dashboardStats?.totalPoliceStations ?? '...'}
            color="text-white"
            bg="bg-indigo-900"
            path="/admin/police-stations"
          />

          <StatCard
            title="Active Police"
            value={dashboardStats?.approvedPolice ?? '...'}
            color="text-white"
            bg="bg-emerald-900"
            path="/admin/police-management"
          />

          <StatCard
            title="Pending Requests"
            value={dashboardStats?.pendingPolice ?? '...'}
            color="text-white"
            bg="bg-amber-900"
            path="/admin/pending-police"
          />

          <StatCard
            title="Total Cases"
            value={dashboardStats?.totalCases ?? '...'}
            color="text-white"
            bg="bg-rose-900"
            path="/admin/cases"
          />

        </div>
      </CardContent>
    </Card>

      {/* Quick Actions */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="success"
              className="w-full"
              onClick={() =>
                navigate("/admin/police-stations", {
                  state: { openCreateModal: true },
                })
              }
            >
              Create New Police Station
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/pending-police')}
            >
              View Pending Police
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/tenant-analytics')}
            >
              Tenant Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {isLoadingActivity ? (
        <Loader
          text='Loading recent activities...'
          size='md'
        />
      ) : errorActivity ? (
        <ErrorState
          title="Failed to load recent activities"
          description={errorActivity.message}
        />
      ) : (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system events and actions
          </CardDescription>
        </CardHeader>
         <CardContent className="space-y-1">
          {recentActivities?.length > 0 ? (
            recentActivities.map((log) => (
              <div key={log._id} className="flex items-start gap-3 py-3 border-b last:border-0">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.success ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {log.targetType} - {log.action.replace(/_/g, ' ')} 
                  </p>
                  <p className="text-xs text-slate-500">
                    {log.actor.userId.fullName} - {log.actor?.role || 'System'}
          
                  </p>
                </div>
                <p className="text-xs text-slate-400">{log.description}</p>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatRelativeTime(log.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">No recent activity</p>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  )
}

export default AdminDashboard

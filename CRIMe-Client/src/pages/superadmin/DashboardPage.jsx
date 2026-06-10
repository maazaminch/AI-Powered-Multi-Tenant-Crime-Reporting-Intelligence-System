import React from 'react'
import { useNavigate } from "react-router-dom"
import { useDashboardStats } from '../../hooks/superadmin/useDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'


function StatCard({
  title,
  value,
  color,
  bg,
  path,
}) {
    const navigate = useNavigate()
  return (
    <Card
      onClick={() => navigate(path)}
      className={`cursor-pointer transition hover:shadow-lg ${bg}`}
    >
      <CardContent className="flex flex-col items-center justify-center p-6">
        <h2 className={`text-3xl font-bold ${color}`}>
          {value}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {title}
        </p>
      </CardContent>
    </Card>
  )
}

const SuperAdminDashboard = () => {

  const { stats, isLoading, error } = useDashboardStats()
  const navigate = useNavigate()

  return (
    <div className="space-y-6" >
      {/* System Overview */}
      <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>System Overview</CardTitle>

        <CardDescription>
          Overview of all tenants and system performance
        </CardDescription>
      </CardHeader>

       <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          <StatCard
            title="Total Tenants"
            value={stats?.totalTenants ?? '...'}
            color="text-blue-600"
            bg="bg-blue-50"
            path="/superadmin/tenants"
          />

          <StatCard
            title="Active Admins"
            value={stats?.approvedAdmins ?? '...'}
            color="text-green-600"
            bg="bg-green-50"
            path="/superadmin/admins"
          />

          <StatCard
            title="Pending Requests"
            value={stats?.pendingAdmins ?? '...'}
            color="text-yellow-600"
            bg="bg-yellow-50"
            path="/superadmin/pending-requests"
          />

          <StatCard
            title="Total Cases"
            value={stats?.totalCases ?? '...'}
            color="text-purple-600"
            bg="bg-purple-50"
            path="/super-admin/cases"
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
                navigate("/superadmin/tenants", {
                  state: { openCreateModal: true },
                })
              }
            >
              Create New Tenant
            </Button>
            <Button variant="outline" className="w-full"
              onClick={() => navigate('/superadmin/pending-requests')}
            >
              View Pending Admins
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/superadmin/system-analytics')}
            >
              System Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system events and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">No recent activity</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuperAdminDashboard

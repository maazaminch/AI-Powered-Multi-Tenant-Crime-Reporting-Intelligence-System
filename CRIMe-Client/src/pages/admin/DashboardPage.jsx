import React from 'react'
import { useNavigate } from "react-router-dom"
import { useDashboardStats } from '../../hooks/admin/useDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import StatCard from '../../components/common/StatCard'



const AdminDashboard = () => {

  const { dashboardStats, isLoading, error } = useDashboardStats()
  const navigate = useNavigate()

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

export default AdminDashboard

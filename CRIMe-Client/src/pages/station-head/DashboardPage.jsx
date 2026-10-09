import React from 'react'
import { useNavigate } from "react-router-dom"
import { useDashboard } from '../../hooks/stationHead/useDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

import StatCard from '../../components/common/StatCard'
import Loader from '../../components/ui/feedback/Loader'
import ErrorState from '../../components/ui/feedback/ErrorState'

const StationHeadDashboard = () => {

  const { stats, isLoading, error } = useDashboard()
  const navigate = useNavigate()

    if(isLoading) {
      return (
        <Loader 
          text="Loading dashboard..."
          fullScreen
        />
      )
    }
  
    if(error) {
      return (
        <ErrorState 
          title="Failed to load dashboard."
          description="Please try again later."
        />
      )
    }

  return (
    <div className="space-y-6" >
      {/* System Overview */}
      <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{stats?.policeStation?.name}</CardTitle>

        <CardDescription>
          Overview of your station and cases
        </CardDescription>
      </CardHeader>

       <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          <StatCard
            title="Station Police"
            value={stats?.stationPolice ?? '...'}
            color="text-white"
            bg="bg-indigo-900 hover:bg-indigo-700"
            path="/station-head/station-police"
          />

          <StatCard
            title="Total Cases"
            value={stats?.totalCases ?? '...'}
            color="text-white"
            bg="bg-emerald-900 hover:bg-emerald-700"
            path="/station-head/station-cases"
          />

          <StatCard
            title="Pending Cases"
            value={stats?.pendingCases ?? '...'}
            color="text-white"
            bg="bg-amber-900 hover:bg-amber-700"
            path="/station-head/station-cases"
          />

          <StatCard
            title="Under Investigation Cases"
            value={stats?.underInvestigationCases ?? '...'}
            color="text-white"
            bg="bg-rose-900 hover:bg-rose-700"
            path="/station-head/station-cases"
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
                navigate("/station-head/station-police")
              }
            >
              Station Police
            </Button>
            <Button variant="outline" className="w-full"
              onClick={() => navigate('/station-head/station-cases')}
            >
              Station Cases
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/station-head/station-analytics')}
            >
              Station Analytics
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

export default StationHeadDashboard

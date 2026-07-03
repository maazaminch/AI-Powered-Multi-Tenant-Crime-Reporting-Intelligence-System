import React from 'react'
import { useNavigate } from "react-router-dom"
import { useDashboard } from '../../hooks/stationHead/useDashboard'
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

const StationHeadDashboard = () => {

  const { stats, isLoading, error } = useDashboard()
  const navigate = useNavigate()

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
            color="text-blue-600"
            bg="bg-blue-50"
            path="/station-head/station-police"
          />

          <StatCard
            title="Total Cases"
            value={stats?.totalCases ?? '...'}
            color="text-green-600"
            bg="bg-green-50"
            path="/station-head/station-cases"
          />

          <StatCard
            title="Pending Cases"
            value={stats?.pendingCases ?? '...'}
            color="text-yellow-600"
            bg="bg-yellow-50"
            path="/station-head/pending-cases"
          />

          <StatCard
            title="Under Investigation Cases"
            value={stats?.underInvestigationCases ?? '...'}
            color="text-purple-600"
            bg="bg-purple-50"
            path="/station-head/under-investigation-cases"
          />

          <StatCard
            title="Resolved Cases"
            value={stats?.resolvedCases ?? '...'}
            color="text-purple-600"
            bg="bg-purple-50"
            path="/station-head/resolved-cases"
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

import React from 'react'
import { useNavigate } from "react-router-dom"
import { motion } from 'framer-motion'
import { useDashboard } from '../../hooks/citizen/useDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import Loader from '../../components/ui/feedback/Loader'
import ErrorState from '../../components/ui/feedback/ErrorState'
import NoData from '../../components/ui/feedback/NoData'
import StatCard from '../../components/common/StatCard'

import { 
  Briefcase, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Bell,
  FileText
} from 'lucide-react'


const CitizenDashboard = () => {

  const { stats, isLoading, error } = useDashboard()
  const navigate = useNavigate()

  if (isLoading) {
    return <Loader text="Loading dashboard..." fullScreen />
  }

  if (error) {
    return (
      <ErrorState 
        title="Failed to load dashboard"
        description={error?.message || "Please try again later"}
        fullScreen
      />
    )
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* System Overview */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Citizen Dashboard
            </CardTitle>
            <CardDescription>
              Overview of your cases
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              
              <StatCard
                title="Pending Cases"
                value={stats?.pendingCases ?? '...'}
                color="text-white"
                bg="bg-indigo-900"
                path="/citizen/cases"
                icon={Clock}
              />

              <StatCard
                title="Assigned Cases"
                value={stats?.assignedCases ?? '...'}
                color="text-white"
                bg="bg-emerald-900"
                path="/citizen/cases"
                icon={Briefcase}
              />

              <StatCard
                title="Under Investigation"
                value={stats?.underInvestigationCases ?? '...'}
                color="text-white"
                bg="bg-amber-900"
                path="/citizen/cases"
                icon={Clock}
              />

              <StatCard
                title="Resolved Cases"
                value={stats?.resolvedCases ?? '...'}
                color="text-white"
                bg="bg-rose-900"
                path="/citizen/cases"
                icon={CheckCircle}
              />


            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="success"
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => navigate("/citizen/cases")}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  My Cases
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-semibold border-2"
                  onClick={() => navigate('/citizen/notifications')}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest system events and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  No recent activity
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default CitizenDashboard

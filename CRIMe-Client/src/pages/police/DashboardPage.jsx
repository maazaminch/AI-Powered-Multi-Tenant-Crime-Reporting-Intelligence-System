import React from 'react'
import { useNavigate } from "react-router-dom"
import { motion } from 'framer-motion'
import { useDashboard } from '../../hooks/police/useDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  Briefcase, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Bell,
  FileText
} from 'lucide-react'


function StatCard({
  title,
  value,
  color,
  bg,
  path,
  icon: Icon
}) {
  const navigate = useNavigate()
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={() => navigate(path)}
        className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${bg} border-2`}
      >
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Icon className={`w-8 h-8 mb-2 ${color}`} />
          <h2 className={`text-4xl font-bold ${color}`}>
            {value}
          </h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {title}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const PoliceDashboard = () => {

  const { stats, isLoading, error } = useDashboard()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </motion.div>
    )
  }

  if(error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Error loading dashboard</p>
        </div>
      </motion.div>
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
              {stats?.station?.name}
            </CardTitle>
            <CardDescription>
              Overview of your assigned cases and performance
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              
              <StatCard
                title="Assigned Cases"
                value={stats?.assignedCases ?? '...'}
                color="text-blue-600"
                bg="bg-blue-50 hover:bg-blue-100"
                path="/police/cases"
                icon={Briefcase}
              />

              <StatCard
                title="Under Investigation"
                value={stats?.underInvestigationCases ?? '...'}
                color="text-orange-600"
                bg="bg-orange-50 hover:bg-orange-100"
                path="/police/cases?status=UNDER_INVESTIGATION"
                icon={Clock}
              />

              <StatCard
                title="Resolved Cases"
                value={stats?.resolvedCases ?? '...'}
                color="text-green-600"
                bg="bg-green-50 hover:bg-green-100"
                path="/police/cases?status=RESOLVED"
                icon={CheckCircle}
              />

              <StatCard
                title="Resolution Rate"
                value={`${stats?.resolutionRate ?? '...'}%`}
                color="text-purple-600"
                bg="bg-purple-50 hover:bg-purple-100"
                path="/police/cases"
                icon={TrendingUp}
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
                  onClick={() => navigate("/police/cases")}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  My Cases
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-semibold border-2"
                  onClick={() => navigate('/police/notifications')}
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

export default PoliceDashboard

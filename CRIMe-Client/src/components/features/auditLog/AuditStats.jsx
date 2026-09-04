import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Activity, AlertTriangle, Clock, Users, Shield, Zap } from 'lucide-react'
import Loader from '../../ui/feedback/Loader'
import NoData from '../../ui/feedback/NoData'


const AuditStats = ({ stats, isLoading }) => {

  const errorRate = stats.errorRate !== undefined 
    ? Math.round(stats.errorRate) 
    : 0

  const statCards = [
    {
      title: 'Total Logs',
      value: stats.totalLogs || 0,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Error Rate',
      value: `${errorRate}%`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100'
    },
    {
      title: 'Recent Activity (24h)',
      value: stats.recentLogs || 0,
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Error Logs',
      value: stats.errorLogs || 0,
      icon: Shield,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card 
            key={index} 
            className={`border ${stat.borderColor} ${stat.bg} shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color} leading-tight`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default AuditStats
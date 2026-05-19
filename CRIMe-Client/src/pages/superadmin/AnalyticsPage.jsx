import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Analytics</CardTitle>
          <CardDescription>
            System-wide analytics and reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Analytics dashboard will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage

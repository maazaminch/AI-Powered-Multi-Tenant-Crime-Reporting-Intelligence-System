import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

const AuditLogsPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            System audit trails and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Audit logs will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuditLogsPage

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/Card'
import { Button } from '../../../ui/Button'
import { Badge } from '../../../ui/Badge'
import { Badge as BadgeIcon, Calendar, Mail, Phone, AlertCircle, ArrowRight, X } from 'lucide-react'

const StationPoliceDetailsModal = ({ open, policeDetails, isLoading, error, onClose }) => {
  
  if(!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Officer Details</h2>
            <p className="text-muted-foreground">{policeDetails?.officer?.fullName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground">Failed to load officer details</p>
            </div>
          ) : policeDetails ? (
            <>
              {/* Officer Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <BadgeIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Badge Number</p>
                        <p className="font-medium">{policeDetails.officer.badgeNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Join Date</p>
                        <p className="font-medium">
                          {new Date(policeDetails.officer.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">{policeDetails.officer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{policeDetails.officer.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All-Time Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All-Time Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-700">{policeDetails.allTimeStats.totalAssigned}</p>
                      <p className="text-sm text-blue-600 mt-1">Total Assigned</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-700">{policeDetails.allTimeStats.totalResolved}</p>
                      <p className="text-sm text-green-600 mt-1">Total Resolved</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-700">{policeDetails.allTimeStats.totalClosed}</p>
                      <p className="text-sm text-purple-600 mt-1">Total Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Cases</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {policeDetails.activeCases.length} cases currently assigned
                  </p>
                </CardHeader>
                <CardContent>
                  {policeDetails.activeCases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active cases
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {policeDetails.activeCases.map((caseItem) => (
                        <div
                          key={caseItem._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => onCaseClick(caseItem._id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{caseItem.caseId}</p>
                              <p className="text-sm text-muted-foreground">{caseItem.crimeType}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={
                                caseItem.status === 'ASSIGNED' ? 'default' : 
                                caseItem.status === 'UNDER_INVESTIGATION' ? 'warning' : 'secondary'
                              }
                            >
                              {caseItem.status.replace('_', ' ')}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default StationPoliceDetailsModal

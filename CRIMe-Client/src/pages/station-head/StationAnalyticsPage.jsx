import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Calendar, TrendingUp, Users, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useStationAnalytics } from "../../hooks/stationHead/useStationAnalytics";
import { formatError } from "../../lib/utils";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

const SEVERITY_COLORS = {
  LOW: "#10B981",
  MEDIUM: "#F59E0B",
  HIGH: "#F97316",
  CRITICAL: "#EF4444"
};

const StationAnalyticsPage = () => {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [period, setPeriod] = useState('daily');
  
  const { analytics, isLoading, error, refetch } = useStationAnalytics({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    period
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{formatError(error)}</p>
        </div>
      </div>
    );
  }

  const { overview, crimeTypeBreakdown, severityDistribution, policePerformance, timeTrends } = analytics;

  // Data mapping for charts
  const crimeTypePieData = crimeTypeBreakdown?.map((item, index) => ({
    name: item.crimeType.replace(/_/g, ' '),
    value: item.count,
    percentage: item.percentage,
    fill: COLORS[index % COLORS.length]
  })) || [];

  const severityBarData = severityDistribution?.map(item => ({
    name: item.severity || 'Unknown',
    value: item.count,
    percentage: item.percentage,
    fill: SEVERITY_COLORS[item.severity] || '#3B82F6'
  })) || [];

  const timeTrendData = timeTrends?.map(item => ({
    date: item.date,
    totalCases: item.totalCases,
    resolvedCases: item.resolvedCases
  })) || [];

  const handleDateFilter = () => {
    refetch();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Station Overview</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Monitor your station's case performance, police efficiency, and crime trends.
          </p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-md text-sm"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
          <Button onClick={handleDateFilter}>Apply</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{overview?.totalCases || 0}</p>
            <p className="mt-1 text-xs text-slate-500">All time cases</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{overview?.pendingCases || 0}</p>
            <p className="mt-1 text-xs text-slate-500">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Under Investigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{overview?.underInvestigationCases || 0}</p>
            <p className="mt-1 text-xs text-slate-500">Active investigations</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{overview?.resolvedCases || 0}</p>
            <p className="mt-1 text-xs text-slate-500">Successfully resolved</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Total Police
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{overview?.totalPolice || 0}</p>
            <p className="mt-1 text-xs text-slate-500">{overview?.activePolice || 0} active officers</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cyan-600">{overview?.resolutionRate || 0}%</p>
            <p className="mt-1 text-xs text-slate-500">Success rate</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Avg Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{overview?.avgResolutionTime || 0}d</p>
            <p className="mt-1 text-xs text-slate-500">Average days to resolve</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              Assigned Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-700">{overview?.assignedCases || 0}</p>
            <p className="mt-1 text-xs text-slate-500">Currently assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crime Type Breakdown */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Crime Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {crimeTypePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={crimeTypePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Tooltip />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No crime data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {severityBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={severityBarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No severity data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Trends */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Case Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {timeTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={timeTrendData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalCases" stroke="#3B82F6" strokeWidth={2} name="Total Cases" />
                <Line type="monotone" dataKey="resolvedCases" stroke="#10B981" strokeWidth={2} name="Resolved Cases" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Police Performance Table */}
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Police Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {policePerformance && policePerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Officer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Badge</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Assigned</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Resolved</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {policePerformance.map((officer, index) => (
                    <tr key={officer.policeId} className={index !== policePerformance.length - 1 ? "border-b border-slate-100" : ""}>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{officer.fullName}</p>
                          <p className="text-xs text-slate-500">{officer.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{officer.badgeNumber}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {officer.totalAssigned}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {officer.resolved}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge 
                          variant="outline" 
                          className={
                            officer.resolutionRate >= 80 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : officer.resolutionRate >= 50
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {officer.resolutionRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No police performance data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StationAnalyticsPage;

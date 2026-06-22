import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";

import { useAdminAnalytics } from "../../hooks/admin/useAdminAnalytics";

const AdminAnalyticsPage = () => {
  const { analytics, isLoading, error } = useAdminAnalytics();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading analytics</div>;

  // Data mapping for charts
  const userPieData = [
    { name: "Police", value: analytics.users?.police || 0 },
    { name: "Citizens", value: analytics.users?.citizens || 0 }
  ];

  const caseBarData = [
    { name: "Pending", value: analytics.cases?.pending || 0 },
    { name: "Assigned", value: analytics.cases?.assigned || 0 },
    { name: "Investigating", value: analytics.cases?.underInvestigation || 0 },
    { name: "Resolved", value: analytics.cases?.resolved || 0 },
    { name: "Closed", value: analytics.cases?.closed || 0 }
  ];

  const casesByStationData = analytics.performance?.casesByStation?.map(station => ({
    name: station.stationName || "Unknown",
    value: station.caseCount || 0
  })) || [];

  const growthPolice = Array.isArray(analytics.trends?.newPoliceThisMonth)
    ? analytics.trends.newPoliceThisMonth
    : [{ month: "This Month", count: analytics.trends?.newPoliceThisMonth ?? 0 }];

  const growthCases = Array.isArray(analytics.trends?.newCasesThisMonth)
    ? analytics.trends.newCasesThisMonth
    : [{ month: "This Month", count: analytics.trends?.newCasesThisMonth ?? 0 }];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="space-y-6 p-6">

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Tenant overview</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Monitor stations, user segments, case status, and tenant growth in one place.
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 ">
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border border-slate-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Total Stations</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-3xl font-semibold text-slate-900">{analytics.stations?.total || 0}</p>
                <p className="mt-2 text-sm text-slate-500">All police stations</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Active Stations</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-3xl font-semibold text-slate-900">{analytics.stations?.active || 0}</p>
                <p className="mt-2 text-sm text-slate-500">Currently active stations</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Inactive Stations</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-3xl font-semibold text-slate-900">{analytics.stations?.inactive || 0}</p>
                <p className="mt-2 text-sm text-slate-500">Currently inactive stations</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Total Police Officers</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-3xl font-semibold text-slate-900">{analytics.users?.police || 0}</p>
                <p className="mt-2 text-sm text-slate-500">Approved police officers</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-700 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Monthly growth</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">New police officers</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.trends?.newPoliceThisMonth ?? 0}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={growthPolice}>
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">New cases</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.trends?.newCasesThisMonth ?? 0}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={growthCases}>
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="border border-slate-700 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Distribution</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">User distribution</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Total Users {analytics.users?.total ?? 0}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={userPieData} dataKey="value" nameKey="name" outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}>
                      {userPieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Case status</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Total Cases {analytics.cases?.total ?? 0}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={caseBarData}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-700 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Cases by Station</CardTitle>
            </CardHeader>
            <CardContent className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Case distribution across stations</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={casesByStationData} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border border-slate-700 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Top active stations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.performance?.topActiveStations?.map((station) => (
                  <div key={station.stationId} className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{station.stationName}</p>
                      <p className="text-sm text-slate-500">Cases handled</p>
                    </div>
                    <Badge>{station.caseCount}</Badge>
                  </div>
                )) || <p className="text-sm text-slate-500">No stations data available</p>}
              </CardContent>
            </Card>

            <Card className="border border-slate-700 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Performance metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-500">Average Case Resolution Time</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.performance?.averageResolutionTime || 0} days</p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-500">Pending Police Approvals</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.users?.pendingPolice || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

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

import { useSystemAnalytics } from "../../hooks/superadmin/useSystemAnalytics";

const SystemAnalyticsPage = () => {
  const { analytics, isLoading, error } = useSystemAnalytics();

  // const analytics = data;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading analytics</div>;

  // Data mapping for charts
  const userPieData = [
    { name: "Admins", value: analytics.users.admins },
    { name: "Police", value: analytics.users.police },
    { name: "Citizens", value: analytics.users.citizens }
  ];

  const caseBarData = [
    { name: "Pending", value: analytics.cases.pending },
    { name: "Assigned", value: analytics.cases.assigned },
    { name: "Investigating", value: analytics.cases.underInvestigation },
    { name: "Resolved", value: analytics.cases.resolved },
    { name: "Closed", value: analytics.cases.closed }
  ];

  const growthUsers = Array.isArray(analytics.trends?.newUsersThisMonth)
    ? analytics.trends.newUsersThisMonth
    : [{ month: "This Month", count: analytics.trends?.newUsersThisMonth ?? 0 }];

  const growthCases = Array.isArray(analytics.trends?.newCasesThisMonth)
    ? analytics.trends.newCasesThisMonth
    : [{ month: "This Month", count: analytics.trends?.newCasesThisMonth ?? 0 }];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="space-y-6 p-6">

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">System overview</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Monitor tenants, user segments, case status, and platform growth in one place.
          </p>
        </div>
      </div>



      <div className="grid gap-6 grid-cols-1 ">
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border border-slate-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Tenants</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-3xl font-semibold text-slate-900">{analytics.tenants.total}</p>
                <p className="mt-2 text-sm text-slate-500">Total active and inactive tenants</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Active tenants</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-3xl font-semibold text-slate-900">{analytics.tenants.active}</p>
                <p className="mt-2 text-sm text-slate-500">Currently active tenants</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Deactive Tenants</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-3xl font-semibold text-slate-900">{analytics.tenants.deActive}</p>
                <p className="mt-2 text-sm text-slate-500">Currently deactive tenants</p>
              </CardContent>
            </Card>
            {/* <Card className="border border-slate-400 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Total cases</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-3xl font-semibold text-slate-900">{analytics.cases.total}</p>
                <p className="mt-2 text-sm text-slate-500">All case statuses combined</p>
              </CardContent>
            </Card> */}
          </div>

          <Card className="border border-slate-700 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Monthly growth</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">User growth</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.trends.newUsersThisMonth ?? 0}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={growthUsers}>
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Case growth</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.trends.newCasesThisMonth ?? 0}</p>
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
                <p className="mt-2 text-xl font-semibold text-slate-900">Total Users {analytics.users.total ?? 0}</p>
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
                <p className="mt-2 text-xl font-semibold text-slate-900">Total Cases {analytics.cases.total ?? 0}</p>
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
              <CardTitle className="text-lg text-slate-900">Top active tenants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.performance.topActiveTenants.map((t) => (
                <div key={t.tenantId} className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{t.tenantName}</p>
                    <p className="text-sm text-slate-500">Cases handled</p>
                  </div>
                  <Badge>{t.caseCount}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalyticsPage;
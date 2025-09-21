'use client'

import Link from 'next/link'

// Mock data for the dashboard
const recentActivities = [
  {
    id: 1,
    action: "Data Upload Completed",
    description: "Q3 2024 lobbying data uploaded successfully",
    timestamp: "2 minutes ago",
    status: "success" as const,
  },
  {
    id: 2,
    action: "Report Generated",
    description: "Healthcare lobbying trends report created",
    timestamp: "15 minutes ago",
    status: "success" as const,
  },
  {
    id: 3,
    action: "Data Quality Check",
    description: "Minor inconsistencies found in payment data",
    timestamp: "1 hour ago",
    status: "warning" as const,
  },
  {
    id: 4,
    action: "System Maintenance",
    description: "Scheduled maintenance completed",
    timestamp: "3 hours ago",
    status: "info" as const,
  },
]

const stats = [
  {
    title: "Total Lobbying Amount",
    value: "$127.5M",
    change: "+12.3%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
  {
    title: "Active Organizations",
    value: "1,247",
    change: "+5.8%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
  {
    title: "Total Activities",
    value: "5,892",
    change: "-2.1%",
    changeType: "negative" as const,
    period: "vs last quarter",
  },
  {
    title: "Average Payment",
    value: "$21,647",
    change: "+8.7%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the California Lobbying Data Analysis Platform
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.change}
                  </span>
                  <span>{stat.period}</span>
                </div>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              ⚡ Quick Actions
            </h3>
            <p className="text-sm text-gray-600">Common data operations</p>
          </div>
          <div className="space-y-3">
            <Link
              href="/lobbying-data"
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🗃️ Browse Lobbying Data
            </Link>
            <Link
              href="/reports/create"
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📄 Create New Report
            </Link>
            <Link
              href="/data/upload"
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📤 Upload Data
            </Link>
            <Link
              href="/data/analyze"
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📊 Analyze Data
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📱 Recent Activity
            </h3>
            <p className="text-sm text-gray-600">Latest system activities and updates</p>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 border-b border-gray-100 pb-3 last:border-b-0">
                <div className="mt-1">
                  {activity.status === 'success' && <span className="text-green-600">✅</span>}
                  {activity.status === 'warning' && <span className="text-yellow-600">⚠️</span>}
                  {activity.status === 'info' && <span className="text-blue-600">ℹ️</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/activity"
              className="block w-full p-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View All Activity
            </Link>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Database Status</h4>
            <span className="text-xl">🗄️</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <div>
              <div className="text-sm font-bold text-green-600">Connected</div>
              <p className="text-xs text-gray-500">
                BigQuery operational
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Data Freshness</h4>
            <span className="text-xl">🔄</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <div>
              <div className="text-sm font-bold">Up to Date</div>
              <p className="text-xs text-gray-500">
                Last updated 2 mins ago
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">System Health</h4>
            <span className="text-xl">💚</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <div>
              <div className="text-sm font-bold text-green-600">Healthy</div>
              <p className="text-xs text-gray-500">
                All systems operational
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
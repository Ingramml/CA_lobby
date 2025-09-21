export default function DashboardIndex() {
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
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lobbying Amount</p>
              <p className="text-2xl font-bold">$127.5M</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                  +12.3%
                </span>
                <span>vs last quarter</span>
              </div>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Organizations</p>
              <p className="text-2xl font-bold">1,247</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                  +5.8%
                </span>
                <span>vs last quarter</span>
              </div>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold">5,892</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                  -2.1%
                </span>
                <span>vs last quarter</span>
              </div>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Payment</p>
              <p className="text-2xl font-bold">$21,647</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                  +8.7%
                </span>
                <span>vs last quarter</span>
              </div>
            </div>
            <div className="text-2xl">📈</div>
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
      </div>
    </div>
  )
}
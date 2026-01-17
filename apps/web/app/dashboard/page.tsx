export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Resolution Autopilot Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Status */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Today&apos;s Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <p className="text-3xl font-bold text-green-400">67%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Workouts This Week</p>
                <p className="text-2xl font-semibold">2 / 4</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Streak</p>
                <p className="text-2xl font-semibold">🔥 3 days</p>
              </div>
            </div>
          </div>

          {/* Drift Risk */}
          <div className="bg-gray-900 rounded-lg p-6 border border-yellow-800">
            <h2 className="text-xl font-semibold mb-4">Drift Risk</h2>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-5xl font-bold text-yellow-400">MEDIUM</p>
                <p className="text-gray-400 mt-2">Confidence: 72%</p>
              </div>
            </div>
          </div>

          {/* Smart Contract */}
          <div className="bg-gray-900 rounded-lg p-6 border border-purple-800">
            <h2 className="text-xl font-semibold mb-4">Your Stake</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Staked Amount</p>
                <p className="text-3xl font-bold text-purple-400">$100</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Milestones</p>
                <p className="text-2xl font-semibold">2 / 4 ✓</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Potential Earnings</p>
                <p className="text-xl font-semibold text-green-400">$110</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <p className="font-semibold">Workout Completed</p>
                <p className="text-sm text-gray-400">Gym - Legs • Today at 6:00 AM</p>
              </div>
              <span className="text-green-400 text-2xl">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <p className="font-semibold">Intervention Sent</p>
                <p className="text-sm text-gray-400">Motivational SMS • Yesterday at 5:30 PM</p>
              </div>
              <span className="text-blue-400 text-2xl">📱</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <p className="font-semibold">Workout Missed</p>
                <p className="text-sm text-gray-400">Gym - Chest • 2 days ago</p>
              </div>
              <span className="text-red-400 text-2xl">✗</span>
            </div>
          </div>
        </div>

        {/* Agent Reasoning */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Agent Reasoning</h2>
          <div className="bg-gray-950 p-4 rounded font-mono text-sm space-y-2">
            <p className="text-blue-400">[Agent] Analyzing workout patterns...</p>
            <p className="text-gray-300">User has completed 2/4 workouts this week (50% completion rate)</p>
            <p className="text-yellow-400">[Warning] Detected drift signal: Missed last workout</p>
            <p className="text-blue-400">[Agent] Deploying intervention: Send motivational SMS</p>
            <p className="text-green-400">[Success] Intervention deployed successfully</p>
          </div>
        </div>
      </div>
    </div>
  );
}

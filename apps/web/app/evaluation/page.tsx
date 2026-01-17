export default function EvaluationPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">OPIC Evaluation Dashboard</h1>
        <p className="text-gray-400 mb-8">Transparent agent performance metrics and reasoning chains</p>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900 to-green-950 rounded-lg p-6 border border-green-800">
            <p className="text-sm text-gray-300 mb-2">Intervention Precision</p>
            <p className="text-4xl font-bold text-green-400">87%</p>
            <p className="text-xs text-gray-400 mt-2">↑ 5% from last week</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg p-6 border border-blue-800">
            <p className="text-sm text-gray-300 mb-2">User Retention</p>
            <p className="text-4xl font-bold text-blue-400">78%</p>
            <p className="text-xs text-gray-400 mt-2">Week 1 retention rate</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-lg p-6 border border-purple-800">
            <p className="text-sm text-gray-300 mb-2">Reasoning Quality</p>
            <p className="text-4xl font-bold text-purple-400">9.2</p>
            <p className="text-xs text-gray-400 mt-2">LLM-as-judge score /10</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-orange-950 rounded-lg p-6 border border-orange-800">
            <p className="text-sm text-gray-300 mb-2">False Positive Rate</p>
            <p className="text-4xl font-bold text-orange-400">8%</p>
            <p className="text-xs text-gray-400 mt-2">↓ 3% from last week</p>
          </div>
        </div>

        {/* Intervention Effectiveness */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intervention Effectiveness by Type</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Social Accountability</span>
                <span className="text-sm font-semibold text-green-400">73%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div className="bg-green-400 h-3 rounded-full" style={{ width: '73%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Calendar Booking</span>
                <span className="text-sm font-semibold text-blue-400">68%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div className="bg-blue-400 h-3 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Financial Reminder</span>
                <span className="text-sm font-semibold text-purple-400">61%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div className="bg-purple-400 h-3 rounded-full" style={{ width: '61%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Generic Notification</span>
                <span className="text-sm font-semibold text-red-400">12%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div className="bg-red-400 h-3 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Trace Logs */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Agent Trace Logs</h2>
          <div className="space-y-4">
            <div className="bg-gray-950 p-4 rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">2025-01-17 09:45:23</span>
                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded text-xs">MEDIUM RISK</span>
              </div>
              <p className="font-mono text-sm text-blue-400 mb-2">[DRIFT DETECTED]</p>
              <p className="text-sm text-gray-300 mb-2">Confidence: 72% • Signals: Missed 2 consecutive workouts</p>
              <p className="text-xs text-gray-400">Reasoning: User history shows pattern of skipping after 2 misses. Deploy social intervention.</p>
              <p className="text-sm text-green-400 mt-2">Action: Sent SMS to accountability buddy ✓</p>
            </div>

            <div className="bg-gray-950 p-4 rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">2025-01-16 18:30:15</span>
                <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">LOW RISK</span>
              </div>
              <p className="font-mono text-sm text-blue-400 mb-2">[PATTERN ANALYSIS]</p>
              <p className="text-sm text-gray-300 mb-2">Completion Rate: 67% • Recent trend: Stable</p>
              <p className="text-xs text-gray-400">Reasoning: User on track with 2/4 workouts this week. No intervention needed.</p>
              <p className="text-sm text-gray-400 mt-2">Action: Continue monitoring</p>
            </div>

            <div className="bg-gray-950 p-4 rounded border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">2025-01-15 22:10:42</span>
                <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs">HIGH RISK</span>
              </div>
              <p className="font-mono text-sm text-blue-400 mb-2">[INTERVENTION DEPLOYED]</p>
              <p className="text-sm text-gray-300 mb-2">Confidence: 89% • Signals: 3 consecutive misses + no future bookings</p>
              <p className="text-xs text-gray-400">Reasoning: Critical decision point. Financial stake reminder most effective for this user.</p>
              <p className="text-sm text-green-400 mt-2">Action: Sent financial reminder SMS • User completed next workout ✓</p>
            </div>
          </div>
        </div>

        {/* User Segmentation */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4">User Segmentation Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400 mb-1">External Accountability</p>
              <p className="text-2xl font-bold text-green-400 mb-2">45%</p>
              <p className="text-xs text-gray-400">Best with social interventions</p>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400 mb-1">Financial Motivated</p>
              <p className="text-2xl font-bold text-purple-400 mb-2">35%</p>
              <p className="text-xs text-gray-400">Best with stake reminders</p>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400 mb-1">Structure Seekers</p>
              <p className="text-2xl font-bold text-blue-400 mb-2">20%</p>
              <p className="text-xs text-gray-400">Best with calendar scheduling</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

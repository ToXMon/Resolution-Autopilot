import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resolution Autopilot 🎯</h1>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
              Dashboard
            </Link>
            <Link href="/evaluation" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
              OPIC Evaluation
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI That Prevents Resolution Failure
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            92% of resolutions fail by February. Resolution Autopilot uses custom AI agents to detect drift signals 
            in real-time and deploy proactive interventions at critical decision points.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition">
              View Dashboard
            </Link>
            <Link href="/evaluation" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold transition">
              OPIC Metrics
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Detection</h3>
            <p className="text-gray-400">
              Custom AI agent analyzes behavioral patterns to detect drift signals before failure occurs.
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Proactive Interventions</h3>
            <p className="text-gray-400">
              Deploy personalized micro-interventions at critical decision points to prevent cascade failures.
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Blockchain Stakes</h3>
            <p className="text-gray-400">
              Smart contracts on Base L2 provide real accountability through trustless escrow and milestone verification.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-8 border border-purple-800/50">
          <h3 className="text-3xl font-bold mb-4">Why Custom Agents Beat Frameworks</h3>
          <ul className="space-y-3 text-gray-300">
            <li>✓ <strong>Full Transparency</strong> - Every decision logged and auditable</li>
            <li>✓ <strong>Complete Control</strong> - No black-box frameworks, perfect for evaluation</li>
            <li>✓ <strong>Observable</strong> - OPIC integration shows reasoning chains in real-time</li>
            <li>✓ <strong>Lean Codebase</strong> - ~500 LOC agent loop, faster shipping</li>
          </ul>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Built with</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <span className="px-4 py-2 bg-gray-800 rounded-lg">Venice AI (Llama 3.3 70B)</span>
            <span className="px-4 py-2 bg-gray-800 rounded-lg">Google Gemini</span>
            <span className="px-4 py-2 bg-gray-800 rounded-lg">Next.js 15</span>
            <span className="px-4 py-2 bg-gray-800 rounded-lg">Base L2</span>
            <span className="px-4 py-2 bg-gray-800 rounded-lg">Twilio</span>
            <span className="px-4 py-2 bg-gray-800 rounded-lg">TypeScript</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>Built for Encode Hackathon • Custom Agent-from-Scratch Architecture</p>
          <p className="mt-2 text-sm">No LangChain, No LLaMA Index - Pure TypeScript Agent Loop</p>
        </div>
      </footer>
    </div>
  );
}

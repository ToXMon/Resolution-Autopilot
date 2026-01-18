'use client';

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ 
        borderColor: 'rgba(100, 116, 139, 0.2)',
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🎯
            </div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#F1F5F9'
            }}>
              Resolution Autopilot
            </h1>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/onboarding"
              style={{
                padding: '10px 20px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                e.currentTarget.style.borderColor = '#10B981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
              }}
            >
              Get Started
            </Link>
            <Link 
              href="/dashboard"
              style={{
                padding: '10px 20px',
                background: '#6366F1',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4F46E5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6366F1'}
            >
              Dashboard
            </Link>
            <Link 
              href="/evaluation"
              style={{
                padding: '10px 20px',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#6366F1',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                e.currentTarget.style.borderColor = '#6366F1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
            >
              OPIC Evaluation
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="py-20 text-center animate-fade-in">
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            color: '#6366F1',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Custom Agent-from-Scratch Architecture
          </div>
          
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '56px',
            fontWeight: 700,
            lineHeight: '1.1',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            AI Coach That Prevents<br />Resolution Failure
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: '#94A3B8',
            maxWidth: '720px',
            margin: '0 auto 32px',
            lineHeight: '1.7'
          }}>
            92% of resolutions fail by February—not from lack of motivation, but absence of real-time intervention at critical decision points. Resolution Autopilot deploys AI agents that detect behavioral drift and intervene before cascade failure.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/onboarding"
              style={{
                padding: '16px 32px',
                background: '#10B981',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10B981';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
              }}
            >
              Get Started
              <span>→</span>
            </Link>
            <Link 
              href="/dashboard"
              style={{
                padding: '16px 32px',
                background: 'rgba(51, 65, 85, 0.6)',
                color: '#F1F5F9',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(51, 65, 85, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(51, 65, 85, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
              }}
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-16">
          {[
            {
              icon: '🔍',
              title: 'Pattern Detection',
              desc: 'Custom AI agent analyzes behavioral patterns in real-time, detecting drift signals 48 hours before failure cascade begins.',
              color: '#6366F1'
            },
            {
              icon: '⚡',
              title: 'Proactive Interventions',
              desc: 'Deploy micro-interventions at critical decision points. Not generic reminders—personalized scaffolding based on your profile.',
              color: '#10B981'
            },
            {
              icon: '⛓️',
              title: 'Blockchain Stakes',
              desc: 'Smart contracts on Base L2 provide trustless accountability. Your stake, your milestones, your earnings—all on-chain.',
              color: '#F59E0B'
            }
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                e.currentTarget.style.borderColor = feature.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: '40px',
                marginBottom: '16px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#F1F5F9',
                marginBottom: '12px'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: '#94A3B8',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Why Custom Agents */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '20px',
          padding: '48px',
          marginTop: '48px',
          marginBottom: '48px'
        }}>
          <h3 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Why Custom Agents Beat Frameworks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[
              { label: 'Full Transparency', desc: 'Every decision logged and auditable—no black boxes' },
              { label: 'Observable', desc: 'OPIC integration shows reasoning chains in real-time' },
              { label: 'Complete Control', desc: 'Perfect for evaluation, no framework abstractions' },
              { label: 'Lean Codebase', desc: '~500 LOC agent loop enables faster iteration' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div style={{
                  color: '#10B981',
                  fontSize: '20px',
                  fontWeight: 700
                }}>✓</div>
                <div>
                  <div style={{
                    color: '#F1F5F9',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    color: '#94A3B8',
                    fontSize: '13px'
                  }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="py-16 text-center">
          <h3 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#94A3B8',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Built With
          </h3>
          <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
            {[
              'Venice AI (Llama 3.3 70B)',
              'Google Gemini',
              'Next.js 16',
              'Base L2',
              'Twilio',
              'TypeScript'
            ].map((tech, i) => (
              <span
                key={i}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  color: '#CBD5E1',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(100, 116, 139, 0.2)',
        marginTop: '64px',
        padding: '32px 0'
      }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '8px' }}>
            Built for Encode Hackathon • Custom Agent-from-Scratch Architecture
          </p>
          <p style={{ color: '#475569', fontSize: '12px' }}>
            No LangChain, No LLaMA Index — Pure TypeScript Agent Loop
          </p>
        </div>
      </footer>
    </div>
  );
}

'use client';

export default function EvaluationPage() {
  const metrics = [
    { label: 'Intervention Precision', value: '87%', change: '↑ 5%', color: '#10B981' },
    { label: 'User Retention', value: '78%', subtext: 'Week 1', color: '#6366F1' },
    { label: 'Reasoning Quality', value: '9.2', subtext: '/10 LLM-as-judge', color: '#8B5CF6' },
    { label: 'False Positive Rate', value: '8%', change: '↓ 3%', color: '#F59E0B' }
  ];

  const interventions = [
    { type: 'Social Accountability', value: 73, color: '#10B981' },
    { type: 'Calendar Booking', value: 68, color: '#6366F1' },
    { type: 'Financial Reminder', value: 61, color: '#8B5CF6' },
    { type: 'Generic Notification', value: 12, color: '#EF4444' }
  ];

  const traces = [
    {
      time: '2025-01-17 09:45:23',
      type: 'DRIFT DETECTED',
      risk: 'MEDIUM',
      riskColor: '#F59E0B',
      confidence: 72,
      signals: 'Missed 2 consecutive workouts',
      reasoning: 'User history shows pattern of skipping after 2 misses. Deploy social intervention.',
      action: 'Sent SMS to accountability buddy ✓',
      actionColor: '#10B981'
    },
    {
      time: '2025-01-16 18:30:15',
      type: 'PATTERN ANALYSIS',
      risk: 'LOW',
      riskColor: '#10B981',
      rate: '67%',
      trend: 'Stable',
      reasoning: 'User on track with 2/4 workouts this week. No intervention needed.',
      action: 'Continue monitoring',
      actionColor: '#64748B'
    },
    {
      time: '2025-01-15 22:10:42',
      type: 'INTERVENTION DEPLOYED',
      risk: 'HIGH',
      riskColor: '#EF4444',
      confidence: 89,
      signals: '3 consecutive misses + no future bookings',
      reasoning: 'Critical decision point. Financial stake reminder most effective for this user.',
      action: 'Sent financial reminder SMS • User completed next workout ✓',
      actionColor: '#10B981'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '8px'
          }}>
            OPIC Evaluation Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            Transparent agent performance metrics and reasoning chains
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, i) => (
            <div
              key={i}
              style={{
                background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}05 100%)`,
                border: `1px solid ${metric.color}40`,
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = metric.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = `${metric.color}40`;
              }}
            >
              <div style={{
                color: '#94A3B8',
                fontSize: '12px',
                marginBottom: '12px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {metric.label}
              </div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '40px',
                fontWeight: 700,
                color: metric.color,
                marginBottom: '8px'
              }}>
                {metric.value}
              </div>
              <div style={{ color: '#64748B', fontSize: '12px' }}>
                {metric.change || metric.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Intervention Effectiveness */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '24px'
          }}>
            Intervention Effectiveness by Type
          </h2>

          <div className="space-y-5">
            {interventions.map((item, i) => (
              <div key={i}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#CBD5E1', fontSize: '14px', fontWeight: 500 }}>
                    {item.type}
                  </span>
                  <span style={{
                    color: item.color,
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}>
                    {item.value}%
                  </span>
                </div>
                <div style={{
                  height: '10px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      width: `${item.value}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: '5px',
                      transition: 'width 1s ease-out'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Trace Logs */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '24px'
          }}>
            Recent Agent Trace Logs
          </h2>

          <div className="space-y-4">
            {traces.map((trace, i) => (
              <div
                key={i}
                style={{
                  background: '#0F172A',
                  border: `1px solid ${trace.riskColor}40`,
                  borderRadius: '12px',
                  padding: '20px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: '11px',
                    color: '#64748B'
                  }}>
                    {trace.time}
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    background: `${trace.riskColor}20`,
                    color: trace.riskColor,
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {trace.risk} RISK
                  </span>
                </div>

                <div style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: '13px',
                  marginBottom: '12px'
                }}>
                  <div style={{ color: '#06B6D4', marginBottom: '8px' }}>
                    [{trace.type}]
                  </div>
                  {trace.confidence && (
                    <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                      Confidence: {trace.confidence}% • Signals: {trace.signals}
                    </div>
                  )}
                  {trace.rate && (
                    <div style={{ color: '#CBD5E1', marginBottom: '4px' }}>
                      Completion Rate: {trace.rate} • Recent trend: {trace.trend}
                    </div>
                  )}
                  <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '8px' }}>
                    Reasoning: {trace.reasoning}
                  </div>
                  <div style={{ color: trace.actionColor, marginTop: '8px' }}>
                    Action: {trace.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Segmentation */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          borderRadius: '16px',
          padding: '32px'
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '24px'
          }}>
            User Segmentation Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'External Accountability', value: '45%', desc: 'Best with social interventions', color: '#10B981' },
              { label: 'Financial Motivated', value: '35%', desc: 'Best with stake reminders', color: '#8B5CF6' },
              { label: 'Structure Seekers', value: '20%', desc: 'Best with calendar scheduling', color: '#6366F1' }
            ].map((segment, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${segment.color}30`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                  e.currentTarget.style.borderColor = segment.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                  e.currentTarget.style.borderColor = `${segment.color}30`;
                }}
              >
                <div style={{
                  color: '#94A3B8',
                  fontSize: '12px',
                  marginBottom: '8px',
                  fontWeight: 500
                }}>
                  {segment.label}
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '36px',
                  fontWeight: 700,
                  color: segment.color,
                  marginBottom: '8px'
                }}>
                  {segment.value}
                </div>
                <div style={{ color: '#64748B', fontSize: '12px' }}>
                  {segment.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

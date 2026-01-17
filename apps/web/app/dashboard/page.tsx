'use client';

export default function DashboardPage() {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekStatus = [true, true, false, false, false, true, null]; // true=done, false=missed, null=today

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: '#F1F5F9',
              marginBottom: '8px'
            }}>
              Dashboard
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Real-time pattern detection and behavioral insights
            </p>
          </div>
          <div style={{
            padding: '8px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#10B981',
            fontSize: '13px',
            fontWeight: 600
          }}>
            ● Active
          </div>
        </div>

        {/* Pattern Detection Card */}
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
            Last 7 Days Pattern
          </h2>

          {/* Week Timeline */}
          <div className="flex items-center justify-between mb-6">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: 600
                }}>
                  {day}
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: weekStatus[i] === true ? 'rgba(16, 185, 129, 0.2)' :
                              weekStatus[i] === false ? 'rgba(239, 68, 68, 0.2)' :
                              'rgba(99, 102, 241, 0.2)',
                  border: weekStatus[i] === true ? '2px solid #10B981' :
                          weekStatus[i] === false ? '2px solid #EF4444' :
                          '2px solid #6366F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                className="hover:scale-110"
                >
                  {weekStatus[i] === true ? '✓' :
                   weekStatus[i] === false ? '✗' : '•'}
                </div>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            <div>
              <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '4px' }}>
                Completion Rate
              </div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '28px',
                fontWeight: 700,
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                50%
                <span style={{ fontSize: '16px', color: '#EF4444' }}>↓</span>
              </div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '4px' }}>
                Drift Risk
              </div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#F59E0B'
              }}>
                MEDIUM
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 400, marginTop: '2px' }}>
                  72% confidence
                </div>
              </div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '4px' }}>
                Signals Detected
              </div>
              <div style={{
                fontSize: '14px',
                color: '#F59E0B'
              }}>
                • 2 consecutive misses<br/>
                • No future bookings
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Stake Status */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
              color: '#F1F5F9',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⛓️ Your Stake
            </h2>
            
            <div className="space-y-4">
              <div>
                <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '6px' }}>
                  Staked Amount
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#6366F1'
                }}>
                  $100
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <span style={{ color: '#94A3B8', fontSize: '13px' }}>Milestones</span>
                  <span style={{ color: '#F1F5F9', fontSize: '13px', fontWeight: 600 }}>2 / 4</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[true, true, false, false].map((done, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '8px',
                        borderRadius: '4px',
                        background: done ? '#10B981' : 'rgba(100, 116, 139, 0.3)'
                      }}
                    />
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#64748B', fontSize: '12px' }}>Potential Earnings</span>
                  <span style={{
                    color: '#10B981',
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}>
                    $110
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
              color: '#F1F5F9',
              marginBottom: '20px'
            }}>
              Current Performance
            </h2>
            
            <div className="space-y-6">
              <div>
                <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
                  Workouts This Week
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#F1F5F9'
                }}>
                  2 <span style={{ fontSize: '24px', color: '#64748B' }}>/ 4</span>
                </div>
              </div>

              <div>
                <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
                  Current Streak
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🔥 3 days
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '12px',
                color: '#94A3B8'
              }}>
                <strong style={{ color: '#F1F5F9' }}>Next workout:</strong> Tomorrow at 6:00 AM
              </div>
            </div>
          </div>
        </div>

        {/* Agent Reasoning */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔍 Agent Reasoning
          </h2>
          <p style={{ color: '#64748B', fontSize: '12px', marginBottom: '20px' }}>
            Real-time decision chain from your AI coach
          </p>

          <div style={{
            background: '#0F172A',
            borderRadius: '10px',
            padding: '20px',
            fontFamily: "'Fira Code', monospace",
            fontSize: '13px',
            lineHeight: '1.8'
          }}>
            <div style={{ color: '#06B6D4', marginBottom: '12px' }}>
              [Agent] Analyzing workout patterns...
            </div>
            <div style={{ color: '#CBD5E1', marginBottom: '12px' }}>
              User has completed 2/4 workouts this week (50% completion rate)
            </div>
            <div style={{ color: '#F59E0B', marginBottom: '12px' }}>
              [Warning] Detected drift signal: Missed 2 consecutive workouts
            </div>
            <div style={{ color: '#06B6D4', marginBottom: '12px' }}>
              [Agent] Deploying intervention: Send motivational SMS
            </div>
            <div style={{ color: '#10B981' }}>
              [Success] Intervention deployed successfully
            </div>
          </div>
        </div>

        {/* Recent Activity */}
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
            marginBottom: '20px'
          }}>
            Recent Activity
          </h2>

          <div className="space-y-3">
            {[
              { title: 'Workout Completed', desc: 'Gym - Legs • Today at 6:00 AM', icon: '✓', color: '#10B981' },
              { title: 'Intervention Sent', desc: 'Motivational SMS • Yesterday at 5:30 PM', icon: '📱', color: '#6366F1' },
              { title: 'Workout Missed', desc: 'Gym - Chest • 2 days ago', icon: '✗', color: '#EF4444' }
            ].map((activity, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `3px solid ${activity.color}`
                }}
              >
                <div>
                  <div style={{
                    color: '#F1F5F9',
                    fontWeight: 600,
                    marginBottom: '4px',
                    fontSize: '14px'
                  }}>
                    {activity.title}
                  </div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>
                    {activity.desc}
                  </div>
                </div>
                <div style={{ fontSize: '24px' }}>
                  {activity.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

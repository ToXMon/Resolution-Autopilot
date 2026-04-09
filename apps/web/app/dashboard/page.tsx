'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface DashboardStats {
  weekPattern: (boolean | null)[];
  completionRate: number;
  driftRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  driftConfidence: number;
  driftSignals: string[];
  workoutsThisWeek: number;
  targetWorkouts: number;
  totalMinutes: number;
  currentStreak: number;
  milestones: {
    completed: number;
    total: number;
  };
}

interface Activity {
  title: string;
  desc: string;
  icon: string;
  color: string;
}

interface AgentMessage {
  type: 'info' | 'warning' | 'success';
  message: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: Activity[];
  agentReasoning: AgentMessage[];
  profile: {
    stake_amount: number;
  };
}

export default function DashboardPage() {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard?user_id=demo_user_001');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Default values when loading or error
  const stats = data?.stats || {
    weekPattern: [false, false, false, false, false, false, null],
    completionRate: 0,
    driftRisk: 'LOW' as const,
    driftConfidence: 30,
    driftSignals: [],
    workoutsThisWeek: 0,
    targetWorkouts: 4,
    totalMinutes: 0,
    currentStreak: 0,
    milestones: { completed: 0, total: 4 },
  };

  const recentActivity = data?.recentActivity || [];
  const agentReasoning = data?.agentReasoning || [];
  const stakeAmount = data?.profile?.stake_amount || 100;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return '#EF4444';
      case 'MEDIUM': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 75) return '#10B981';
    if (rate >= 50) return '#F59E0B';
    return '#EF4444';
  };

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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              href="/workout"
              style={{
                padding: '10px 20px',
                background: '#10B981',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🏋️</span>
              Start Workout
            </Link>
            <div style={{
              padding: '8px 16px',
              background: loading ? 'rgba(100, 116, 139, 0.2)' : 'rgba(16, 185, 129, 0.1)',
              border: loading ? '1px solid rgba(100, 116, 139, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: loading ? '#94A3B8' : '#10B981',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {loading ? '● Loading...' : '● Active'}
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#EF4444'
          }}>
            Error: {error}
          </div>
        )}

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
                  background: stats.weekPattern[i] === true ? 'rgba(16, 185, 129, 0.2)' :
                              stats.weekPattern[i] === false ? 'rgba(239, 68, 68, 0.2)' :
                              'rgba(99, 102, 241, 0.2)',
                  border: stats.weekPattern[i] === true ? '2px solid #10B981' :
                          stats.weekPattern[i] === false ? '2px solid #EF4444' :
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
                  {stats.weekPattern[i] === true ? '✓' :
                   stats.weekPattern[i] === false ? '✗' : '•'}
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
                color: getCompletionColor(stats.completionRate),
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {stats.completionRate}%
                <span style={{ fontSize: '16px', color: stats.completionRate >= 50 ? '#10B981' : '#EF4444' }}>
                  {stats.completionRate >= 50 ? '↑' : '↓'}
                </span>
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
                color: getRiskColor(stats.driftRisk)
              }}>
                {stats.driftRisk}
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 400, marginTop: '2px' }}>
                  {stats.driftConfidence}% confidence
                </div>
              </div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '4px' }}>
                Signals Detected
              </div>
              <div style={{
                fontSize: '14px',
                color: getRiskColor(stats.driftRisk)
              }}>
                {stats.driftSignals.length > 0 
                  ? stats.driftSignals.map((s, i) => <div key={i}>• {s}</div>)
                  : '• On track ✓'
                }
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
                  ${stakeAmount}
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
                  <span style={{ color: '#F1F5F9', fontSize: '13px', fontWeight: 600 }}>
                    {stats.milestones.completed} / {stats.milestones.total}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {Array.from({ length: stats.milestones.total }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '8px',
                        borderRadius: '4px',
                        background: i < stats.milestones.completed ? '#10B981' : 'rgba(100, 116, 139, 0.3)'
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
                    ${Math.round(stakeAmount * 1.1)}
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
                  {stats.workoutsThisWeek} <span style={{ fontSize: '24px', color: '#64748B' }}>/ {stats.targetWorkouts}</span>
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
                  color: stats.currentStreak > 0 ? '#F59E0B' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {stats.currentStreak > 0 ? '🔥' : ''} {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
                </div>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '12px',
                color: '#94A3B8'
              }}>
                <strong style={{ color: '#F1F5F9' }}>Total time:</strong> {stats.totalMinutes} minutes this week
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
            {agentReasoning.length > 0 ? agentReasoning.map((msg, i) => (
              <div key={i} style={{ 
                color: msg.type === 'info' ? '#06B6D4' : 
                       msg.type === 'warning' ? '#F59E0B' : '#10B981',
                marginBottom: i < agentReasoning.length - 1 ? '12px' : 0
              }}>
                {msg.type === 'info' && '[Agent] '}
                {msg.type === 'warning' && '[Warning] '}
                {msg.type === 'success' && '[Success] '}
                {msg.message}
              </div>
            )) : (
              <>
                <div style={{ color: '#06B6D4', marginBottom: '12px' }}>
                  [Agent] Analyzing workout patterns...
                </div>
                <div style={{ color: '#CBD5E1' }}>
                  Waiting for data...
                </div>
              </>
            )}
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
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
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
            )) : (
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                color: '#64748B'
              }}>
                No recent activity. Start a workout to see your progress!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function WorkoutCompletePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-md mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>
          🎉
        </div>
        
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '32px',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          WORKOUT COMPLETE!
        </h1>

        <div style={{
          fontSize: '16px',
          color: '#94A3B8',
          marginBottom: '32px'
        }}>
          Great job! You crushed it today.
        </div>

        {/* Workout Summary */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          width: '100%'
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            SQUATS
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span style={{ color: '#94A3B8', fontSize: '14px' }}>Total Reps</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#F1F5F9'
            }}>
              45
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span style={{ color: '#94A3B8', fontSize: '14px' }}>Duration</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#F1F5F9'
            }}>
              15:42
            </span>
          </div>

          <div style={{
            borderTop: '1px solid rgba(100, 116, 139, 0.2)',
            paddingTop: '16px',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ color: '#10B981', fontSize: '20px' }}>✓</span>
              <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>
                3 sets completed
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ color: '#10B981', fontSize: '20px' }}>✓</span>
              <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>
                Form: GOOD
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: '#10B981', fontSize: '20px' }}>✓</span>
              <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>
                New streak day!
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Progress */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          width: '100%'
        }}>
          <div style={{
            color: '#94A3B8',
            fontSize: '13px',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Milestone Progress
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {[true, true, true, false].map((completed, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '12px',
                  borderRadius: '6px',
                  background: completed ? '#6366F1' : 'rgba(100, 116, 139, 0.3)'
                }}
              />
            ))}
          </div>
          
          <div style={{
            textAlign: 'center',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#6366F1'
          }}>
            3/4 workouts this week
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            href="/celebration"
            style={{
              width: '100%',
              height: '48px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              borderRadius: '10px',
              color: '#6366F1',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
          >
            View Details
          </Link>

          <Link
            href="/dashboard"
            style={{
              width: '100%',
              height: '48px',
              background: '#10B981',
              color: '#fff',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  );
}

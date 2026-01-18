'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RestPage() {
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-md mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>
          ⏱️
        </div>
        
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '32px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          REST TIME
        </h1>

        {/* Countdown Circle */}
        <div style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '4px solid #6366F1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          position: 'relative'
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '64px',
            fontWeight: 700,
            color: '#F1F5F9',
            lineHeight: '1'
          }}>
            {countdown}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#94A3B8',
            marginTop: '8px'
          }}>
            seconds
          </div>
        </div>

        {/* Set Summary */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>✓</span>
            <span style={{
              color: '#10B981',
              fontWeight: 700,
              fontSize: '16px'
            }}>
              Set 2 complete!
            </span>
          </div>
          <div style={{ color: '#64748B', fontSize: '14px', marginBottom: '4px' }}>
            15 reps - Great form
          </div>
        </div>

        <div style={{
          color: '#F1F5F9',
          fontSize: '14px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Next: <strong>Set 3 (final)</strong>
        </div>

        {/* Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            href="/workout/live"
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
            {countdown === 0 ? 'Continue to Set 3' : 'Skip Rest'}
          </Link>

          <Link
            href="/workout/complete"
            style={{
              width: '100%',
              height: '48px',
              background: 'transparent',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
          >
            End Workout Early
          </Link>
        </div>
      </div>
    </div>
  );
}

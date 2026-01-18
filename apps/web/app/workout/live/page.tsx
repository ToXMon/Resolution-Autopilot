'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LiveWorkoutPage() {
  const [reps, setReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [time, setTime] = useState(0);
  const [formQuality, setFormQuality] = useState<'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [isPaused, setIsPaused] = useState(false);
  const [coachMessage, setCoachMessage] = useState('Get ready! Starting in 3...');

  const targetReps = 12;
  const totalSets = 3;

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  useEffect(() => {
    // Simulate rep counting
    const messages = [
      'Good form! Keep going!',
      'Push through your heels!',
      'Great depth! Two more!',
      'Maintain that posture!',
      'You\'re doing great!'
    ];
    
    const messageTimer = setInterval(() => {
      setCoachMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000);

    return () => clearInterval(messageTimer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddRep = () => {
    if (reps < targetReps) {
      setReps(reps + 1);
      if (reps + 1 === targetReps) {
        // Set complete
        if (currentSet < totalSets) {
          setTimeout(() => {
            window.location.href = '/workout/rest';
          }, 1000);
        } else {
          setTimeout(() => {
            window.location.href = '/workout/complete';
          }, 1000);
        }
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      {/* Top Status Bar */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '16px',
          fontWeight: 700,
          color: '#F1F5F9'
        }}>
          SQUATS
        </div>
        <div style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: '14px',
          color: '#06B6D4'
        }}>
          {formatTime(time)}
        </div>
      </div>

      {/* Video Feed Area */}
      <div style={{
        background: '#000',
        height: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
      }}>
        <div style={{
          fontSize: '120px',
          opacity: 0.3
        }}>
          🎥
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: formQuality === 'GOOD' ? 'rgba(16, 185, 129, 0.9)' : 
                      formQuality === 'FAIR' ? 'rgba(245, 158, 11, 0.9)' :
                      'rgba(239, 68, 68, 0.9)',
          padding: '8px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>
            {formQuality === 'GOOD' ? '✓' : '⚠'}
          </span>
          <span style={{
            fontWeight: 700,
            fontSize: '13px',
            color: '#fff'
          }}>
            FORM: {formQuality}
          </span>
        </div>
      </div>

      {/* Controls Area */}
      <div style={{ padding: '24px 20px' }}>
        {/* Set and Rep Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px',
            color: '#94A3B8',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            SET {currentSet} OF {totalSets}
          </div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '48px',
            fontWeight: 700,
            color: '#F1F5F9',
            lineHeight: '1'
          }}>
            {reps}/{targetReps}
          </div>
          <div style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>
            REPS
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '10px',
          height: '12px',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div style={{
            width: `${(reps / targetReps) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
            transition: 'width 0.3s ease',
            borderRadius: '10px'
          }} />
        </div>

        {/* Coach Message */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '24px' }}>💬</div>
            <div>
              <div style={{ color: '#06B6D4', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                COACH SAYS:
              </div>
              <div style={{ color: '#F1F5F9', fontSize: '14px' }}>
                {coachMessage}
              </div>
            </div>
          </div>
        </div>

        {/* Test Button (for demo) */}
        <button
          onClick={handleAddRep}
          style={{
            width: '100%',
            height: '48px',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '10px',
            color: '#6366F1',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '16px',
            cursor: 'pointer'
          }}
        >
          Simulate Rep (Demo)
        </button>

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              flex: 1,
              height: '48px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '10px',
              color: '#F1F5F9',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>{isPaused ? '▶️' : '⏸'}</span>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <Link
            href="/workout/complete"
            style={{
              flex: 1,
              height: '48px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '10px',
              color: '#EF4444',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <span>🔴</span>
            End
          </Link>
        </div>
      </div>
    </div>
  );
}

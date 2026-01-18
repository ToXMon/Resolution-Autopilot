'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function WorkoutSetupPage() {
  const [selectedExercise, setSelectedExercise] = useState('SQUATS');
  const exercises = ['SQUATS', 'PUSH-UPS', 'LUNGES', 'PLANKS', 'DEADLIFTS'];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center">
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>
            🏋️
          </div>
          
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '32px'
          }}>
            Start Workout
          </h1>

          {/* Exercise Selection */}
          <div style={{ marginBottom: '32px', textAlign: 'left' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              display: 'block'
            }}>
              Choose Exercise:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {exercises.map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                  style={{
                    padding: '12px 20px',
                    background: selectedExercise === exercise ? '#6366F1' : 'rgba(30, 41, 59, 0.5)',
                    border: selectedExercise === exercise ? '2px solid #6366F1' : '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    color: selectedExercise === exercise ? '#fff' : '#94A3B8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {exercise}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Preview */}
          <div style={{ marginBottom: '32px', textAlign: 'left' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              display: 'block'
            }}>
              📷 Camera Setup:
            </label>
            <div style={{
              background: '#000',
              border: '2px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '12px',
              height: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '48px' }}>📹</div>
              <div style={{ color: '#64748B', fontSize: '13px' }}>
                Camera preview will appear here
              </div>
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: '#10B981', fontSize: '20px' }}>✓</span>
              <span style={{ color: '#10B981', fontSize: '13px', fontWeight: 600 }}>
                Full body visible
              </span>
            </div>
          </div>

          {/* Target */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '8px' }}>
              Target:
            </div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#F1F5F9'
            }}>
              3 × 12 reps
            </div>
          </div>

          {/* Start Button */}
          <Link
            href="/workout/live"
            style={{
              display: 'block',
              width: '100%',
              height: '56px',
              background: '#10B981',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '18px',
              textDecoration: 'none',
              lineHeight: '56px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            Start Coaching
          </Link>

          <Link
            href="/dashboard"
            style={{
              display: 'block',
              width: '100%',
              marginTop: '16px',
              color: '#64748B',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function CelebrationPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A', position: 'relative', overflow: 'hidden' }}>
      {/* Confetti Background Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div className="max-w-md mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen relative z-10">
        {/* Confetti Emojis */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          fontSize: '48px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          🎉
        </div>
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '15%',
          fontSize: '48px',
          animation: 'float 2.5s ease-in-out infinite',
          animationDelay: '0.5s'
        }}>
          🎊
        </div>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          fontSize: '36px',
          animation: 'float 2.8s ease-in-out infinite',
          animationDelay: '1s'
        }}>
          ✨
        </div>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          fontSize: '36px',
          animation: 'float 3.2s ease-in-out infinite',
          animationDelay: '1.5s'
        }}>
          ⭐
        </div>

        <div style={{ fontSize: '100px', marginBottom: '24px', animation: 'bounce 1s ease-in-out' }}>
          🏆
        </div>
        
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '36px',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textAlign: 'center'
        }}>
          MILESTONE COMPLETE!
        </h1>

        <div style={{
          fontSize: '14px',
          color: '#94A3B8',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          You're officially unstoppable 💪
        </div>

        {/* Achievement Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#10B981',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Week 1-2 Complete
          </div>

          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '8px'
          }}>
            Gym 8/8 Workouts
          </div>

          <div style={{
            color: '#10B981',
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '24px'
          }}>
            You did it!
          </div>

          {/* NFT Badge Placeholder */}
          <div style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
              animation: 'shimmer 3s infinite'
            }} />
            <div style={{ fontSize: '64px', position: 'relative' }}>
              🏅
            </div>
          </div>

          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#F1F5F9',
            marginBottom: '4px'
          }}>
            "Consistency Champion"
          </div>
          <div style={{
            fontSize: '12px',
            color: '#94A3B8'
          }}>
            NFT Badge Minted
          </div>
        </div>

        {/* Smart Contract Status */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '32px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '24px' }}>⛓️</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: '#F1F5F9'
            }}>
              Smart Contract
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
              Verified on Base
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#94A3B8', fontSize: '13px' }}>Released to you</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#10B981'
            }}>
              +$10
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: '1px solid rgba(100, 116, 139, 0.2)'
          }}>
            <span style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 600 }}>
              Total earned:
            </span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#10B981'
            }}>
              $25
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            style={{
              width: '100%',
              height: '48px',
              background: 'linear-gradient(90deg, #1DA1F2 0%, #14A1F0 100%)',
              color: '#fff',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>🐦</span>
            Share Victory on Twitter
          </button>

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
          >
            Continue → Next Milestone
          </Link>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

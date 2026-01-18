'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <Step3 onBack={() => setStep(2)} />}
    </div>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Illustration Area */}
      <div style={{
        width: '200px',
        height: '200px',
        marginBottom: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '80px'
      }}>
        💔
      </div>

      {/* Content */}
      <div className="text-center max-w-md">
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          92% of resolutions fail by February
        </h1>
        
        <p style={{
          fontSize: '14px',
          color: '#94A3B8',
          marginBottom: '48px',
          lineHeight: '1.6'
        }}>
          Not because you're weak. Because behavior change needs scaffolding.
        </p>

        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: '48px',
            background: '#6366F1',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4F46E5'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6366F1'}
        >
          Continue
        </button>
      </div>

      {/* Progress Dots */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        display: 'flex',
        gap: '8px'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#334155' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#334155' }} />
      </div>
    </div>
  );
}

function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '32px',
          lineHeight: '1.2'
        }}>
          What if something caught you BEFORE you failed?
        </h1>

        {/* Illustration Steps */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '48px',
          textAlign: 'left'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '32px' }}>📅</div>
            <div>
              <div style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: '4px' }}>
                Detects patterns in real-time
              </div>
              <div style={{ color: '#64748B', fontSize: '13px' }}>
                AI analyzes your calendar and behavior
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '32px' }}>⚡</div>
            <div>
              <div style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: '4px' }}>
                Intervenes at decision points
              </div>
              <div style={{ color: '#64748B', fontSize: '13px' }}>
                Deploys personalized nudges when needed
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '32px' }}>✓</div>
            <div>
              <div style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: '4px' }}>
                Learns what works for you
              </div>
              <div style={{ color: '#64748B', fontSize: '13px' }}>
                Adapts strategy based on your success
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: '48px',
            background: '#6366F1',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '12px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4F46E5'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6366F1'}
        >
          See Your Commitment
        </button>

        <button
          onClick={onBack}
          style={{
            width: '100%',
            height: '48px',
            background: 'transparent',
            color: '#94A3B8',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
      </div>

      {/* Progress Dots */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        display: 'flex',
        gap: '8px'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#334155' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#334155' }} />
      </div>
    </div>
  );
}

function Step3({ onBack }: { onBack: () => void }) {
  const [stakeAmount, setStakeAmount] = useState(100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Lock your commitment with smart contracts
        </h1>

        <div style={{
          fontSize: '48px',
          marginBottom: '32px'
        }}>
          🛡️
        </div>

        {/* Staking Form */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              display: 'block'
            }}>
              Your Resolution
            </label>
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              color: '#F1F5F9',
              fontSize: '14px'
            }}>
              Gym 4x/week
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              display: 'block'
            }}>
              Stake Amount
            </label>
            <input
              type="range"
              min="50"
              max="500"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              style={{
                width: '100%',
                marginBottom: '8px'
              }}
            />
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#6366F1',
              textAlign: 'center'
            }}>
              ${stakeAmount} USDC
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              display: 'block'
            }}>
              Duration
            </label>
            <div style={{
              color: '#F1F5F9',
              fontSize: '14px'
            }}>
              8 weeks
            </div>
          </div>

          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ color: '#10B981', fontSize: '13px', marginBottom: '8px' }}>
              ✓ If you succeed: Get funds back + 10% bonus
            </div>
            <div style={{ color: '#F59E0B', fontSize: '13px' }}>
              → If you fail: Goes to charity of your choice
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              display: 'block'
            }}>
              Select Charity
            </label>
            <select style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              color: '#F1F5F9',
              fontSize: '14px'
            }}>
              <option>Cancer Research</option>
              <option>Environmental</option>
              <option>Education</option>
            </select>
          </div>

          <div style={{
            color: '#64748B',
            fontSize: '11px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            🔒 Secured by Ethereum Base (L2)<br />
            You can view & manage your contract anytime
          </div>
        </div>

        <Link 
          href="/dashboard"
          style={{
            display: 'block',
            width: '100%',
            height: '48px',
            background: '#6366F1',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '12px',
            textDecoration: 'none',
            lineHeight: '48px'
          }}
        >
          Connect Wallet
        </Link>

        <button
          onClick={onBack}
          style={{
            width: '100%',
            height: '48px',
            background: 'transparent',
            color: '#94A3B8',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
      </div>

      {/* Progress Dots */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        display: 'flex',
        gap: '8px'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#334155' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#334155' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} />
      </div>
    </div>
  );
}

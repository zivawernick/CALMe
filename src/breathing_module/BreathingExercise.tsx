import { useState } from 'react';
import BreathingCircle from './BreathingCircle';

interface BreathingExerciseProps {
  onClose: () => void;
  onComplete?: () => void;
}

const DEFAULT_TIMINGS = [4000, 7000, 8000]; // 4-7-8 breathing technique
const DEFAULT_REPEAT = 4;

export default function BreathingExercise({ onClose, onComplete }: BreathingExerciseProps) {
  const [timings] = useState(DEFAULT_TIMINGS);
  const [repeatCount] = useState(DEFAULT_REPEAT);
  const [key, setKey] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);

  const restartExercise = () => {
    setKey(Date.now());
    setIsActive(true);
  };

  const handleComplete = () => {
    setIsActive(false);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '40px',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '10px' }}>
          Breathing Exercise
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>
          Follow the circle to regulate your breathing
        </p>

        {isActive && (
          <BreathingCircle key={key} timings={timings} repeat={repeatCount} />
        )}

        <div style={{ marginTop: '30px' }}>
          <button
            onClick={restartExercise}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Restart Exercise
          </button>
          <button
            onClick={handleComplete}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            I Feel Better
          </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          <p>4-7-8 Breathing Technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds</p>
        </div>
      </div>
    </div>
  );
}
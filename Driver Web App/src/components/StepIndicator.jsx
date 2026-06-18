import React from 'react';
import { Search, CreditCard, CheckCircle } from 'lucide-react';

const STEPS = [
  { key: 'lookup', label: 'Look Up Fine', icon: Search },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'confirmation', label: 'Confirmation', icon: CheckCircle },
];

export default function StepIndicator({ currentStep }) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div style={styles.wrapper} className="no-print">
      <div style={styles.container}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              {/* Step Circle + Label */}
              <div style={styles.step}>
                <div
                  style={{
                    ...styles.circle,
                    ...(isActive ? styles.circleActive : {}),
                    ...(isCompleted ? styles.circleCompleted : {}),
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle size={18} strokeWidth={2.5} />
                  ) : (
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  )}
                </div>
                <span
                  style={{
                    ...styles.label,
                    ...(isActive ? styles.labelActive : {}),
                    ...(isCompleted ? styles.labelCompleted : {}),
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div style={styles.connectorWrapper}>
                  <div
                    style={{
                      ...styles.connector,
                      ...(index < currentIndex ? styles.connectorCompleted : {}),
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0 24px',
    marginBottom: '32px',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    maxWidth: '560px',
    width: '100%',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  circle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '2px solid var(--border-subtle)',
    color: 'var(--text-dark)',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  circleActive: {
    background: 'var(--accent-soft)',
    border: '2px solid var(--accent)',
    color: 'var(--accent)',
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
  },
  circleCompleted: {
    background: 'rgba(16, 185, 129, 0.12)',
    border: '2px solid var(--success)',
    color: 'var(--success)',
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    transition: 'color 0.3s ease',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  labelActive: {
    color: 'var(--accent)',
  },
  labelCompleted: {
    color: 'var(--success)',
  },
  connectorWrapper: {
    flex: 1,
    padding: '0 8px',
    marginBottom: '28px',
  },
  connector: {
    height: '2px',
    width: '100%',
    background: 'var(--border-subtle)',
    borderRadius: '2px',
    transition: 'background 0.4s ease',
  },
  connectorCompleted: {
    background: 'var(--success)',
  },
};

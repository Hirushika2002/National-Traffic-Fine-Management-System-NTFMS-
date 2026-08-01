import React, { useState } from 'react';
import { Shield, Key, Mail, ArrowRight, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { authService } from '../services/authService';

/**
 * NTFMS Admin Portal — Login Screen
 *
 * Uses Firebase Email/Password authentication.
 * Supports:
 *   - Sign in with email + password
 *   - "Forgot Password" flow (sends Firebase reset email)
 */
export default function Login({ onLoginSuccess }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  // Forgot-password flow state
  const [forgotMode, setForgotMode]       = useState(false);
  const [resetEmail, setResetEmail]       = useState('');
  const [resetSent, setResetSent]         = useState(false);
  const [resetLoading, setResetLoading]   = useState(false);
  const [resetError, setResetError]       = useState('');

  // ── Sign In ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ──────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    setResetLoading(true);
    try {
      await authService.sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch (err) {
      setResetError(err.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  // ── Forgot Password View ─────────────────────────────────────
  if (forgotMode) {
    return (
      <div style={styles.container}>
        <div style={styles.glow1} />
        <div style={styles.glow2} />

        <div className="glass-panel animate-fade-in" style={styles.loginCard}>
          {/* Header */}
          <div style={styles.logoContainer}>
            <div style={styles.logoCircle}>
              <RotateCcw size={32} color="var(--accent)" />
            </div>
            <h1 style={styles.title}>Reset Password</h1>
            <p style={styles.subtitle}>Enter your admin email address</p>
          </div>

          {resetSent ? (
            <div style={styles.successAlert}>
              <CheckCircle size={20} style={{ minWidth: 20 }} />
              <div>
                <strong>Reset email sent!</strong><br />
                Check your inbox at <strong>{resetEmail}</strong> and follow the instructions to reset your password.
              </div>
            </div>
          ) : (
            <>
              {resetError && (
                <div style={styles.errorAlert}>
                  <AlertCircle size={18} style={{ minWidth: 18 }} />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Administrator Email</label>
                  <div style={styles.inputWrapper}>
                    <Mail size={18} style={styles.inputIcon} />
                    <input
                      type="email"
                      placeholder="admin@ntfms.lk"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={styles.input}
                      disabled={resetLoading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-accent"
                  style={styles.submitBtn}
                  disabled={resetLoading || !resetEmail}
                >
                  {resetLoading ? (
                    <span style={styles.loader} />
                  ) : (
                    <>Send Reset Email <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            </>
          )}

          <button
            onClick={() => { setForgotMode(false); setResetSent(false); setResetError(''); }}
            style={styles.backLink}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Main Login View ──────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* Background Ambient Glows */}
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <div className="glass-panel animate-fade-in" style={styles.loginCard}>
        {/* Sri Lanka Police Badge */}
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}>
            <Shield size={36} color="var(--accent)" />
          </div>
          <h1 style={styles.title}>NTFMS ADMIN</h1>
          <p style={styles.subtitle}>Sri Lanka Police Department</p>
          <span style={styles.badge}>National Fine Portal</span>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} style={{ minWidth: 18 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Administrator Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="admin@ntfms.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Security Password</label>
            <div style={styles.inputWrapper}>
              <Key size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="Enter security password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Forgot Password link */}
          <div style={styles.forgotRow}>
            <button
              type="button"
              onClick={() => { setForgotMode(true); setResetEmail(email); setError(''); }}
              style={styles.forgotLink}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-accent"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loader} />
            ) : (
              <>Authenticate Administrator <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-base)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  glow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(30, 64, 175, 0.25) 0%, transparent 70%)',
    top: '10%',
    left: '15%',
    pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
    bottom: '10%',
    right: '15%',
    pointerEvents: 'none',
  },
  loginCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-premium)',
    animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px',
    textAlign: 'center',
  },
  logoCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(212, 175, 55, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)',
    marginBottom: '16px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
    color: 'var(--text-main)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#002244',
    backgroundColor: 'var(--accent)',
    padding: '4px 12px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--danger)',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '0.88rem',
    marginBottom: '20px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    lineHeight: '1.5',
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--success, #10b981)',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '0.9rem',
    marginBottom: '20px',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-dark)',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 42px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  },
  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '-8px',
  },
  forgotLink: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    fontSize: '0.82rem',
    cursor: 'pointer',
    padding: '0',
    fontWeight: '600',
    letterSpacing: '0.02em',
    opacity: 0.85,
    transition: 'opacity 0.2s',
  },
  submitBtn: {
    marginTop: '4px',
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    letterSpacing: '0.02em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginTop: '24px',
    textAlign: 'center',
    padding: '0',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  loader: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTop: '3px solid #002244',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
};

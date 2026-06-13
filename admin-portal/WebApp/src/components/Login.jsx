import React, { useState } from 'react';
import { Shield, Key, User, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { authService } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all security fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(username, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Ambient Glows */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <div className="glass-panel animate-fade-in" style={styles.loginCard}>
        {/* Sri Lankan Police Department Banner / Badge */}
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
          <div style={styles.inputGroup}>
            <label style={styles.label}>Administrator Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-accent" 
            style={styles.submitBtn} 
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loader}></span>
            ) : (
              <>
                Authenticate Administrator
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Credentials Guidance */}
        <div style={styles.infoBox}>
          <Info size={16} color="var(--accent)" style={{ minWidth: 16 }} />
          <div style={styles.infoText}>
            <strong>Testing Credentials:</strong><br />
            Username: <code style={styles.code}>admin</code> | Password: <code style={styles.code}>admin123</code>
          </div>
        </div>
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
    padding: '20px'
  },
  glow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(30, 64, 175, 0.25) 0%, transparent 70%)',
    top: '10%',
    left: '15%',
    pointerEvents: 'none'
  },
  glow2: {
    position: 'absolute',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
    bottom: '10%',
    right: '15%',
    pointerEvents: 'none'
  },
  loginCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-premium)',
    animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px',
    textAlign: 'center'
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
    marginBottom: '16px'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
    color: 'var(--text-main)',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px'
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#002244',
    backgroundColor: 'var(--accent)',
    padding: '4px 12px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--danger)',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.9rem',
    marginBottom: '20px',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-dark)'
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
    transition: 'var(--transition-smooth)'
  },
  submitBtn: {
    marginTop: '10px',
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    letterSpacing: '0.02em'
  },
  infoBox: {
    marginTop: '28px',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  infoText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  code: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: 'var(--text-main)',
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  loader: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTop: '3px solid #002244',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block'
  }
};

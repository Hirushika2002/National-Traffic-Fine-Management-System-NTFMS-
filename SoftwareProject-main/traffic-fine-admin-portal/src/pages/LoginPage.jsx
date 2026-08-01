import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { extractErrorMessage } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';
import ErrorBanner from '../components/ErrorBanner';
import { Shield, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      setSession(result);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed. Check your credentials.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page" style={styles.container}>
      {/* Background glow animations */}
      <div style={styles.ambientGlow1}></div>
      <div style={styles.ambientGlow2}></div>

      <div className="card login-card glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <Shield size={32} color="var(--accent)" />
          </div>
          <h1 style={styles.title}>NTFMS ADMIN</h1>
          <p className="subtitle" style={styles.subtitle}>
            Sri Lanka Police Traffic Fine digital registry
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <div className="form-field">
            <label htmlFor="email" style={styles.label}>Officer Email</label>
            <div style={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="officer@police.lk"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
              <Mail size={16} style={styles.inputIcon} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password" style={styles.label}>Secret Key/Password</label>
            <div style={styles.inputWrapper}>
              <input
                id="password"
                type="password"
                placeholder="Enter credentials"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <Lock size={16} style={styles.inputIcon} />
            </div>
          </div>

          <ErrorBanner message={error} />

          <button type="submit" className="btn btn--primary" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Authenticating Officer...' : 'Authenticate & Sign In'}
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
    background: '#040712',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  ambientGlow1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(30, 64, 175, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  ambientGlow2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px',
    zIndex: 10,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoBadge: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '0.04em',
    color: 'var(--text-main)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#ffffff',
    outline: 'none',
    transition: 'var(--transition-fast)',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  submitBtn: {
    marginTop: '12px',
    padding: '14px',
  },
};

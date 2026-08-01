import React from 'react';
import { Shield, Sun, Moon, LogIn, LogOut, User } from 'lucide-react';

export default function Header({ theme, toggleTheme, user, onLogin, onLogout }) {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Left — Branding */}
        <div style={styles.brand}>
          <div style={styles.logoCircle}>
            <Shield size={24} color="var(--accent)" strokeWidth={2.5} />
          </div>
          <div style={styles.brandText}>
            <h1 style={styles.title}>
              <span style={styles.titleAccent}>NTFMS</span>
              <span className="hide-mobile" style={styles.titleSep}>|</span>
              <span className="hide-mobile" style={styles.titleSub}>Driver Portal</span>
            </h1>
            <p style={styles.subtitle}>Sri Lanka Police Department</p>
          </div>
        </div>

        {/* Right — Actions */}
        <div style={styles.actions}>
          {user ? (
            <div style={styles.userProfile}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}><User size={14} /></div>
              )}
              <span className="hide-mobile" style={styles.userName}>{user.displayName || 'Motorist'}</span>
              <button 
                onClick={onLogout} 
                className="btn btn-ghost" 
                style={{ fontSize: '0.8rem', padding: '6px 10px', gap: '6px', color: 'var(--danger)' }}
              >
                <LogOut size={14} />
                <span className="hide-mobile">Sign Out</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin} 
              className="btn btn-accent" 
              style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px' }}
            >
              <LogIn size={14} />
              Sign In with Google
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={styles.themeBtn}
            aria-label="Toggle theme"
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hide-mobile" style={{ fontSize: '0.8rem' }}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--bg-surface)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border-subtle)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'var(--accent-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid rgba(212, 175, 55, 0.25)',
    flexShrink: 0,
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.1rem',
    fontWeight: '800',
    letterSpacing: '0.02em',
    lineHeight: 1.2,
  },
  titleAccent: {
    color: 'var(--text-main)',
  },
  titleSep: {
    color: 'var(--border-subtle)',
  },
  titleSub: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: '0.68rem',
    fontWeight: '600',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  themeBtn: {
    padding: '6px 12px',
    gap: '6px',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingRight: '6px',
    borderRight: '1px solid var(--border-subtle)',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid var(--accent)',
  },
  avatarPlaceholder: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-main)',
  }
};

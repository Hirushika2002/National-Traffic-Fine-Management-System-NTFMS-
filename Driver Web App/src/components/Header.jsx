import React from 'react';
import { Shield, Sun, Moon, ExternalLink } from 'lucide-react';

export default function Header({ theme, toggleTheme }) {
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
              <span className="hide-mobile" style={styles.titleSub}>Pay Your Fine Online</span>
            </h1>
            <p style={styles.subtitle}>Sri Lanka Police Department</p>
          </div>
        </div>

        {/* Right — Actions */}
        <div style={styles.actions}>
          <a
            href="https://www.police.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost hide-mobile"
            style={{ fontSize: '0.8rem', gap: '6px' }}
          >
            <ExternalLink size={14} />
            Police.lk
          </a>
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
    color: 'var(--text-main)',
  },
  titleAccent: {
    color: 'var(--accent)',
    letterSpacing: '0.08em',
  },
  titleSep: {
    color: 'var(--text-dark)',
    fontWeight: '300',
  },
  titleSub: {
    fontWeight: '500',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  subtitle: {
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: '1px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  themeBtn: {
    padding: '8px 12px',
    fontSize: '0.85rem',
    borderRadius: '8px',
  },
};

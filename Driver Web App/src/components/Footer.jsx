import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer} className="no-print">
      <div style={styles.container}>
        <div style={styles.brand}>
          <Shield size={16} color="var(--accent)" />
          <span style={styles.brandName}>NTFMS</span>
          <span style={styles.divider}>•</span>
          <span style={styles.brandSub}>National Traffic Fine Management System</span>
        </div>

        <p style={styles.copyright}>
          © {year} Sri Lanka Police Department. All rights reserved.
        </p>

        <p style={styles.disclaimer}>
          This portal is an official digital service of the Sri Lanka Police Department.
          All payment transactions are processed securely. For assistance, contact the
          nearest police station or call the Police Helpline at <strong>119</strong>.
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    borderTop: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    marginTop: '60px',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  brandName: {
    fontWeight: '700',
    color: 'var(--accent)',
    fontSize: '0.85rem',
    letterSpacing: '0.06em',
  },
  divider: {
    color: 'var(--text-dark)',
  },
  brandSub: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  copyright: {
    color: 'var(--text-dark)',
    fontSize: '0.75rem',
  },
  disclaimer: {
    color: 'var(--text-dark)',
    fontSize: '0.7rem',
    maxWidth: '600px',
    lineHeight: '1.5',
  },
};

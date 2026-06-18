import React, { useState } from 'react';
import { Search, Hash, FileText, AlertCircle, Info } from 'lucide-react';

export default function FineLookup({ onFineFound, loading, error }) {
  const [refNo, setRefNo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    const trimmedRef = refNo.trim();
    const trimmedCat = categoryId.trim();

    if (!trimmedRef || !trimmedCat) {
      setLocalError('Please enter both the Fine Reference Number and Category ID.');
      return;
    }

    // Basic format validation
    if (!/^SLP-\d{4}-\d{3,5}$/i.test(trimmedRef)) {
      setLocalError('Invalid reference number format. Expected format: SLP-YYYY-XXXXX (e.g., SLP-2026-9814)');
      return;
    }

    if (!/^CAT-\d{2}$/i.test(trimmedCat)) {
      setLocalError('Invalid category ID format. Expected format: CAT-XX (e.g., CAT-02)');
      return;
    }

    onFineFound(trimmedRef.toUpperCase(), trimmedCat.toUpperCase());
  };

  const displayError = error || localError;

  return (
    <div className="animate-fade-in-scale" style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroIcon}>
          <FileText size={32} color="var(--accent)" />
        </div>
        <h2 style={styles.heroTitle}>Pay Your Traffic Fine</h2>
        <p style={styles.heroDesc}>
          Enter the details from your traffic fine sheet to look up your fine 
          and proceed with the online payment.
        </p>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className="alert alert-error animate-fade-in" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ minWidth: 18, marginTop: 2 }} />
          <span>{displayError}</span>
        </div>
      )}

      {/* Lookup Form */}
      <form onSubmit={handleSubmit} style={styles.form} id="fine-lookup-form">
        <div className="input-group">
          <label className="input-label" htmlFor="ref-no-input">Fine Reference Number</label>
          <div className="input-wrapper">
            <input
              id="ref-no-input"
              type="text"
              className={`input-field ${displayError && !refNo.trim() ? 'input-error' : ''}`}
              placeholder="SLP-2026-9814"
              value={refNo}
              onChange={(e) => {
                setRefNo(e.target.value.toUpperCase());
                setLocalError('');
              }}
              disabled={loading}
              autoComplete="off"
              autoFocus
            />
            <Search size={18} className="input-icon" />
          </div>
          <span className="input-hint">Found on your fine sheet (e.g., SLP-2026-9814)</span>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="cat-id-input">Traffic Fine Category ID</label>
          <div className="input-wrapper">
            <input
              id="cat-id-input"
              type="text"
              className={`input-field ${displayError && !categoryId.trim() ? 'input-error' : ''}`}
              placeholder="CAT-02"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value.toUpperCase());
                setLocalError('');
              }}
              disabled={loading}
              autoComplete="off"
            />
            <Hash size={18} className="input-icon" />
          </div>
          <span className="input-hint">Category identifier from your fine sheet (e.g., CAT-02)</span>
        </div>

        <button
          type="submit"
          className="btn btn-accent btn-lg btn-full"
          disabled={loading}
          id="search-fine-btn"
          style={{ marginTop: '8px' }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ borderTopColor: '#0f172a' }}></span>
              Searching National Database...
            </>
          ) : (
            <>
              <Search size={18} />
              Search Fine
            </>
          )}
        </button>
      </form>

      {/* Info Guidance */}
      <div className="alert alert-info" style={{ marginTop: '24px' }}>
        <Info size={16} style={{ minWidth: 16, marginTop: 2 }} />
        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
          <strong>Test Reference Numbers:</strong><br />
          <code style={styles.code}>SLP-2026-9814</code> + <code style={styles.code}>CAT-02</code> (Reckless Driving — Pending)<br />
          <code style={styles.code}>SLP-2026-9817</code> + <code style={styles.code}>CAT-08</code> (Mobile Phone Use — Pending)<br />
          <code style={styles.code}>SLP-2026-9816</code> + <code style={styles.code}>CAT-07</code> (Seatbelt Violation — Overdue)
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '0 24px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  heroIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'var(--accent-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    border: '2px solid rgba(212, 175, 55, 0.2)',
  },
  heroTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    marginBottom: '8px',
    letterSpacing: '-0.01em',
  },
  heroDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    maxWidth: '400px',
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: 'var(--bg-glass-card)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    padding: '28px',
  },
  code: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: 'var(--text-main)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '0.78rem',
  },
};

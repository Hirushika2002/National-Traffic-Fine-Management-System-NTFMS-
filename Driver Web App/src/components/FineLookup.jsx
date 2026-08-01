import React, { useState } from 'react';
import { Search, Hash, FileText, AlertCircle, Info, CreditCard, UserCheck, Calendar, ArrowRight, CircleDot } from 'lucide-react';
import { apiService } from '../services/api';

export default function FineLookup({ onFineFound, loading, error }) {
  const [searchMode, setSearchMode] = useState('ref'); // 'ref' | 'license'
  
  // Reference search inputs
  const [refNo, setRefNo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  // License search input
  const [licenseNo, setLicenseNo] = useState('');

  // Results for driver license lookup
  const [licenseResults, setLicenseResults] = useState(null);
  
  const [localError, setLocalError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleRefSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLicenseResults(null);

    const trimmedRef = refNo.trim();
    const trimmedCat = categoryId.trim();

    if (!trimmedRef || !trimmedCat) {
      setLocalError('Please enter both the Fine Reference Number and Category ID.');
      return;
    }

    setIsSearching(true);
    try {
      const fine = await apiService.lookupFine(trimmedRef, trimmedCat);
      onFineFound(fine);
    } catch (err) {
      setLocalError(err.message || 'Could not find a matching fine.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLicenseResults(null);

    const trimmedLic = licenseNo.trim();
    if (!trimmedLic) {
      setLocalError('Please enter your Driving License Number.');
      return;
    }

    setIsSearching(true);
    try {
      const fines = await apiService.lookupByDriverLicense(trimmedLic);
      setLicenseResults(fines);
    } catch (err) {
      setLocalError(err.message || 'No fines found for this driving license.');
    } finally {
      setIsSearching(false);
    }
  };

  const displayError = error || localError;
  const isLoading = loading || isSearching;

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="animate-fade-in-scale" style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroIcon}>
          <FileText size={32} color="var(--accent)" />
        </div>
        <h2 style={styles.heroTitle}>Pay Your Traffic Fine</h2>
        <p style={styles.heroDesc}>
          Look up fine details from your official fine sheet or search by your driving license.
        </p>
      </div>

      {/* Lookup Mode Toggle Tabs */}
      <div style={styles.tabContainer}>
        <button
          type="button"
          style={{
            ...styles.tabBtn,
            ...(searchMode === 'ref' ? styles.tabBtnActive : {})
          }}
          onClick={() => {
            setSearchMode('ref');
            setLocalError('');
            setLicenseResults(null);
          }}
        >
          <FileText size={16} />
          Fine Sheet Ref
        </button>
        <button
          type="button"
          style={{
            ...styles.tabBtn,
            ...(searchMode === 'license' ? styles.tabBtnActive : {})
          }}
          onClick={() => {
            setSearchMode('license');
            setLocalError('');
            setLicenseResults(null);
          }}
        >
          <UserCheck size={16} />
          Driver License No.
        </button>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className="alert alert-error animate-fade-in" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} style={{ minWidth: 18, marginTop: 2 }} />
          <span>{displayError}</span>
        </div>
      )}

      {/* Mode 1: Lookup Form by Reference Number + Category */}
      {searchMode === 'ref' && (
        <form onSubmit={handleRefSubmit} style={styles.form} id="fine-lookup-form">
          <div className="input-group">
            <label className="input-label" htmlFor="ref-no-input">Fine Reference Number</label>
            <div className="input-wrapper">
              <input
                id="ref-no-input"
                type="text"
                className={`input-field ${displayError && !refNo.trim() ? 'input-error' : ''}`}
                placeholder="e.g. SLP-2026-9814"
                value={refNo}
                onChange={(e) => {
                  setRefNo(e.target.value.toUpperCase());
                  setLocalError('');
                }}
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
              <Search size={18} className="input-icon" />
            </div>
            <span className="input-hint">Found on top of fine sheet (e.g., SLP-2026-9814)</span>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="cat-id-input">Traffic Fine Category ID / Code</label>
            <div className="input-wrapper">
              <input
                id="cat-id-input"
                type="text"
                className={`input-field ${displayError && !categoryId.trim() ? 'input-error' : ''}`}
                placeholder="e.g. 2 or CAT-02"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value.toUpperCase());
                  setLocalError('');
                }}
                disabled={isLoading}
                autoComplete="off"
              />
              <Hash size={18} className="input-icon" />
            </div>
            <span className="input-hint">Category ID number (e.g., 2 for Reckless Driving, 3 for Drunk Driving)</span>
          </div>

          <button
            type="submit"
            className="btn btn-accent btn-lg btn-full"
            disabled={isLoading}
            id="search-fine-btn"
            style={{ marginTop: '8px' }}
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ borderTopColor: '#0f172a' }}></span>
                Searching Database...
              </>
            ) : (
              <>
                <Search size={18} />
                Search Fine
              </>
            )}
          </button>
        </form>
      )}

      {/* Mode 2: Lookup Form by Driver License */}
      {searchMode === 'license' && (
        <form onSubmit={handleLicenseSubmit} style={styles.form} id="license-lookup-form">
          <div className="input-group">
            <label className="input-label" htmlFor="license-no-input">Driver License Number</label>
            <div className="input-wrapper">
              <input
                id="license-no-input"
                type="text"
                className={`input-field ${displayError && !licenseNo.trim() ? 'input-error' : ''}`}
                placeholder="e.g. B9823412 or B7123490"
                value={licenseNo}
                onChange={(e) => {
                  setLicenseNo(e.target.value.toUpperCase());
                  setLocalError('');
                }}
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
              <CreditCard size={18} className="input-icon" />
            </div>
            <span className="input-hint">Enter Sri Lankan driving license number (e.g., B9823412)</span>
          </div>

          <button
            type="submit"
            className="btn btn-accent btn-lg btn-full"
            disabled={isLoading}
            id="search-license-btn"
            style={{ marginTop: '8px' }}
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ borderTopColor: '#0f172a' }}></span>
                Retrieving Fines...
              </>
            ) : (
              <>
                <Search size={18} />
                Find Fines for License
              </>
            )}
          </button>
        </form>
      )}

      {/* Driver License Multi-Fine Selection List */}
      {licenseResults && licenseResults.length > 0 && (
        <div style={styles.resultsContainer} className="animate-fade-in">
          <h3 style={styles.resultsTitle}>
            Fines Registered for License {licenseNo} ({licenseResults.length})
          </h3>
          <div style={styles.resultsList}>
            {licenseResults.map((item) => (
              <div
                key={item.refNo}
                style={styles.fineItemCard}
                onClick={() => onFineFound(item)}
                className="interactive-card"
              >
                <div style={styles.itemHeader}>
                  <div>
                    <span style={styles.itemRef}>{item.refNo}</span>
                    <span style={styles.itemCat}>{item.categoryName}</span>
                  </div>
                  <span className={`badge badge-${item.status.toLowerCase()}`}>
                    <CircleDot size={10} />
                    {item.status}
                  </span>
                </div>

                <div style={styles.itemBody}>
                  <div style={styles.itemMeta}>
                    <Calendar size={13} color="var(--text-dark)" />
                    <span>Issued: {formatDate(item.issuedAt)}</span>
                  </div>
                  <div style={styles.itemAmount}>
                    {formatAmount(item.amount)}
                  </div>
                </div>

                <div style={styles.itemAction}>
                  <span>View Details & Pay</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidance Alert */}
      <div className="alert alert-info" style={{ marginTop: '24px' }}>
        <Info size={16} style={{ minWidth: 16, marginTop: 2 }} />
        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
          <strong>Sample Demo Fine References & Categories:</strong><br />
          • Ref: <code style={styles.code}>SLP-2026-9814</code> | Category ID: <code style={styles.code}>2</code> (Reckless Driving)<br />
          • Ref: <code style={styles.code}>SLP-2026-9817</code> | Category ID: <code style={styles.code}>8</code> (Mobile Phone Use)<br />
          • Driver License No: <code style={styles.code}>B9823412</code> or <code style={styles.code}>B7123490</code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '540px',
    margin: '0 auto',
    padding: '0 24px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '24px',
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
    maxWidth: '420px',
    margin: '0 auto',
  },
  tabContainer: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '20px',
    gap: '4px',
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    background: 'var(--bg-glass-card)',
    color: 'var(--accent)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
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
  resultsContainer: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultsTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  fineItemCard: {
    background: 'var(--bg-glass-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemRef: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: 'var(--text-main)',
  },
  itemCat: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  itemBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: 'var(--text-dark)',
  },
  itemAmount: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--accent)',
  },
  itemAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--accent)',
    borderTop: '1px dashed var(--border-subtle)',
    paddingTop: '8px',
  },
};

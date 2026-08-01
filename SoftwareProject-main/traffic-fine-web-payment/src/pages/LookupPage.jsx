import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFineContext } from '../context/FineContext';
import { lookupFine } from '../services/fineService';
import { extractErrorMessage } from '../services/apiClient';
import ErrorBanner from '../components/ErrorBanner';
import { Search, Hash, FileText, Info } from 'lucide-react';

export default function LookupPage() {
  const [referenceNo, setReferenceNo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setFine } = useFineContext();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const trimmedRef = referenceNo.trim();
    if (!trimmedRef || !categoryId) {
      setError('Please enter both the reference number and category ID.');
      return;
    }

    setLoading(true);
    try {
      const fine = await lookupFine(trimmedRef.toUpperCase(), categoryId);
      setFine(fine);
      navigate('/details');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not find a fine matching those details.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page--centered">
      <div className="card glass-panel" style={{ marginTop: '20px' }}>
        <div style={styles.hero}>
          <div style={styles.heroIcon}>
            <FileText size={26} color="var(--accent)" />
          </div>
          <h1>Pay Your Traffic Fine</h1>
          <p className="subtitle" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>
            Enter the details from your traffic fine sheet to retrieve details and process payment.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="referenceNo">Fine Reference Number</label>
            <div style={{ position: 'relative' }}>
              <input
                id="referenceNo"
                type="text"
                placeholder="SLP-2026-9814"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value.toUpperCase())}
                style={{ paddingLeft: '40px' }}
                disabled={loading}
              />
              <Search size={16} style={styles.inputIcon} />
            </div>
            <span style={styles.inputHint}>Found on your fine sheet (e.g., SLP-2026-9814)</span>
          </div>

          <div className="form-field">
            <label htmlFor="categoryId">Traffic Fine Category ID</label>
            <div style={{ position: 'relative' }}>
              <input
                id="categoryId"
                type="number"
                min="1"
                placeholder="2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ paddingLeft: '40px' }}
                disabled={loading}
              />
              <Hash size={16} style={styles.inputIcon} />
            </div>
            <span style={styles.inputHint}>Category identifier number (e.g., 2 for Drunk Driving)</span>
          </div>

          <ErrorBanner message={error} />

          <button type="submit" className="btn btn--primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Searching Database...' : 'Find My Fine'}
          </button>
        </form>

        {/* Test Fines Guidance Info Card */}
        <div style={styles.infoAlert}>
          <Info size={16} style={{ minWidth: 16, marginTop: 2, color: 'var(--accent)' }} />
          <div style={{ fontSize: '0.78rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
            <strong>Active Registry Fine Sheets:</strong><br />
            <code>SLP-2026-9814</code> + Category ID: <code>2</code> (Drunk Driving)<br />
            <code>SLP-2026-9816</code> + Category ID: <code>1</code> (Speeding Limit)<br />
            <code>SLP-2026-9817</code> + Category ID: <code>3</code> (Obey Signal)
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  inputHint: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  infoAlert: {
    display: 'flex',
    gap: '10px',
    background: 'rgba(212, 175, 55, 0.05)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '24px',
  },
};

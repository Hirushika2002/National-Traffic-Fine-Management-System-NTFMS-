import { useEffect, useState } from 'react';
import { getSummary, getDistrictReport, getCategoryReport } from '../services/reportService';
import { extractErrorMessage } from '../services/apiClient';
import ReportBarChart from '../components/ReportBarChart';
import ReportTable from '../components/ReportTable';
import ErrorBanner from '../components/ErrorBanner';
import { 
  DollarSign, 
  FileCheck, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tickerEvents, setTickerEvents] = useState([]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [summaryData, districtData, categoryData] = await Promise.all([
        getSummary(),
        getDistrictReport(),
        getCategoryReport(),
      ]);
      setSummary(summaryData);
      setDistricts(
        districtData.map((d) => ({
          name: d.districtName,
          value: Number(d.totalCollected),
          totalCount: d.totalFinesIssued,
          paidCount: d.paidFinesCount,
        })),
      );
      setCategories(
        categoryData.map((c) => ({
          name: c.categoryCode,
          value: Number(c.totalCollected),
          totalCount: c.totalFinesIssued,
          paidCount: c.paidFinesCount,
        })),
      );
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Live Activity Ticker simulation
  useEffect(() => {
    const list = [
      {
        id: '1',
        title: 'New Fine Issued',
        message: 'Sgt. Bandara issued a LKR 2,500 ticket for Speeding in Colombo.',
        time: 'Just now',
        highlight: 'warning',
      },
      {
        id: '2',
        title: 'Online Fine Settlement',
        message: 'Fine Ref SLP-2026-9814 (LKR 25,000) paid online. SMS notification sent to Sgt. Silva.',
        time: '4 mins ago',
        highlight: 'success',
      },
      {
        id: '3',
        title: 'New Fine Issued',
        message: 'Sgt. Fernando issued a LKR 1,500 ticket for Riding without a helmet in Gampaha.',
        time: '12 mins ago',
        highlight: 'warning',
      },
    ];
    setTickerEvents(list);

    const interval = setInterval(() => {
      const events = [
        {
          title: 'New Fine Issued',
          message: 'Sgt. Bandara issued a Speeding ticket (LKR 2,500) to driver in Colombo.',
          highlight: 'warning',
        },
        {
          title: 'Online Fine Settlement',
          message: 'Fine Ref SLP-2026-9816 (LKR 2,500) paid online via Web Payment Portal.',
          highlight: 'success',
        },
        {
          title: 'On-the-spot Settlement',
          message: 'Fine Ref SLP-2026-9817 (LKR 2,000) cleared immediately by motorist.',
          highlight: 'success',
        },
        {
          title: 'New Fine Issued',
          message: 'IP. Wijesinghe issued a Drunk Driving ticket (LKR 25,000) in Kandy.',
          highlight: 'warning',
        },
      ];

      const chosen = events[Math.floor(Math.random() * events.length)];
      const newEv = {
        id: Math.random().toString(),
        title: chosen.title,
        message: chosen.message,
        time: new Date().toLocaleTimeString(),
        highlight: chosen.highlight,
      };

      setTickerEvents((prev) => [newEv, ...prev].slice(0, 8));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-text" style={{ padding: '100px 0' }}>
        <RefreshCw size={24} className="spinner" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p>Accessing National Police Fine Registry...</p>
      </div>
    );
  }

  // Calculated values
  const collectionRate = summary && summary.totalFinesIssued > 0 
    ? ((summary.paidFinesCount / summary.totalFinesIssued) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="dashboard">
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>National Revenue & Compliance Dashboard</h1>
          <p style={styles.pageSubtitle}>Real-time monitoring of Sri Lanka Police traffic fine collections</p>
        </div>
        <div style={styles.statusIndicator}>
          <div style={styles.statusPing}></div>
          <span style={styles.statusText}>Live Network Stream</span>
        </div>
      </div>

      <ErrorBanner message={error} />

      {summary && (
        <div className="stat-row">
          {/* Total Settlements */}
          <div className="stat-tile">
            <div style={styles.cardHeader}>
              <span className="stat-tile__label">Total Settlements</span>
              <div style={{ ...styles.cardIconBox, background: 'rgba(16, 185, 129, 0.08)' }}>
                <DollarSign size={18} color="var(--success)" />
              </div>
            </div>
            <span className="stat-tile__value">{formatCurrency(summary.totalCollections)}</span>
            <div style={styles.cardTrend}>
              <TrendingUp size={12} color="var(--success)" />
              <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.78rem' }}>Active Collection</span>
            </div>
          </div>

          {/* Total Fines Issued */}
          <div className="stat-tile">
            <div style={styles.cardHeader}>
              <span className="stat-tile__label">Total Fines Issued</span>
              <div style={{ ...styles.cardIconBox, background: 'rgba(59, 130, 246, 0.08)' }}>
                <FileCheck size={18} color="var(--primary-light)" />
              </div>
            </div>
            <span className="stat-tile__value">
              {summary.totalFinesIssued} <span style={styles.valueUnit}>tickets</span>
            </span>
            <div style={styles.cardTrend}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Paid: </span>
              <span style={{ color: 'var(--success)', fontWeight: '700', marginRight: '8px', fontSize: '0.75rem' }}>{summary.paidFinesCount}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending: </span>
              <span style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '0.75rem' }}>{summary.pendingFinesCount}</span>
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className="stat-tile">
            <div style={styles.cardHeader}>
              <span className="stat-tile__label">Outstanding Balance</span>
              <div style={{ ...styles.cardIconBox, background: 'rgba(239, 68, 68, 0.08)' }}>
                <AlertTriangle size={18} color="var(--danger)" />
              </div>
            </div>
            <span className="stat-tile__value">{formatCurrency(summary.totalPending || 0)}</span>
            <div style={styles.cardTrend}>
              <ShieldAlert size={12} color="var(--danger)" />
              <span style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '0.78rem' }}>Unsettled fine sheets</span>
            </div>
          </div>

          {/* Collection Efficiency */}
          <div className="stat-tile">
            <div style={styles.cardHeader}>
              <span className="stat-tile__label">Collection Efficiency</span>
              <div style={{ ...styles.cardIconBox, background: 'rgba(212, 175, 55, 0.08)' }}>
                <Activity size={18} color="var(--accent)" />
              </div>
            </div>
            <span className="stat-tile__value">{collectionRate}%</span>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${collectionRate}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Rows */}
      <div className="report-section">
        <div className="chart-card glass-panel">
          <h2>Collections by District</h2>
          <ReportBarChart data={districts} title="" />
        </div>
        <div className="glass-panel" style={{ padding: '24px', height: '100%' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px' }}>District Overview</h2>
          <ReportTable rows={[...districts].sort((a, b) => b.value - a.value)} nameLabel="District" />
        </div>
      </div>

      <div className="report-section">
        <div className="chart-card glass-panel">
          <h2>Collections by Violation Category</h2>
          <ReportBarChart data={categories} title="" />
        </div>

        {/* Live Activity Ticker (adopted from original dashboard) */}
        <div className="glass-panel live-stream-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Live Activity Stream</span>
          </h2>
          <div className="live-stream-list">
            {tickerEvents.map((ev) => (
              <div key={ev.id} className={`live-stream-item live-stream-highlight-${ev.highlight}`}>
                <div className="live-stream-header">
                  <span className="live-stream-title" style={{ color: ev.highlight === 'success' ? 'var(--success)' : 'var(--warning)' }}>
                    {ev.title}
                  </span>
                  <span className="live-stream-time">{ev.time}</span>
                </div>
                <p className="live-stream-msg">{ev.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
  },
  pageSubtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '8px 16px',
    borderRadius: '20px',
  },
  statusPing: {
    width: '8px',
    height: '8px',
    background: 'var(--success)',
    borderRadius: '50%',
    boxShadow: '0 0 10px var(--success)',
    animation: 'pulseGlow 2s infinite',
  },
  statusText: {
    fontSize: '0.78rem',
    color: 'var(--success)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: 'auto',
  },
  valueUnit: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-muted)',
  },
  progressContainer: {
    width: '100%',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: 'auto',
  },
  progressBar: {
    height: '100%',
    background: 'var(--accent)',
    borderRadius: '10px',
  },
};

import React from 'react';
import {
  MapPin, Calendar, User, Car, Badge, Clock, Building,
  AlertTriangle, ArrowRight, RotateCcw, CircleDot
} from 'lucide-react';

export default function FineDetails({ fine, onProceedToPayment, onReset }) {
  if (!fine) return null;

  const isAlreadyPaid = fine.status === 'Paid';
  const isOverdue = fine.status === 'Overdue';

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="animate-float-up" style={styles.container}>
      {/* Fine Details Card */}
      <div className="glass-panel" style={styles.card}>
        {/* Status Header */}
        <div style={styles.statusHeader}>
          <div style={styles.statusLeft}>
            <span style={styles.refLabel}>FINE REFERENCE NUMBER</span>
            <span style={styles.refNo}>{fine.refNo}</span>
          </div>
          <span className={`badge badge-${fine.status.toLowerCase()}`}>
            <CircleDot size={10} />
            {fine.status}
          </span>
        </div>

        {/* Amount Display */}
        <div style={{
          ...styles.amountBox,
          ...(isOverdue ? styles.amountBoxOverdue : {}),
        }}>
          <span style={styles.amountLabel}>Fine Amount Payable</span>
          <span style={styles.amount}>{formatAmount(fine.amount)}</span>
          {isOverdue && (
            <div style={styles.overdueWarning}>
              <AlertTriangle size={14} />
              <span>This fine is overdue (exceeded 14 days). Settle immediately to avoid court escalation.</span>
            </div>
          )}
        </div>

        {/* Violation Info */}
        <div style={styles.violationType}>
          <span style={styles.violationLabel}>Offense Category</span>
          <span style={styles.violationName}>{fine.categoryName}</span>
          {fine.penaltyPoints > 0 && (
            <span style={styles.penaltyPoints}>
              ⚡ {fine.penaltyPoints} penalty point{fine.penaltyPoints > 1 ? 's' : ''} assigned
            </span>
          )}
        </div>

        <div className="divider" />

        {/* Details Grid */}
        <div style={styles.detailsGrid} className="stagger-children">
          <DetailRow icon={User} label="Driver Name" value={fine.driverName} />
          <DetailRow icon={Badge} label="Driving License No." value={fine.driverLicense} />
          <DetailRow icon={Car} label="Vehicle Registration No." value={fine.vehicleNo} />
          <DetailRow icon={MapPin} label="Offense Location / District" value={`${fine.location} (${fine.district})`} />
          <DetailRow icon={Calendar} label="Issue Date & Time" value={formatDate(fine.issuedAt)} />
          <DetailRow icon={Building} label="Issuing Officer & Station" value={`${fine.officerName} (${fine.station || fine.district + ' Traffic'})`} />
        </div>

        {/* Already Paid Notice */}
        {isAlreadyPaid && (
          <>
            <div className="divider" />
            <div className="alert alert-success" style={{ margin: '0 24px 20px' }}>
              <span style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
                ✅ This traffic fine was settled on <strong>{formatDate(fine.paidAt)}</strong> via <strong>{fine.paymentMethod || 'Web Portal'}</strong>. No further payment is required.
              </span>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={styles.actions}>
          {!isAlreadyPaid && (
            <button
              className="btn btn-accent btn-lg btn-full"
              onClick={onProceedToPayment}
              id="proceed-to-payment-btn"
            >
              Proceed to Secure Payment
              <ArrowRight size={18} />
            </button>
          )}

          <button
            className="btn btn-ghost btn-full"
            onClick={onReset}
            id="search-another-btn"
            style={{ marginTop: isAlreadyPaid ? 0 : '8px' }}
          >
            <RotateCcw size={16} />
            Search Another Fine
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div style={styles.detailRow}>
      <div style={styles.detailIcon}>
        <Icon size={16} />
      </div>
      <div style={styles.detailContent}>
        <span style={styles.detailLabel}>{label}</span>
        <span style={styles.detailValue}>{value}</span>
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
  card: {
    padding: '0',
    overflow: 'hidden',
  },
  statusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  statusLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  refLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  refNo: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'monospace',
    letterSpacing: '0.02em',
  },
  amountBox: {
    padding: '24px',
    textAlign: 'center',
    background: 'var(--accent-soft)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  amountBoxOverdue: {
    background: 'rgba(239, 68, 68, 0.06)',
  },
  amountLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '6px',
  },
  amount: {
    display: 'block',
    fontSize: '2.2rem',
    fontWeight: '800',
    color: 'var(--accent)',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  overdueWarning: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '12px',
    color: 'var(--danger)',
    fontSize: '0.78rem',
    fontWeight: '500',
  },
  violationType: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  violationLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  violationName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  penaltyPoints: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--warning)',
    marginTop: '2px',
  },
  detailsGrid: {
    padding: '4px 24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  detailIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-dark)',
    flexShrink: 0,
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  detailValue: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-main)',
  },
  actions: {
    padding: '20px 24px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
};

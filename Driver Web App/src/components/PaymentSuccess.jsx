import React from 'react';
import {
  CheckCircle, MessageSquare, CreditCard, FileText,
  RotateCcw, Printer, Clock, MapPin, User
} from 'lucide-react';

export default function PaymentSuccess({ result, onReset }) {
  const fine = result.fine;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-float-up" style={styles.container}>
      {/* Success Animation */}
      <div style={styles.successAnimation}>
        <div style={styles.checkmarkCircle}>
          <svg
            viewBox="0 0 52 52"
            width="72"
            height="72"
            style={styles.checkmarkSvg}
          >
            <circle
              cx="26"
              cy="26"
              r="23"
              fill="none"
              stroke="var(--success)"
              strokeWidth="3"
              style={styles.svgCircle}
            />
            <path
              fill="none"
              stroke="var(--success)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27l7 7 16-16"
              style={styles.svgCheck}
            />
          </svg>
        </div>
        <h2 style={styles.successTitle}>Payment Successful!</h2>
        <p style={styles.successDesc}>
          Your traffic fine has been settled successfully. The traffic police officer
          has been notified via SMS.
        </p>
      </div>

      {/* Confirmation Card */}
      <div className="glass-panel" style={styles.card}>
        {/* Confirmation Numbers */}
        <div style={styles.confirmSection}>
          <ConfirmRow
            label="Confirmation Number"
            value={result.confirmationNumber}
            highlight
          />
          <ConfirmRow
            label="Transaction ID"
            value={result.transactionId}
          />
          <ConfirmRow
            label="Payment Date"
            value={formatDate(result.paidAt)}
          />
          <ConfirmRow
            label="Amount Paid"
            value={formatAmount(result.amount)}
            highlight
          />
          <ConfirmRow
            label="Payment Method"
            value="Web Portal (Online)"
          />
        </div>

        <div className="divider" style={{ margin: '0 24px' }} />

        {/* Fine Details Recap */}
        <div style={styles.recapSection}>
          <h4 style={styles.recapTitle}>Fine Details</h4>
          <div style={styles.recapGrid}>
            <RecapItem icon={FileText} label="Reference" value={fine.refNo} />
            <RecapItem icon={User} label="Driver" value={fine.driverName} />
            <RecapItem icon={CreditCard} label="License" value={fine.driverLicense} />
            <RecapItem icon={MapPin} label="Location" value={fine.location} />
          </div>
        </div>

        <div className="divider" style={{ margin: '0 24px' }} />

        {/* SMS Notification Status */}
        <div style={styles.smsSection}>
          <div style={styles.smsHeader}>
            <div style={styles.smsIcon}>
              <MessageSquare size={18} color="var(--success)" />
            </div>
            <div>
              <h4 style={styles.smsTitle}>SMS Notification Sent</h4>
              <p style={styles.smsMeta}>
                To: <strong>{result.smsReceipt.officer}</strong> ({result.smsReceipt.to})
              </p>
            </div>
            <span className="badge badge-paid" style={{ marginLeft: 'auto' }}>
              <CheckCircle size={10} />
              Delivered
            </span>
          </div>
          <div style={styles.smsBody}>
            <p style={styles.smsMessage}>{result.smsReceipt.message}</p>
            <div style={styles.smsTimestamp}>
              <Clock size={12} />
              <span>{formatDate(result.smsReceipt.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button
          className="btn btn-accent btn-lg btn-full"
          onClick={onReset}
          id="pay-another-fine-btn"
        >
          <RotateCcw size={18} />
          Pay Another Fine
        </button>

        <button
          className="btn btn-secondary btn-full no-print"
          onClick={handlePrint}
          id="print-receipt-btn"
        >
          <Printer size={16} />
          Print Receipt
        </button>
      </div>

      {/* Return License Notice */}
      <div className="alert alert-info" style={{ marginTop: '16px' }}>
        <MessageSquare size={16} style={{ minWidth: 16, marginTop: 2 }} />
        <div style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
          <strong>Next Step:</strong> The traffic police officer has been notified of your payment.
          You may now retrieve your driving license from the officer who issued the fine.
        </div>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value, highlight }) {
  return (
    <div style={confirmStyles.row}>
      <span style={confirmStyles.label}>{label}</span>
      <span style={{
        ...confirmStyles.value,
        ...(highlight ? confirmStyles.valueHighlight : {}),
      }}>
        {value}
      </span>
    </div>
  );
}

function RecapItem({ icon: Icon, label, value }) {
  return (
    <div style={recapStyles.item}>
      <Icon size={14} color="var(--text-dark)" />
      <div>
        <span style={recapStyles.label}>{label}</span>
        <span style={recapStyles.value}>{value}</span>
      </div>
    </div>
  );
}

const confirmStyles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  value: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    fontFamily: 'monospace',
    letterSpacing: '0.01em',
    textAlign: 'right',
  },
  valueHighlight: {
    color: 'var(--accent)',
    fontWeight: '700',
  },
};

const recapStyles = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.04em',
  },
  value: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '500',
    color: 'var(--text-main)',
  },
};

const styles = {
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '0 24px',
  },
  successAnimation: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  checkmarkCircle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    animation: 'successPulse 2s ease-in-out infinite',
  },
  checkmarkSvg: {
    display: 'block',
  },
  svgCircle: {
    strokeDasharray: 200,
    strokeDashoffset: 200,
    animation: 'checkmarkCircle 0.6s ease-in-out 0.2s forwards',
  },
  svgCheck: {
    strokeDasharray: 60,
    strokeDashoffset: 60,
    animation: 'checkmarkDraw 0.4s ease-in-out 0.6s forwards',
  },
  successTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--success)',
    marginBottom: '8px',
  },
  successDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    maxWidth: '420px',
    margin: '0 auto',
  },
  card: {
    padding: '0',
    overflow: 'hidden',
  },
  confirmSection: {
    padding: '24px 24px 16px',
  },
  recapSection: {
    padding: '16px 24px',
  },
  recapTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '12px',
  },
  recapGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  smsSection: {
    padding: '16px 24px 24px',
  },
  smsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  smsIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--success-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  smsTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  smsMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  smsBody: {
    background: 'rgba(16, 185, 129, 0.04)',
    border: '1px solid rgba(16, 185, 129, 0.12)',
    borderRadius: '8px',
    padding: '14px',
  },
  smsMessage: {
    fontSize: '0.8rem',
    color: 'var(--text-main)',
    lineHeight: '1.5',
    fontFamily: 'monospace',
  },
  smsTimestamp: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '10px',
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '24px',
  },
};

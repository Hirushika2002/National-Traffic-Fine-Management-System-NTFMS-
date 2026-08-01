import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFineContext } from '../context/FineContext';
import { Check, Printer, ArrowRight } from 'lucide-react';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(amount));
}

function formatDateTime(isoDate) {
  return new Date(isoDate).toLocaleString('en-LK', { dateStyle: 'long', timeStyle: 'short' });
}

export default function ReceiptPage() {
  const { fine, payment, reset } = useFineContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fine || !payment) {
      navigate('/', { replace: true });
    }
  }, [fine, payment, navigate]);

  if (!fine || !payment) return null;

  function handleLookupAnother() {
    reset();
    navigate('/');
  }

  return (
    <div className="page page--centered animate-fade-in-scale">
      <div className="card glass-panel" style={{ marginTop: '20px' }}>
        <div className="receipt-header">
          <div className="receipt-icon-wrapper">
            <Check size={28} color="var(--success)" />
          </div>
          <h1>Payment Successful</h1>
          <span className="badge badge--paid" style={{ marginTop: '8px' }}>LKR settled</span>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
          Fine reference <strong style={{ color: 'var(--text-main)' }}>{fine.referenceNo}</strong> for vehicle <strong style={{ color: 'var(--text-main)' }}>{fine.vehicleNo}</strong> has been successfully settled. An automated SMS notification has been dispatched to the issuing traffic officer to enable release of the physical driving license.
        </p>

        <dl className="fine-details" style={{ marginBottom: '28px' }}>
          <div>
            <dt>Transaction Reference</dt>
            <dd style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1rem' }}>{payment.transactionRef}</dd>
          </div>
          <div>
            <dt>Amount Paid</dt>
            <dd style={{ color: 'var(--success)', fontWeight: '800' }}>{formatCurrency(payment.amountPaid)}</dd>
          </div>
          <div>
            <dt>Paid At</dt>
            <dd>{formatDateTime(payment.paidAt)}</dd>
          </div>
          <div>
            <dt>Payment Channel</dt>
            <dd style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold' }}>{payment.channel}</dd>
          </div>
        </dl>

        <div className="actions">
          <button type="button" className="btn btn--primary" onClick={() => window.print()} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Printer size={16} />
            Print Official Receipt
          </button>
          <button type="button" className="btn btn--secondary" onClick={handleLookupAnother} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            Process Next Fine
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

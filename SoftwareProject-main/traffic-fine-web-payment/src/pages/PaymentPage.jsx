import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFineContext } from '../context/FineContext';
import { payFine } from '../services/paymentService';
import { extractErrorMessage } from '../services/apiClient';
import FineSummaryCard from '../components/FineSummaryCard';
import CheckoutForm from '../components/CheckoutForm';

export default function PaymentPage() {
  const { fine, setPayment } = useFineContext();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!fine) {
      navigate('/', { replace: true });
    }
  }, [fine, navigate]);

  if (!fine) return null;

  async function handleSubmit(formValues) {
    setSubmitError('');
    setSubmitting(true);
    try {
      const payment = await payFine({
        ...formValues,
        fineId: fine.id,
        amount: Number(fine.amount),
        channel: 'WEB',
      });
      setPayment(payment);
      navigate('/receipt');
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'Payment could not be processed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page--centered">
      <FineSummaryCard fine={fine} />
      <div className="card">
        <h2>Checkout</h2>
        <CheckoutForm onSubmit={handleSubmit} submitting={submitting} submitError={submitError} />
      </div>
    </div>
  );
}

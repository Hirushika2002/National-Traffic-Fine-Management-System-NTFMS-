import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFineContext } from '../context/FineContext';
import FineSummaryCard from '../components/FineSummaryCard';

export default function DetailsPage() {
  const { fine } = useFineContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fine) {
      navigate('/', { replace: true });
    }
  }, [fine, navigate]);

  if (!fine) return null;

  const isPaid = fine.status === 'PAID';

  return (
    <div className="page page--centered">
      <FineSummaryCard fine={fine} />

      <div className="actions">
        {isPaid ? (
          <>
            <p className="success-text">This fine has already been paid. No further action is needed.</p>
            <Link to="/" className="btn btn--secondary">
              Look up another fine
            </Link>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/payment')}>
              Proceed to Payment
            </button>
            <Link to="/" className="btn btn--secondary">
              Back
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

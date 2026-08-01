function formatCurrency(amount) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(amount));
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function FineSummaryCard({ fine }) {
  const isPaid = fine.status === 'PAID';

  return (
    <div className="card">
      <div className="card__header">
        <h2>Fine {fine.referenceNo}</h2>
        <span className={`badge ${isPaid ? 'badge--paid' : 'badge--pending'}`}>{fine.status}</span>
      </div>

      <dl className="fine-details">
        <div>
          <dt>Violation</dt>
          <dd>
            {fine.category.description} ({fine.category.code})
          </dd>
        </div>
        <div>
          <dt>Vehicle No.</dt>
          <dd>{fine.vehicleNo}</dd>
        </div>
        <div>
          <dt>Issue Date</dt>
          <dd>{formatDate(fine.issueDate)}</dd>
        </div>
        <div>
          <dt>District</dt>
          <dd>{fine.district.name}</dd>
        </div>
        <div>
          <dt>Issuing Officer</dt>
          <dd>
            {fine.officer.fullName} ({fine.officer.station})
          </dd>
        </div>
        <div className="fine-details__amount">
          <dt>Amount Due</dt>
          <dd>{formatCurrency(fine.amount)}</dd>
        </div>
      </dl>
    </div>
  );
}

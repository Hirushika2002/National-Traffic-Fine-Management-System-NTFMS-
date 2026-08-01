function formatCurrency(value) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(
    Number(value),
  );
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function FineTable({ fines }) {
  if (fines.length === 0) {
    return <p className="empty-text">No fines match the current filters.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Reference No.</th>
            <th>Vehicle</th>
            <th>Category</th>
            <th>District</th>
            <th>Officer</th>
            <th className="numeric">Amount</th>
            <th>Status</th>
            <th>Issue Date</th>
          </tr>
        </thead>
        <tbody>
          {fines.map((fine) => (
            <tr key={fine.id}>
              <td>{fine.referenceNo}</td>
              <td>{fine.vehicleNo}</td>
              <td>{fine.category.code}</td>
              <td>{fine.district.name}</td>
              <td>{fine.officer.fullName}</td>
              <td className="numeric">{formatCurrency(fine.amount)}</td>
              <td>
                <span className={`badge ${fine.status === 'PAID' ? 'badge--paid' : 'badge--pending'}`}>
                  {fine.status}
                </span>
              </td>
              <td>{formatDate(fine.issueDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

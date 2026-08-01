function formatCurrency(value) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function ReportTable({ rows, nameLabel }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>{nameLabel}</th>
            <th className="numeric">Fines Issued</th>
            <th className="numeric">Paid</th>
            <th className="numeric">Total Collected</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td className="numeric">{row.totalCount}</td>
              <td className="numeric">{row.paidCount}</td>
              <td className="numeric">{formatCurrency(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

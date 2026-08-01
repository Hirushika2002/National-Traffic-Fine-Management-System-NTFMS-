export default function FineFilters({ filters, districts, categories, onChange, onReset }) {
  function update(field) {
    return (event) => onChange({ ...filters, [field]: event.target.value });
  }

  return (
    <div className="filters-row">
      <div className="form-field form-field--inline">
        <label htmlFor="filter-status">Status</label>
        <select id="filter-status" value={filters.status} onChange={update('status')}>
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="form-field form-field--inline">
        <label htmlFor="filter-district">District</label>
        <select id="filter-district" value={filters.districtId} onChange={update('districtId')}>
          <option value="">All</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field form-field--inline">
        <label htmlFor="filter-category">Category</label>
        <select id="filter-category" value={filters.categoryId} onChange={update('categoryId')}>
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field form-field--inline">
        <label htmlFor="filter-start">From</label>
        <input id="filter-start" type="date" value={filters.startDate} onChange={update('startDate')} />
      </div>

      <div className="form-field form-field--inline">
        <label htmlFor="filter-end">To</label>
        <input id="filter-end" type="date" value={filters.endDate} onChange={update('endDate')} />
      </div>

      <button type="button" className="btn btn--secondary btn--compact" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}

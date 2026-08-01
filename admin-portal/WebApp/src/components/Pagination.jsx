export default function Pagination({ pagination, onPageChange }) {
  const { page, totalPages, total } = pagination;

  return (
    <div className="pagination">
      <span className="pagination__summary">
        Page {totalPages === 0 ? 0 : page} of {totalPages} &middot; {total} fines
      </span>
      <div className="pagination__controls">
        <button
          type="button"
          className="btn btn--secondary btn--compact"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn--secondary btn--compact"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

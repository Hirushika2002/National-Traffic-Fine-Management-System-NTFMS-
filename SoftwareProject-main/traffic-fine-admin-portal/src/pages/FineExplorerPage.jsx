import { useEffect, useState } from 'react';
import { getFines } from '../services/fineService';
import { getDistrictReport, getCategoryReport } from '../services/reportService';
import { extractErrorMessage } from '../services/apiClient';
import FineFilters from '../components/FineFilters';
import FineTable from '../components/FineTable';
import Pagination from '../components/Pagination';
import ErrorBanner from '../components/ErrorBanner';

const EMPTY_FILTERS = { status: '', districtId: '', categoryId: '', startDate: '', endDate: '' };

export default function FineExplorerPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [fines, setFines] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDistrictReport()
      .then((data) => setDistricts(data.map((d) => ({ id: d.districtId, name: d.districtName }))))
      .catch(() => {});
    getCategoryReport()
      .then((data) => setCategories(data.map((c) => ({ id: c.categoryId, code: c.categoryCode }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await getFines({ ...filters, page, limit: 10 });
        if (cancelled) return;
        setFines(result.items);
        setPagination(result.pagination);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Failed to load fines.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleReset() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  return (
    <div className="fine-explorer">
      <h1>Fine Explorer</h1>

      <FineFilters
        filters={filters}
        districts={districts}
        categories={categories}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      <ErrorBanner message={error} />

      <div className="card">
        {loading ? <p className="loading-text">Loading fines...</p> : <FineTable fines={fines} />}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}

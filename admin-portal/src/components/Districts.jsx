import React, { useState, useEffect } from 'react';
import { Map, Search, ArrowUp, ArrowDown, MapPin, DollarSign, Percent } from 'lucide-react';
import { apiService } from '../services/api';

export default function Districts() {
  const [districts, setDistricts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('collected');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadDistrictData();
  }, []);

  const loadDistrictData = () => {
    const data = apiService.getDistrictWiseCollections();
    setDistricts(data);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const sortedDistricts = [...districts]
    .filter(d => d.district.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      // Calculate efficiency on the fly if needed
      if (sortField === 'efficiency') {
        valA = a.totalAmount > 0 ? (a.collected / a.totalAmount) * 100 : 0;
        valB = b.totalAmount > 0 ? (b.collected / b.totalAmount) * 100 : 0;
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Metrics for District summaries
  const totalOffenses = districts.reduce((acc, curr) => acc + curr.count, 0);
  const totalDistrictCollected = districts.reduce((acc, curr) => acc + curr.collected, 0);
  const activeDistrict = districts.length > 0 ? [...districts].sort((a,b) => b.count - a.count)[0] : null;

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Page Header */}
      <div>
        <h1 style={styles.pageTitle}>District Collection Performance</h1>
        <p style={styles.pageSubtitle}>National geographic breakdown of compliance and fine settlement distributions.</p>
      </div>

      {/* Overview stats cards */}
      <div style={styles.summaryRow}>
        <div className="glass-card" style={styles.summaryCard}>
          <div style={styles.summaryHeader}>
            <Map size={18} color="var(--accent)" />
            <span style={styles.summaryLabel}>Total Offense Nodes</span>
          </div>
          <span style={styles.summaryValue}>25 Districts</span>
          <span style={styles.summarySub}>Actively monitoring traffic units</span>
        </div>

        <div className="glass-card" style={styles.summaryCard}>
          <div style={styles.summaryHeader}>
            <DollarSign size={18} color="var(--success)" />
            <span style={styles.summaryLabel}>Total Collected Revenue</span>
          </div>
          <span style={styles.summaryValue}>LKR {totalDistrictCollected.toLocaleString()}</span>
          <span style={styles.summarySub}>{totalOffenses} tickets registered</span>
        </div>

        <div className="glass-card" style={styles.summaryCard}>
          <div style={styles.summaryHeader}>
            <MapPin size={18} color="var(--primary-light)" />
            <span style={styles.summaryLabel}>Highest Violation Hub</span>
          </div>
          <span style={styles.summaryValue}>{activeDistrict ? activeDistrict.district : 'Colombo'}</span>
          <span style={styles.summarySub}>{activeDistrict ? activeDistrict.count : 0} citations registered</span>
        </div>
      </div>

      {/* District Rankings Table */}
      <div className="glass-panel" style={styles.tablePanel}>
        <div style={styles.tableToolbar}>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by District name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <span style={styles.toolbarText}>Click column headers to sort rankings</span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={{ ...styles.th, width: '80px' }}>Rank</th>
                <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => handleSort('district')}>
                  District Name {getSortIcon('district')}
                </th>
                <th style={{ ...styles.th, cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('count')}>
                  Tickets Issued {getSortIcon('count')}
                </th>
                <th style={{ ...styles.th, cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('totalAmount')}>
                  Fine Amount Issued {getSortIcon('totalAmount')}
                </th>
                <th style={{ ...styles.th, cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('collected')}>
                  Setted Collection {getSortIcon('collected')}
                </th>
                <th style={{ ...styles.th, cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('efficiency')}>
                  Settlement Rate {getSortIcon('efficiency')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedDistricts.map((item, index) => {
                const efficiency = item.totalAmount > 0 ? ((item.collected / item.totalAmount) * 100) : 0;
                // Determine rank based on original array index, or index in sorted
                const rank = districts.findIndex(d => d.district === item.district) + 1;
                
                return (
                  <tr key={item.district} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--text-dark)' }}>
                      #{rank}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--text-main)' }}>
                      {item.district}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {item.count}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      LKR {item.totalAmount.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: 'var(--success)' }}>
                      LKR {item.collected.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.rateCol}>
                        <span style={{ fontWeight: '700', color: efficiency > 75 ? 'var(--success)' : (efficiency > 40 ? 'var(--warning)' : 'var(--danger)') }}>
                          {efficiency.toFixed(1)}%
                        </span>
                        <div style={styles.miniBarTrack}>
                          <div style={{ 
                            ...styles.miniBarFill, 
                            width: `${efficiency}%`,
                            backgroundColor: efficiency > 75 ? 'var(--success)' : (efficiency > 40 ? 'var(--warning)' : 'var(--danger)')
                          }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  pageTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em'
  },
  pageSubtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)'
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px'
  },
  summaryCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  summaryLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  summaryValue: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-main)'
  },
  summarySub: {
    fontSize: '0.78rem',
    color: 'var(--text-dark)'
  },
  tablePanel: {
    padding: '24px'
  },
  tableToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '260px'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-dark)'
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 36px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    fontSize: '0.88rem',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'var(--transition-smooth)'
  },
  toolbarText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)'
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeadRow: {
    borderBottom: '2px solid var(--border-subtle)'
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tr: {
    borderBottom: '1px solid var(--border-subtle)',
    transition: 'var(--transition-fast)'
  },
  td: {
    padding: '16px',
    fontSize: '0.88rem',
    color: 'var(--text-main)'
  },
  rateCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  miniBarTrack: {
    width: '80px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  miniBarFill: {
    height: '100%',
    borderRadius: '2px'
  }
};

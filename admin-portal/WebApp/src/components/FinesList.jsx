import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  Eye,
  X,
  CreditCard,
  Phone,
  User,
  Navigation,
  FileCheck
} from 'lucide-react';
import { apiService, DISTRICTS } from '../services/api';

export default function FinesList() {
  const [fines, setFines] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Detail Modal & Pay Simulation States
  const [selectedFine, setSelectedFine] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  const loadData = async () => {
    const filters = {
      search: searchTerm,
      district: selectedDistrict,
      category: selectedCategory,
      status: selectedStatus,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };
    const results = await apiService.getFines(filters);
    setFines(results);
  };

  useEffect(() => {
    const init = async () => {
      setCategories(await apiService.getCategories());
      await loadData();
    };
    init();
  }, [searchTerm, selectedDistrict, selectedCategory, selectedStatus, startDate, endDate]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDistrict('');
    setSelectedCategory('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
  };

  const handleOpenDetail = (fine) => {
    setSelectedFine(fine);
    setPaymentSuccessMsg('');
    setShowPayModal(false);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      alert('Please fill out all card payment details.');
      return;
    }

    setPaying(true);
    try {
      const result = await apiService.payFine(selectedFine.refNo, {
        cardName,
        cardNumber,
        cardExpiry,
        cardCvv
      });
      
      setPaymentSuccessMsg('Payment successfully processed! SMS dispatch sent to the officer.');
      
      // Update selected fine details in the modal
      setSelectedFine(result.fine);
      
      // Reload main grid
      loadData();
    } catch (err) {
      alert(err.message || 'Payment processing failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Page Header */}
      <div>
        <h1 style={styles.pageTitle}>Traffic Fine Register & Settlements</h1>
        <p style={styles.pageSubtitle}>Search, analyze, and settle nationwide traffic citations.</p>
      </div>

      {/* Advanced Filters Panel */}
      <div className="glass-panel" style={styles.filterPanel}>
        <div style={styles.filterHeader}>
          <Filter size={18} color="var(--accent)" />
          <h3 style={styles.filterTitle}>Advanced Registry Filters</h3>
          {(searchTerm || selectedDistrict || selectedCategory || selectedStatus || startDate || endDate) && (
            <button onClick={handleClearFilters} style={styles.clearBtn}>
              Reset Filters
            </button>
          )}
        </div>

        <div style={styles.filterGrid}>
          {/* Text Search */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>General Search</label>
            <div style={styles.inputWrapper}>
              <Search size={16} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Ref No, License, Driver, Officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* District Select */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>District</label>
            <div style={styles.inputWrapper}>
              <MapPin size={16} style={styles.inputIcon} />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ ...styles.input, appearance: 'none', paddingLeft: '34px' }}
              >
                <option value="">All 25 Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Select */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Violation Category</label>
            <div style={styles.inputWrapper}>
              <AlertCircle size={16} style={styles.inputIcon} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ ...styles.input, appearance: 'none', paddingLeft: '34px' }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Select */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Settlement Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={styles.selectOnly}
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Date range inputs */}
          <div style={{ ...styles.filterGroup, gridColumn: 'span 2' }}>
            <label style={styles.label}>Issue Date Range</label>
            <div style={styles.dateRangeRow}>
              <div style={styles.inputWrapper}>
                <Calendar size={14} style={styles.inputIcon} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ ...styles.input, paddingLeft: '34px' }}
                />
              </div>
              <span style={{ color: 'var(--text-dark)' }}>to</span>
              <div style={styles.inputWrapper}>
                <Calendar size={14} style={styles.inputIcon} />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ ...styles.input, paddingLeft: '34px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fines Table */}
      <div className="glass-panel" style={styles.tablePanel}>
        <div style={styles.tableHeader}>
          <span style={styles.resultCount}>Showing {fines.length} registered fines</span>
        </div>
        <div style={styles.tableWrapper}>
          {fines.length === 0 ? (
            <div style={styles.emptyState}>
              <AlertCircle size={32} color="var(--text-dark)" />
              <p>No traffic fine records match your filter criteria.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Reference No</th>
                  <th style={styles.th}>Issue Date</th>
                  <th style={styles.th}>Driver License</th>
                  <th style={styles.th}>Vehicle No</th>
                  <th style={styles.th}>District</th>
                  <th style={styles.th}>Fine Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => (
                  <tr key={fine.refNo} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--accent)' }}>{fine.refNo}</td>
                    <td style={styles.td}>{new Date(fine.issuedAt).toLocaleDateString()}</td>
                    <td style={styles.td}>{fine.driverLicense}</td>
                    <td style={styles.td}>{fine.vehicleNo}</td>
                    <td style={styles.td}>{fine.district}</td>
                    <td style={{ ...styles.td, fontWeight: '600' }}>LKR {fine.amount.toLocaleString()}</td>
                    <td style={styles.td}>
                      <span className={`badge badge-${fine.status.toLowerCase()}`}>
                        {fine.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button 
                        onClick={() => handleOpenDetail(fine)} 
                        style={styles.viewBtn}
                        className="btn-secondary"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details & Payment Modal */}
      {selectedFine && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderTitle}>
                <FileCheck size={20} color="var(--accent)" />
                <h2>Citation Ticket: {selectedFine.refNo}</h2>
              </div>
              <button onClick={() => setSelectedFine(null)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {paymentSuccessMsg && (
                <div style={styles.successAlert}>
                  <CheckCircle size={18} />
                  <span>{paymentSuccessMsg}</span>
                </div>
              )}

              <div style={styles.modalSections}>
                {/* Section 1: Offense & Vehicle */}
                <div style={styles.modalCol}>
                  <h4 style={styles.sectionHeader}>Violation Details</h4>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Category:</span>
                    <span style={styles.infoValue}>
                      {categories.find(c => c.id === selectedFine.category)?.name || selectedFine.category}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Standard Fine:</span>
                    <span style={{ ...styles.infoValue, fontWeight: '700', color: 'var(--accent)' }}>
                      LKR {selectedFine.amount.toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>District / Area:</span>
                    <span style={styles.infoValue}>
                      <MapPin size={12} style={{ marginRight: '4px' }} />
                      {selectedFine.district}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Exact Location:</span>
                    <span style={styles.infoValue}>
                      <Navigation size={12} style={{ marginRight: '4px' }} />
                      {selectedFine.location}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Issue Timestamp:</span>
                    <span style={styles.infoValue}>{new Date(selectedFine.issuedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Section 2: Driver & Officer */}
                <div style={styles.modalCol}>
                  <h4 style={styles.sectionHeader}>Motorist & Officer Profile</h4>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Driver Name:</span>
                    <span style={styles.infoValue}>
                      <User size={12} style={{ marginRight: '4px' }} />
                      {selectedFine.driverName}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>License No:</span>
                    <span style={styles.infoValue}>{selectedFine.driverLicense}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Vehicle Plate:</span>
                    <span style={{ ...styles.infoValue, fontWeight: '600' }}>{selectedFine.vehicleNo}</span>
                  </div>
                  <div style={styles.divider}></div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Officer-in-Charge:</span>
                    <span style={styles.infoValue}>{selectedFine.officerName} (ID: {selectedFine.officerId})</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Officer Contact:</span>
                    <span style={styles.infoValue}>
                      <Phone size={12} style={{ marginRight: '4px' }} />
                      {selectedFine.officerPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div style={styles.statusSection}>
                <div style={styles.statusHeaderRow}>
                  <span style={styles.infoLabel}>Payment Status:</span>
                  <span className={`badge badge-${selectedFine.status.toLowerCase()}`}>
                    {selectedFine.status}
                  </span>
                </div>
                
                {selectedFine.status === 'Paid' ? (
                  <div style={styles.paymentReceipt}>
                    <h5 style={styles.receiptTitle}>Settle Receipt Details</h5>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Payment Channel:</span>
                      <span style={styles.infoValue}>{selectedFine.paymentMethod}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Settlement Date:</span>
                      <span style={styles.infoValue}>{new Date(selectedFine.paidAt).toLocaleString()}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>SMS Dispatch Receipt:</span>
                      <span style={{ ...styles.infoValue, color: 'var(--success)', fontWeight: 'bold' }}>
                        Confirmed Delivery
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={styles.unpaidBanner}>
                    <p style={styles.unpaidText}>
                      This ticket is currently outstanding. If this driver is paying online via the web portal or if you wish to settle this fine manually, click below.
                    </p>
                    {!showPayModal ? (
                      <button 
                        onClick={() => setShowPayModal(true)} 
                        className="btn btn-accent"
                        style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                      >
                        <CreditCard size={16} />
                        Process Online Settlement
                      </button>
                    ) : (
                      <form onSubmit={handlePaySubmit} className="glass-card animate-fade-in" style={styles.payForm}>
                        <h5 style={styles.payFormTitle}>Credit / Debit Card Gateway</h5>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Cardholder Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. HIRUNI PERERA"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            style={styles.modalInput}
                            required
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Card Number</label>
                          <input
                            type="text"
                            placeholder="xxxx xxxx xxxx xxxx"
                            maxLength="19"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            style={styles.modalInput}
                            required
                          />
                        </div>
                        <div style={styles.payFormRow}>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Expiry (MM/YY)</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength="5"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              style={styles.modalInput}
                              required
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>CVV</label>
                            <input
                              type="password"
                              placeholder="***"
                              maxLength="3"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              style={styles.modalInput}
                              required
                            />
                          </div>
                        </div>
                        <div style={styles.payBtnRow}>
                          <button 
                            type="button" 
                            onClick={() => setShowPayModal(false)} 
                            className="btn btn-secondary"
                            disabled={paying}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={paying}
                          >
                            {paying ? 'Authorizing LKR...' : `Settle LKR ${selectedFine.amount}`}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
  filterPanel: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  filterTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    flexGrow: 1
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    alignItems: 'end'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-dark)'
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 36px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'var(--transition-smooth)'
  },
  selectOnly: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'var(--transition-smooth)'
  },
  dateRangeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  tablePanel: {
    padding: '24px'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  resultCount: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
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
  viewBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'var(--transition-smooth)'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '12px',
    color: 'var(--text-dark)',
    fontSize: '0.95rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    backdropFilter: 'blur(4px)',
    padding: '20px'
  },
  modalContent: {
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '28px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '16px',
    marginBottom: '20px'
  },
  modalHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.1rem',
    color: 'var(--text-main)'
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: 'var(--success)',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  modalSections: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px'
  },
  modalCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionHeader: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '6px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
    lineHeight: '1.4'
  },
  infoLabel: {
    color: 'var(--text-muted)'
  },
  infoValue: {
    color: 'var(--text-main)',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center'
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-subtle)',
    margin: '8px 0'
  },
  statusSection: {
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '20px',
    marginTop: '10px'
  },
  statusHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  paymentReceipt: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  receiptTitle: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  unpaidBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  unpaidText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  payForm: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '8px',
    border: '1px solid rgba(212, 175, 55, 0.2)'
  },
  payFormTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '8px',
    marginBottom: '4px'
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    fontSize: '0.88rem',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'var(--transition-smooth)'
  },
  payFormRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  payBtnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px'
  }
};

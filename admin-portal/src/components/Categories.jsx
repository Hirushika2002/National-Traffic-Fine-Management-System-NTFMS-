import React, { useState, useEffect } from 'react';
import { Sliders, Plus, DollarSign, Award, Tag, BookOpen, Trash } from 'lucide-react';
import { apiService } from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  
  // Form States
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setCategories(apiService.getCategories());
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newId || !newName || !newAmount) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      apiService.addCategory({
        id: newId,
        name: newName,
        amount: newAmount,
        penaltyPoints: newPoints
      });

      // Reset Form & reload list
      setNewId('');
      setNewName('');
      setNewAmount('');
      setNewPoints('');
      setFormOpen(false);
      loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to add violation category.');
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Traffic Fine Categories</h1>
          <p style={styles.pageSubtitle}>Manage national ticket price structures and penalty schemas.</p>
        </div>
        <button 
          onClick={() => setFormOpen(!formOpen)} 
          className="btn btn-accent"
        >
          {formOpen ? 'Close Editor' : 'Define New Category'}
          {!formOpen && <Plus size={16} />}
        </button>
      </div>

      {/* Editor Panel (Form) */}
      {formOpen && (
        <div className="glass-panel" style={styles.editorPanel}>
          <h3 style={styles.editorTitle}>Define Traffic Violation Schema</h3>
          <form onSubmit={handleAddCategory} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category Identifier (Code)</label>
                <div style={styles.inputWrapper}>
                  <Tag size={16} style={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. CAT-10"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Violation Offense Description</label>
                <div style={styles.inputWrapper}>
                  <BookOpen size={16} style={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. Operating Vehicle Without Safety Lights"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Fine Amount (LKR)</label>
                <div style={styles.inputWrapper}>
                  <DollarSign size={16} style={styles.inputIcon} />
                  <input
                    type="number"
                    placeholder="e.g. 3000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>License Demerit Points</label>
                <div style={styles.inputWrapper}>
                  <Award size={16} style={styles.inputIcon} />
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
            
            <div style={styles.btnRow}>
              <button 
                type="button" 
                onClick={() => setFormOpen(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Publish Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid listing */}
      <div style={styles.categoriesGrid}>
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card" style={styles.catCard}>
            <div style={styles.catCardHeader}>
              <span style={styles.catId}>{cat.id}</span>
              <div style={styles.pointsBadge}>
                <Award size={12} color="var(--accent)" />
                <span>{cat.penaltyPoints || 0} demerits</span>
              </div>
            </div>
            <h3 style={styles.catName}>{cat.name}</h3>
            <div style={styles.divider}></div>
            <div style={styles.catCardFooter}>
              <span style={styles.priceLabel}>Standard Fine:</span>
              <span style={styles.priceValue}>LKR {cat.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
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
  editorPanel: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  editorTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    borderLeft: '3px solid var(--accent)',
    paddingLeft: '10px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  inputGroup: {
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
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  catCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    justifyContent: 'space-between'
  },
  catCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  catId: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--accent)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  pointsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  catName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    lineHeight: '1.4',
    flexGrow: 1
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-subtle)'
  },
  catCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  priceValue: {
    fontSize: '0.98rem',
    fontWeight: '800',
    color: 'var(--text-main)'
  }
};

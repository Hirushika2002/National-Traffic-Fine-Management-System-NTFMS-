import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  Map, 
  Sliders, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, theme, toggleTheme }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard Insights', icon: LayoutDashboard },
    { id: 'fines', name: 'Fines Monitor', icon: FileText },
    { id: 'districts', name: 'District Analysis', icon: Map },
    { id: 'categories', name: 'Fine Categories', icon: Sliders },
  ];

  return (
    <aside className="glass-panel" style={styles.sidebar}>
      {/* Top App Section */}
      <div style={styles.header}>
        <div style={styles.logoBadge}>
          <Shield size={22} color="var(--accent)" />
        </div>
        <div style={styles.headerText}>
          <h2 style={styles.appTitle}>NTFMS</h2>
          <p style={styles.appSubtitle}>Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <IconComponent 
                size={18} 
                style={isActive ? styles.iconActive : styles.icon} 
              />
              <span style={isActive ? styles.textActive : styles.text}>{item.name}</span>
              {isActive && <div style={styles.activeIndicator}></div>}
            </button>
          );
        })}
      </nav>

      {/* Footer controls & Profile */}
      <div style={styles.footer}>
        {/* Theme Toggle */}
        <button onClick={toggleTheme} style={styles.themeToggle}>
          {theme === 'dark' ? (
            <>
              <Sun size={16} color="var(--accent)" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} color="var(--primary)" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* User Card */}
        <div style={styles.userCard}>
          <div style={styles.userAvatar}>
            {user?.name ? user.name.split(' ').pop().charAt(0) : 'A'}
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name || 'Administrator'}</span>
            <span style={styles.userRole}>{user?.role || 'Senior Officer'}</span>
          </div>
        </div>

        {/* Logout */}
        <button onClick={onLogout} style={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '280px',
    height: 'calc(100vh - 40px)',
    position: 'fixed',
    top: '20px',
    left: '20px',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
    borderRadius: '16px',
    boxShadow: 'var(--shadow-premium)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '24px'
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column'
  },
  appTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    letterSpacing: '0.04em',
    color: 'var(--text-main)'
  },
  appSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1
  },
  navItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'var(--transition-smooth)'
  },
  navItemActive: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-subtle)',
    boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.02)'
  },
  icon: {
    color: 'var(--text-muted)',
    transition: 'var(--transition-smooth)'
  },
  iconActive: {
    color: 'var(--accent)'
  },
  text: {
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    transition: 'var(--transition-smooth)'
  },
  textActive: {
    fontSize: '0.92rem',
    color: 'var(--text-main)',
    fontWeight: '600'
  },
  activeIndicator: {
    position: 'absolute',
    left: '0',
    top: '25%',
    height: '50%',
    width: '4px',
    backgroundColor: 'var(--accent)',
    borderRadius: '0 4px 4px 0'
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-subtle)'
  },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'var(--transition-smooth)',
    justifyContent: 'center'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 4px'
  },
  userAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '700',
    border: '1px solid var(--border-subtle)'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '180px',
    overflow: 'hidden'
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px',
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'var(--transition-smooth)'
  }
};

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FinesList from './components/FinesList';
import Districts from './components/Districts';
import Categories from './components/Categories';
import { authService } from './services/authService';

export default function App() {
  const [user, setUser]                     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [theme, setTheme]                   = useState('dark');
  const [loading, setLoading]               = useState(true); // True until Firebase resolves initial auth state

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('ntfms_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Subscribe to Firebase Auth state.
    // Firebase calls the callback immediately with the persisted session (or null),
    // so we know the auth state before rendering anything.
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false); // Auth state resolved — safe to render
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ntfms_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Show spinner while Firebase resolves the session
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
          Establishing encrypted connection to Police Fine Network...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render Page Content based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':  return <Dashboard />;
      case 'fines':      return <FinesList />;
      case 'districts':  return <Districts />;
      case 'categories': return <Categories />;
      default:           return <Dashboard />;
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
}

const styles = {
  loadingScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-base)',
    fontFamily: 'var(--font-family)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-subtle)',
    borderTop: '4px solid var(--accent)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)',
    position: 'relative',
    transition: 'background-color 0.3s ease',
  },
  mainContent: {
    marginLeft: '320px', // Matches sidebar width (280px) + spacing
    padding: '40px 40px 40px 0',
    minHeight: '100vh',
    maxWidth: '1200px',
  },
};

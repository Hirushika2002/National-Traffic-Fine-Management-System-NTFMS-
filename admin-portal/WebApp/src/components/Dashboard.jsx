import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileCheck, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { apiService } from '../services/api';

// Harmonious custom color palette for pie charts
const PIE_COLORS = ['#3b82f6', '#d4af37', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [recentFines, setRecentFines] = useState([]);
  const [tickerEvents, setTickerEvents] = useState([]);

  // Fetch all dashboard data from Firestore
  const loadDashboardData = async () => {
    const [freshMetrics, freshDistricts, freshCategories, freshTrends, freshFines] = await Promise.all([
      apiService.getDashboardMetrics(),
      apiService.getDistrictWiseCollections(),
      apiService.getCategoryBreakdown(),
      apiService.getMonthlyTrend(),
      apiService.getFines(),
    ]);

    setMetrics(freshMetrics);
    setDistrictData(freshDistricts.slice(0, 7)); // Top 7 districts
    setCategoryData(freshCategories);
    setTrendData(freshTrends);
    setRecentFines(freshFines.slice(0, 5)); // 5 most recent
  };

  useEffect(() => {
    loadDashboardData();

    // Set up a simulated real-time event ticker (e.g. new fine issued, fine paid)
    const interval = setInterval(() => {
      simulateTrafficEvents();
    }, 12000); // Trigger a mock event every 12 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulates live traffic events on the activity ticker (no Firestore writes — UI only)
  const simulateTrafficEvents = async () => {
    const categories = await apiService.getCategories();
    const districts = ['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Kurunegala'];
    const officers = [
      { name: 'Sgt. Bandara', phone: '+94771234567' },
      { name: 'IP. Wijesinghe', phone: '+94719876543' },
      { name: 'Sgt. Fernando', phone: '+94778899100' }
    ];
    const drivers = ['Rohan Silva', 'Nimal Perera', 'Sameera Fernando', 'Fathima Riza', 'A. Jayawardene'];
    const vehicles = ['WP-CB-1245', 'WP-CAD-8811', 'CP-PD-4521', 'SP-KT-9090'];

    const roll = Math.random();
    let newEvent = null;

    if (roll > 0.55) {
      // Simulate a new traffic fine issued by an officer (ticker only, not written to Firestore)
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
      const randomOfficer = officers[Math.floor(Math.random() * officers.length)];
      const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
      const isPaidOnSpot = Math.random() > 0.7;

      newEvent = {
        id: Math.random().toString(),
        type: isPaidOnSpot ? 'pay_spot' : 'issue',
        title: isPaidOnSpot ? 'On-the-spot Settlement' : 'New Fine Issued',
        message: `${randomOfficer.name} issued a LKR ${randomCat.amount.toLocaleString()} ticket to ${randomDriver} in ${randomDistrict} (${randomCat.id}).`,
        time: new Date().toLocaleTimeString(),
        highlight: isPaidOnSpot ? 'success' : 'warning'
      };
    } else {
      // Simulate an online payment (ticker only)
      const pendingFines = await apiService.getFines({ status: 'Pending' });
      if (pendingFines.length > 0) {
        const fineToPay = pendingFines[Math.floor(Math.random() * pendingFines.length)];
        newEvent = {
          id: Math.random().toString(),
          type: 'pay_online',
          title: 'Online Fine Settlement',
          message: `Fine Ref ${fineToPay.refNo} (LKR ${fineToPay.amount.toLocaleString()}) paid online via Web Portal. SMS sent to ${fineToPay.officerName}.`,
          time: new Date().toLocaleTimeString(),
          highlight: 'success'
        };
      }
    }

    if (newEvent) {
      setTickerEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10
    }
  };

  // Helper to format LKR Currency
  const formatLKR = (amount) => {
    return 'LKR ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!metrics) {
    return <div style={styles.loading}>Accessing Police National Fine Registry...</div>;
  }

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Page Title & Police Logo */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>National Revenue & Compliance Dashboard</h1>
          <p style={styles.pageSubtitle}>Real-time monitoring of Sri Lanka Police traffic fine collections</p>
        </div>
        <div style={styles.statusIndicator}>
          <div style={styles.statusPing}></div>
          <span style={styles.statusText}>Live Network Stream</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={styles.metricsGrid}>
        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Total Settlements</span>
            <div style={{ ...styles.cardIconBox, background: 'rgba(16, 185, 129, 0.08)' }}>
              <DollarSign size={20} color="var(--success)" />
            </div>
          </div>
          <div style={styles.cardValue}>{formatLKR(metrics.totalCollected)}</div>
          <div style={styles.cardTrend}>
            <TrendingUp size={14} color="var(--success)" />
            <span style={{ color: 'var(--success)', fontWeight: '600' }}>Active Collection</span>
            <span style={styles.trendSubText}>across all districts</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Total Fines Issued</span>
            <div style={{ ...styles.cardIconBox, background: 'rgba(59, 130, 246, 0.08)' }}>
              <FileCheck size={20} color="var(--primary-light)" />
            </div>
          </div>
          <div style={styles.cardValue}>{metrics.totalFinesCount} <span style={styles.valueUnit}>tickets</span></div>
          <div style={styles.cardTrend}>
            <span style={{ color: 'var(--text-muted)' }}>Paid: </span>
            <span style={{ color: 'var(--success)', fontWeight: '700', marginRight: '8px' }}>{metrics.paidCount}</span>
            <span style={{ color: 'var(--text-muted)' }}>Outstanding: </span>
            <span style={{ color: 'var(--warning)', fontWeight: '700' }}>{metrics.pendingCount + metrics.overdueCount}</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Outstanding Balance</span>
            <div style={{ ...styles.cardIconBox, background: 'rgba(239, 68, 68, 0.08)' }}>
              <AlertTriangle size={20} color="var(--danger)" />
            </div>
          </div>
          <div style={styles.cardValue}>{formatLKR(metrics.totalPending)}</div>
          <div style={styles.cardTrend}>
            <span style={{ color: 'var(--danger)', fontWeight: '600' }}>{metrics.overdueCount} Overdue tickets</span>
            <span style={styles.trendSubText}>requiring court action</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Collection Efficiency</span>
            <div style={{ ...styles.cardIconBox, background: 'rgba(212, 175, 55, 0.08)' }}>
              <Activity size={20} color="var(--accent)" />
            </div>
          </div>
          <div style={styles.cardValue}>{metrics.collectionRate}%</div>
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${metrics.collectionRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Charts Block */}
      <div style={styles.chartsGrid}>
        {/* District Wise collections bar chart */}
        <div className="glass-panel" style={styles.chartPanel}>
          <h3 style={styles.chartTitleText}>Top District Collections (LKR)</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="district" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={styles.tooltipStyle}
                  formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Settled Fines']}
                />
                <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {districtData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.district === 'Colombo' ? 'var(--accent)' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Breakdown Doughnut Chart */}
        <div className="glass-panel" style={styles.chartPanel}>
          <h3 style={styles.chartTitleText}>Fine Breakdown by Offense Category</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={styles.tooltipStyle} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center" 
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', color: 'var(--text-muted)', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Trends, Ticker, and Recent activity */}
      <div style={styles.secondaryGrid}>
        {/* Trend Area Chart */}
        <div className="glass-panel" style={{ ...styles.chartPanel, flex: 2 }}>
          <h3 style={styles.chartTitleText}>Monthly Revenue Trends (LKR)</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={styles.tooltipStyle} formatter={(v) => [`LKR ${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="collected" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Network Feeds Ticker */}
        <div className="glass-panel" style={{ ...styles.chartPanel, flex: 1.5, minWidth: '320px' }}>
          <div style={styles.tickerHeader}>
            <h3 style={styles.chartTitleText}>National Event Stream</h3>
            <span style={styles.tickerBadge}>Live Simulation</span>
          </div>
          <div style={styles.tickerScrollContainer}>
            {tickerEvents.length === 0 ? (
              <div style={styles.tickerEmpty}>
                <Clock size={20} color="var(--text-dark)" />
                <span>Waiting for traffic system events...</span>
              </div>
            ) : (
              tickerEvents.map((evt) => (
                <div key={evt.id} style={styles.tickerItem} className="animate-slide-in">
                  <div style={styles.tickerItemHeader}>
                    <span style={{ 
                      ...styles.tickerItemTitle, 
                      color: evt.highlight === 'success' ? 'var(--success)' : 'var(--warning)' 
                    }}>
                      {evt.title}
                    </span>
                    <span style={styles.tickerItemTime}>{evt.time}</span>
                  </div>
                  <p style={styles.tickerItemMsg}>{evt.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel" style={styles.recentPanel}>
        <h3 style={styles.chartTitleText}>Recent Fine Activities</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Ref Number</th>
                <th style={styles.th}>Driver License</th>
                <th style={styles.th}>Vehicle Number</th>
                <th style={styles.th}>District</th>
                <th style={styles.th}>Officer</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentFines.map((fine) => (
                <tr key={fine.refNo} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '700', color: 'var(--accent)' }}>{fine.refNo}</td>
                  <td style={styles.td}>{fine.driverLicense}</td>
                  <td style={styles.td}>{fine.vehicleNo}</td>
                  <td style={styles.td}>{fine.district}</td>
                  <td style={styles.td}>{fine.officerName}</td>
                  <td style={{ ...styles.td, fontWeight: '600' }}>LKR {fine.amount.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span className={`badge badge-${fine.status.toLowerCase()}`}>
                      {fine.status}
                    </span>
                  </td>
                </tr>
              ))}
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
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '6px 12px',
    borderRadius: '20px'
  },
  statusPing: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    boxShadow: '0 0 8px var(--success)',
    animation: 'pulseGlow 2s infinite'
  },
  statusText: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--success)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  cardIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardValue: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em'
  },
  valueUnit: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  cardTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem'
  },
  trendSubText: {
    color: 'var(--text-dark)'
  },
  progressContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    marginTop: '6px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '10px',
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px'
  },
  secondaryGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px'
  },
  chartPanel: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  chartTitleText: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    borderLeft: '3px solid var(--accent)',
    paddingLeft: '10px'
  },
  chartWrapper: {
    width: '100%',
    minHeight: '260px'
  },
  tooltipStyle: {
    backgroundColor: 'rgba(13, 22, 47, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'var(--text-main)',
    fontFamily: 'var(--font-family)',
    fontSize: '12px'
  },
  tickerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tickerBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#002244',
    backgroundColor: 'var(--accent)',
    padding: '2px 8px',
    borderRadius: '10px',
    textTransform: 'uppercase'
  },
  tickerScrollContainer: {
    maxHeight: '260px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '6px'
  },
  tickerEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: 'var(--text-dark)',
    fontSize: '0.85rem',
    height: '180px'
  },
  tickerItem: {
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  tickerItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tickerItemTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  tickerItemTime: {
    fontSize: '0.7rem',
    color: 'var(--text-dark)'
  },
  tickerItemMsg: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.3'
  },
  recentPanel: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
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
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    fontWeight: '600'
  }
};

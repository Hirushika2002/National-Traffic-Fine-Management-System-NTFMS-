import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../presentation/viewmodels/auth_viewmodel.dart';
import '../../presentation/viewmodels/officer_dashboard_viewmodel.dart';
import 'fine_list_screen.dart';

/// Officer Dashboard Screen
///
/// Provides overall statistics and quick access to fine searching and management.
class OfficerDashboard extends StatefulWidget {
  const OfficerDashboard({Key? key}) : super(key: key);

  @override
  State<OfficerDashboard> createState() => _OfficerDashboardState();
}

class _OfficerDashboardState extends State<OfficerDashboard> {
  @override
  void initState() {
    super.initState();
    // Load dashboard metrics on start
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OfficerDashboardViewModel>(context, listen: false).loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authVM = Provider.of<AuthViewModel>(context);
    final statsVM = Provider.of<OfficerDashboardViewModel>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final stats = statsVM.stats;
    final currencyFormat = NumberFormat.currency(symbol: 'Rs. ', decimalDigits: 0);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0F1E) : const Color(0xFFF4F7FE),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFF002244),
        foregroundColor: Colors.white,
        title: const Text(
          'OFFICER PORTAL',
          style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _showLogoutDialog(context, authVM),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => statsVM.loadDashboardData(),
        child: statsVM.isLoading
            ? const Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(Color(0xFFD4AF37))))
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome Banner
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: const Color(0xFFD4AF37).withOpacity(0.1),
                          child: const Icon(Icons.badge, color: Color(0xFFD4AF37)),
                        ),
                        const SizedBox(width: 14),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome, Officer',
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark ? Colors.grey[400] : Colors.grey[600],
                              ),
                            ),
                            Text(
                              authVM.user?.email ?? 'National Officer',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : const Color(0xFF0A1628),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Stats Section Header
                    Text(
                      'Compliance Overview',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF0A1628),
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Grid of aggregates
                    GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 1.35,
                      children: [
                        _buildStatCard(
                          title: 'Issued Fines',
                          value: stats.totalFinesIssued.toString(),
                          icon: Icons.assignment_outlined,
                          color: Colors.blue,
                          isDark: isDark,
                        ),
                        _buildStatCard(
                          title: 'Paid Fines',
                          value: stats.totalFinesPaid.toString(),
                          icon: Icons.check_circle_outline,
                          color: Colors.green,
                          isDark: isDark,
                        ),
                        _buildStatCard(
                          title: 'Pending Fines',
                          value: stats.pendingFines.toString(),
                          icon: Icons.hourglass_empty,
                          color: Colors.amber,
                          isDark: isDark,
                        ),
                        _buildStatCard(
                          title: 'Today\'s Fines',
                          value: stats.todaysFinesCount.toString(),
                          icon: Icons.today,
                          color: Colors.purple,
                          isDark: isDark,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Revenue aggregate card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF002244), Color(0xFF0A2E5C)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'MONTHLY COMPLIANCE REVENUE',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1,
                                ),
                              ),
                              Icon(Icons.trending_up, color: const Color(0xFFD4AF37).withOpacity(0.8), size: 20),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            currencyFormat.format(stats.monthlyRevenue),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Aggregated revenue from paid tickets this month',
                            style: TextStyle(color: Colors.white60, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Quick Actions
                    Text(
                      'Registry Navigation',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF0A1628),
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 16),

                    ListTile(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const FineListScreen()),
                        );
                      },
                      leading: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD4AF37).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.search, color: Color(0xFFD4AF37)),
                      ),
                      title: const Text('Lookup / Filter Fines', style: TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: const Text('Search violations by driver name, license, status, or date range'),
                      trailing: const Icon(Icons.chevron_right, size: 20),
                      tileColor: isDark ? Colors.white.withOpacity(0.02) : Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  // ── Stat Card Builder ──────────────────────────────────────────────
  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.03) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(isDark ? 0.05 : 0.6)),
        boxShadow: [
          if (!isDark)
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
              Icon(icon, color: color.withOpacity(0.8), size: 20),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF002244),
            ),
          ),
        ],
      ),
    );
  }

  // ── Logout confirmation ───────────────────────────────────────────
  void _showLogoutDialog(BuildContext context, AuthViewModel authVM) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to end your session?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              authVM.signOut();
            },
            child: const Text('Sign Out', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }
}

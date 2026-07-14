import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../presentation/viewmodels/auth_viewmodel.dart';
import '../../presentation/viewmodels/driver_dashboard_viewmodel.dart';
import 'driver_fines_screen.dart';
import 'driver_profile_screen.dart';

/// Driver Dashboard Screen
///
/// Displays motorist aggregates (total due, pending tickets count) and quick actions.
class DriverDashboard extends StatefulWidget {
  const DriverDashboard({Key? key}) : super(key: key);

  @override
  State<DriverDashboard> createState() => _DriverDashboardState();
}

class _DriverDashboardState extends State<DriverDashboard> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchFines();
    });
  }

  void _fetchFines() {
    final authVM = Provider.of<AuthViewModel>(context, listen: false);
    final driverProfile = authVM.driverProfile;
    if (driverProfile != null && driverProfile.licenseNumber.isNotEmpty) {
      Provider.of<DriverDashboardViewModel>(context, listen: false)
          .loadDriverFines(driverProfile.licenseNumber);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authVM = Provider.of<AuthViewModel>(context);
    final driverVM = Provider.of<DriverDashboardViewModel>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final profile = authVM.driverProfile;
    final currencyFormat = NumberFormat.currency(symbol: 'LKR ', decimalDigits: 2);

    // If driver hasn't set their license details yet, prompt them immediately
    final isProfileEmpty = profile == null || profile.licenseNumber.isEmpty;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0F1E) : const Color(0xFFF4F7FE),
      appBar: AppBar(
        title: const Text(
          'MOTORIST GATEWAY',
          style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 15),
        ),
        backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFF002244),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _showLogoutDialog(context, authVM),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          _fetchFines();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User profile header card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.03) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(isDark ? 0.05 : 0.6)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: const Color(0xFFD4AF37).withOpacity(0.1),
                      child: const Icon(Icons.person, color: Color(0xFFD4AF37), size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            profile?.name ?? 'Motorist',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            profile?.email ?? '',
                            style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600], fontSize: 12),
                          ),
                          if (!isProfileEmpty) ...[
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD4AF37).withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'DL: ${profile.licenseNumber}',
                                style: const TextStyle(
                                  color: Color(0xFFD4AF37),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Setup Prompt if profile empty
              if (isProfileEmpty) ...[
                _buildSetupPromptCard(isDark),
                const SizedBox(height: 24),
              ],

              // Totals display
              if (!isProfileEmpty) ...[
                Text(
                  'Fine Summary',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF0A1628),
                  ),
                ),
                const SizedBox(height: 16),

                // Amount Due Box
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B0000), Color(0xFFB22222)], // Dark Red
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.red.withOpacity(0.2),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'TOTAL UNSETTLED FINES',
                            style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          Icon(Icons.warning_amber_rounded, color: Colors.white.withOpacity(0.9), size: 20),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        currencyFormat.format(driverVM.totalAmountDue),
                        style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Please settle pending fines immediately to avoid license suspension.',
                        style: TextStyle(color: Colors.white60, fontSize: 10),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Pending / Paid Split Grid
                GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 1.5,
                  children: [
                    _buildStatsBox(
                      title: 'Pending Tickets',
                      value: driverVM.pendingFines.length.toString(),
                      color: Colors.amber,
                      isDark: isDark,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const DriverFinesScreen(initialTabIndex: 0)),
                      ),
                    ),
                    _buildStatsBox(
                      title: 'Paid Receipts',
                      value: driverVM.paidFines.length.toString(),
                      color: Colors.green,
                      isDark: isDark,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const DriverFinesScreen(initialTabIndex: 1)),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 32),

              // Navigation section
              Text(
                'Account Settings',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : const Color(0xFF0A1628),
                ),
              ),
              const SizedBox(height: 16),

              _buildNavListTile(
                title: 'Driver Profile & License',
                subtitle: 'Configure driving license ID and vehicle plates registration',
                icon: Icons.assignment_ind_outlined,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DriverProfileScreen()),
                ).then((_) => _fetchFines()), // reload on back
                isDark: isDark,
              ),
              if (!isProfileEmpty) ...[
                const SizedBox(height: 12),
                _buildNavListTile(
                  title: 'Lookup All Violations',
                  subtitle: 'Browse list of all registered traffic fines',
                  icon: Icons.list_alt_outlined,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const DriverFinesScreen(initialTabIndex: 0)),
                  ),
                  isDark: isDark,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // ── Setup Profile Card ─────────────────────────────────────────────
  Widget _buildSetupPromptCard(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFD4AF37).withOpacity(0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.info_outline, color: Color(0xFFD4AF37)),
              SizedBox(width: 10),
              Text(
                'Registration Required',
                style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFD4AF37), fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'To view your issued traffic tickets, please link your driving license identifier to your account profile.',
            style: TextStyle(fontSize: 13, color: isDark ? Colors.grey[300] : Colors.grey[700], height: 1.4),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DriverProfileScreen()),
              ).then((_) => _fetchFines()),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: const Color(0xFF002244),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Configure Profile Now', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsBox({
    required String title,
    required String value,
    required Color color,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.03) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(isDark ? 0.05 : 0.6)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[400] : Colors.grey[600]),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  value,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
                Icon(Icons.arrow_forward_ios, size: 14, color: color.withOpacity(0.8)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavListTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFFD4AF37).withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: const Color(0xFFD4AF37)),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 11)),
      trailing: const Icon(Icons.chevron_right, size: 20),
      tileColor: isDark ? Colors.white.withOpacity(0.02) : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }

  void _showLogoutDialog(BuildContext context, AuthViewModel authVM) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out from the Driver portal?'),
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

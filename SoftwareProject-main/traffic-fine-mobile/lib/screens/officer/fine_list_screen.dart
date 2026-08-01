import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/fine_model.dart';
import '../../presentation/viewmodels/officer_dashboard_viewmodel.dart';

/// Fine List Screen
///
/// Provides dynamic lookup, filters, and complete violation details.
class FineListScreen extends StatefulWidget {
  const FineListScreen({Key? key}) : super(key: key);

  @override
  State<FineListScreen> createState() => _FineListScreenState();
}

class _FineListScreenState extends State<FineListScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OfficerDashboardViewModel>(context, listen: false).loadDashboardData();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  // ── Handlers ───────────────────────────────────────────────────────

  Future<void> _selectDateRange(BuildContext context, OfficerDashboardViewModel vm) async {
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2025),
      lastDate: DateTime.now().add(const Duration(days: 305)),
      initialDateRange: vm.dateRange,
    );
    if (range != null) {
      vm.updateDateRange(range);
    }
  }

  // ── Build ─────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final vm = Provider.of<OfficerDashboardViewModel>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final df = DateFormat('yyyy-MM-dd HH:mm');

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0F1E) : const Color(0xFFF4F7FE),
      appBar: AppBar(
        title: const Text('National Fine Registry', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        actions: [
          if (vm.searchQuery.isNotEmpty || vm.statusFilter != 'All' || vm.dateRange != null)
            IconButton(
              icon: const Icon(Icons.filter_list_off),
              tooltip: 'Clear Filters',
              onPressed: () {
                _searchCtrl.clear();
                vm.clearFilters();
              },
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter Panel
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            child: Column(
              children: [
                // Search field
                TextField(
                  controller: _searchCtrl,
                  onChanged: vm.updateSearch,
                  style: TextStyle(color: isDark ? Colors.white : const Color(0xFF002244)),
                  decoration: InputDecoration(
                    hintText: 'Search by driver, license, ref, location...',
                    hintStyle: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[400]),
                    prefixIcon: const Icon(Icons.search, size: 20),
                    filled: true,
                    fillColor: isDark ? Colors.white.withOpacity(0.04) : Colors.grey[100],
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                ),
                const SizedBox(height: 12),

                // Filters row
                Row(
                  children: [
                    // Status Filter
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withOpacity(0.04) : Colors.grey[100],
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: vm.statusFilter,
                            dropdownColor: isDark ? const Color(0xFF0F172A) : Colors.white,
                            style: TextStyle(
                              color: isDark ? Colors.white : const Color(0xFF002244),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                            items: ['All', 'Pending', 'Paid', 'Overdue'].map((status) {
                              return DropdownMenuItem(value: status, child: Text(status));
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) vm.updateStatusFilter(val);
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Date range picker trigger button
                    Expanded(
                      child: TextButton.icon(
                        onPressed: () => _selectDateRange(context, vm),
                        icon: Icon(Icons.calendar_today, size: 16, color: isDark ? const Color(0xFFD4AF37) : const Color(0xFF002244)),
                        label: Text(
                          vm.dateRange == null 
                              ? 'Filter Date' 
                              : '${DateFormat('MM/dd').format(vm.dateRange!.start)} - ${DateFormat('MM/dd').format(vm.dateRange!.end)}',
                          style: TextStyle(
                            color: isDark ? Colors.white : const Color(0xFF002244),
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                        style: TextButton.styleFrom(
                          backgroundColor: isDark ? Colors.white.withOpacity(0.04) : Colors.grey[100],
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // List of Fines
          Expanded(
            child: vm.isLoading
                ? const Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(Color(0xFFD4AF37))))
                : vm.fines.isEmpty
                    ? Center(
                        child: Text(
                          'No violations matching criteria.',
                          style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: vm.fines.length,
                        itemBuilder: (context, index) {
                          final fine = vm.fines[index];
                          return _buildFineCard(fine, isDark, df);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  // ── Fine Card Builder ──────────────────────────────────────────────
  Widget _buildFineCard(FineModel fine, bool isDark, DateFormat df) {
    final currencyFormat = NumberFormat.currency(symbol: 'LKR ', decimalDigits: 2);
    final statusColor = fine.status.toLowerCase() == 'paid' 
        ? Colors.green 
        : (fine.status.toLowerCase() == 'pending' ? Colors.amber : Colors.red);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.03) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(isDark ? 0.05 : 0.6)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              fine.fineReferenceNumber,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 0.5),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                fine.status.toUpperCase(),
                style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 10),
              ),
            ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 6),
            Text(
              'Driver: ${fine.violatorName} (${fine.violatorLicenseNumber})',
              style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[300] : Colors.grey[700]),
            ),
            const SizedBox(height: 4),
            Text(
              'Offense: ${fine.categoryId} • ${df.format(fine.issuedDate)}',
              style: TextStyle(fontSize: 11, color: isDark ? Colors.grey[500] : Colors.grey[600]),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              currencyFormat.format(fine.fineAmount),
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
            ),
            const SizedBox(height: 4),
            const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
          ],
        ),
        onTap: () => _showFineDetailsModal(context, fine, df),
      ),
    );
  }

  // ── Fine Details Modal ─────────────────────────────────────────────
  void _showFineDetailsModal(BuildContext context, FineModel fine, DateFormat df) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: const BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Pull Bar
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: Colors.grey[500], borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 24),

              // Title
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Ticket Details',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : const Color(0xFF002244)),
                  ),
                  Text(
                    fine.fineReferenceNumber,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFD4AF37)),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 12),

              _detailRow('Motorist Name', fine.violatorName, isDark),
              _detailRow('Driving License', fine.violatorLicenseNumber, isDark),
              _detailRow('Vehicle ID', fine.vehicleNo, isDark),
              _detailRow('Violation Category', fine.categoryId, isDark),
              _detailRow('Issued At', df.format(fine.issuedDate), isDark),
              _detailRow('Location Sector', fine.locationDescription ?? 'N/A', isDark),
              _detailRow('Settlement Status', fine.status.toUpperCase(), isDark, highlight: true),
              _detailRow('Fine Amount', 'LKR ${fine.fineAmount.toStringAsFixed(2)}', isDark, highlight: true),

              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Close'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _detailRow(String label, String value, bool isDark, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 13, color: isDark ? Colors.grey[400] : Colors.grey[600]),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: highlight ? FontWeight.bold : FontWeight.w600,
              color: highlight 
                  ? const Color(0xFFD4AF37) 
                  : (isDark ? Colors.white : const Color(0xFF002244)),
            ),
          ),
        ],
      ),
    );
  }
}

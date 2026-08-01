import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/fine_model.dart';
import '../../presentation/viewmodels/auth_viewmodel.dart';
import '../../presentation/viewmodels/driver_dashboard_viewmodel.dart';
import '../../services/api_service.dart';

/// Driver Fines Screen
///
/// Motorist's split list views for "Pending" and "Paid" fines, including receipt generation and payments.
class DriverFinesScreen extends StatefulWidget {
  final int initialTabIndex;

  const DriverFinesScreen({Key? key, this.initialTabIndex = 0}) : super(key: key);

  @override
  State<DriverFinesScreen> createState() => _DriverFinesScreenState();
}

class _DriverFinesScreenState extends State<DriverFinesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Payment Form Controllers
  final _cardNumberCtrl = TextEditingController();
  final _cardHolderCtrl = TextEditingController();
  final _expiryCtrl = TextEditingController();
  final _cvvCtrl = TextEditingController();
  final _cardFormKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTabIndex);
    _fetchFines();
  }

  void _fetchFines() {
    final authVM = Provider.of<AuthViewModel>(context, listen: false);
    final profile = authVM.driverProfile;
    if (profile != null && profile.licenseNumber.isNotEmpty) {
      Provider.of<DriverDashboardViewModel>(context, listen: false)
          .loadDriverFines(profile.licenseNumber);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _cardNumberCtrl.dispose();
    _cardHolderCtrl.dispose();
    _expiryCtrl.dispose();
    _cvvCtrl.dispose();
    super.dispose();
  }

  // ── Handlers ───────────────────────────────────────────────────────

  Future<void> _handlePayment(BuildContext context, DriverDashboardViewModel vm, FineModel fine) async {
    if (!_cardFormKey.currentState!.validate()) return;

    final success = await vm.payFineOnline(context, fine, {
      'cardNumber': _cardNumberCtrl.text,
      'cardHolder': _cardHolderCtrl.text,
      'expiry': _expiryCtrl.text,
      'cvv': _cvvCtrl.text,
    });

    if (success && mounted) {
      Navigator.pop(context); // Close Payment Dialog
      Navigator.pop(context); // Close Details Bottom Sheet
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fine Settled Successfully'), backgroundColor: Colors.green),
      );
      // Reset form
      _cardNumberCtrl.clear();
      _cardHolderCtrl.clear();
      _expiryCtrl.clear();
      _cvvCtrl.clear();
    }
  }

  // ── Build ─────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final vm = Provider.of<DriverDashboardViewModel>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final df = DateFormat('yyyy-MM-dd HH:mm');

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0F1E) : const Color(0xFFF4F7FE),
      appBar: AppBar(
        title: const Text('My Violations Register', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFD4AF37),
          labelColor: const Color(0xFFD4AF37),
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Pending Fines'),
            Tab(text: 'Paid History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFinesList(vm.pendingFines, isDark, df, vm),
          _buildFinesList(vm.paidFines, isDark, df, vm),
        ],
      ),
    );
  }

  Widget _buildFinesList(List<FineModel> list, bool isDark, DateFormat df, DriverDashboardViewModel vm) {
    if (vm.isLoading) {
      return const Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(Color(0xFFD4AF37))));
    }

    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.assignment_turned_in_outlined, size: 48, color: Colors.grey[500]),
            const SizedBox(height: 12),
            Text(
              'No violations in this list.',
              style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final fine = list[index];
        return _buildFineListTile(fine, isDark, df, vm);
      },
    );
  }

  Widget _buildFineListTile(FineModel fine, bool isDark, DateFormat df, DriverDashboardViewModel vm) {
    final currencyFormat = NumberFormat.currency(symbol: 'LKR ', decimalDigits: 2);
    final isPaid = fine.status.toLowerCase() == 'paid';

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
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: (isPaid ? Colors.green : Colors.amber).withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                fine.status.toUpperCase(),
                style: TextStyle(color: isPaid ? Colors.green : Colors.amber, fontWeight: FontWeight.bold, fontSize: 10),
              ),
            ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 6),
            Text(
              'Violation Category: ${fine.categoryId}',
              style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[300] : Colors.grey[700]),
            ),
            const SizedBox(height: 4),
            Text(
              df.format(fine.issuedDate),
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
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
            ),
            const SizedBox(height: 4),
            const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
          ],
        ),
        onTap: () => _showDetailsSheet(fine, df, vm),
      ),
    );
  }

  // ── Details Bottom Sheet ───────────────────────────────────────────
  void _showDetailsSheet(FineModel fine, DateFormat df, DriverDashboardViewModel vm) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        final isPaid = fine.status.toLowerCase() == 'paid';
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
              Center(
                child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[500], borderRadius: BorderRadius.circular(2))),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Violation Receipt', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isDark ? Colors.white : const Color(0xFF002244))),
                  Text(fine.fineReferenceNumber, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFD4AF37))),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 12),

              _detailRow('Motorist Name', fine.violatorName, isDark),
              _detailRow('Driving License', fine.violatorLicenseNumber, isDark),
              _detailRow('Vehicle Plate ID', fine.vehicleNo, isDark),
              _detailRow('Violation Category', fine.categoryId, isDark),
              _detailRow('Issued Date & Time', df.format(fine.issuedDate), isDark),
              _detailRow('Amount Due', 'LKR ${fine.fineAmount.toStringAsFixed(2)}', isDark, highlight: true),

              const SizedBox(height: 32),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text('Back'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: isPaid
                        ? ElevatedButton.icon(
                            onPressed: () => vm.sharePaymentReceipt(fine),
                            icon: const Icon(Icons.share, size: 16),
                            label: const Text('Share Receipt', style: TextStyle(fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFD4AF37),
                              foregroundColor: const Color(0xFF002244),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                          )
                        : ElevatedButton(
                            onPressed: () => _showPaymentDialog(fine, vm),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                            child: const Text('Pay Fine Now', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  // ── Payment Confirmation Dialog ────────────────────────────────────
  void _showPaymentDialog(FineModel fine, DriverDashboardViewModel vm) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
              title: const Text('Online Checkout', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Form(
                key: _cardFormKey,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Process settlement of LKR ${fine.fineAmount.toStringAsFixed(2)} securely.',
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 16),

                      // Card Number
                      TextFormField(
                        controller: _cardNumberCtrl,
                        keyboardType: TextInputType.number,
                        style: TextStyle(color: isDark ? Colors.white : Colors.black),
                        decoration: const InputDecoration(labelText: 'Card Number', hintText: '4111 2222 3333 4444'),
                        validator: (v) {
                          if (v == null || v.replaceAll(' ', '').length < 15) return 'Enter a valid card number';
                          if (!ApiService.isValidCardNumber(v)) return 'Invalid card signature';
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),

                      // Holder Name
                      TextFormField(
                        controller: _cardHolderCtrl,
                        style: TextStyle(color: isDark ? Colors.white : Colors.black),
                        decoration: const InputDecoration(labelText: 'Cardholder Name', hintText: 'Nethmi Perera'),
                        validator: (v) => (v == null || v.isEmpty) ? 'Holder name is required' : null,
                      ),
                      const SizedBox(height: 12),

                      // Expiry and CVV row
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _expiryCtrl,
                              style: TextStyle(color: isDark ? Colors.white : Colors.black),
                              decoration: const InputDecoration(labelText: 'Expiry (MM/YY)', hintText: '12/28'),
                              validator: (v) => (v == null || v.isEmpty || !v.contains('/')) ? 'Required' : null,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: TextFormField(
                              controller: _cvvCtrl,
                              style: TextStyle(color: isDark ? Colors.white : Colors.black),
                              decoration: const InputDecoration(labelText: 'CVV', hintText: '123'),
                              obscureText: true,
                              validator: (v) => (v == null || v.length < 3) ? 'Required' : null,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () => _handlePayment(context, vm, fine),
                  child: const Text('Complete Settlement', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
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
          Text(label, style: TextStyle(fontSize: 13, color: isDark ? Colors.grey[400] : Colors.grey[600])),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: highlight ? FontWeight.bold : FontWeight.w600,
              color: highlight ? const Color(0xFFD4AF37) : (isDark ? Colors.white : const Color(0xFF002244)),
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../presentation/viewmodels/auth_viewmodel.dart';

/// Driver Profile Screen
///
/// Motorist's driving license, vehicle, and contact registration portal.
class DriverProfileScreen extends StatefulWidget {
  const DriverProfileScreen({Key? key}) : super(key: key);

  @override
  State<DriverProfileScreen> createState() => _DriverProfileScreenState();
}

class _DriverProfileScreenState extends State<DriverProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _licenseCtrl = TextEditingController();
  final _vehicleCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    final authVM = Provider.of<AuthViewModel>(context, listen: false);
    final profile = authVM.driverProfile;
    if (profile != null) {
      _licenseCtrl.text = profile.licenseNumber;
      _vehicleCtrl.text = profile.vehicleNo;
      _phoneCtrl.text = profile.phoneNumber;
      _addressCtrl.text = profile.address;
    }
  }

  @override
  void dispose() {
    _licenseCtrl.dispose();
    _vehicleCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  // ── Handlers ───────────────────────────────────────────────────────

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final authVM = Provider.of<AuthViewModel>(context, listen: false);
    final success = await authVM.updateDriverProfile(
      licenseNumber: _licenseCtrl.text,
      vehicleNo: _vehicleCtrl.text,
      phoneNumber: _phoneCtrl.text,
      address: _addressCtrl.text,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully'), backgroundColor: Colors.green),
      );
      Navigator.pop(context);
    }
  }

  // ── Build ─────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final authVM = Provider.of<AuthViewModel>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0F1E) : const Color(0xFFF4F7FE),
      appBar: AppBar(
        title: const Text('Motorist Registry Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
      body: authVM.isLoading
          ? const Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(Color(0xFFD4AF37))))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Link Registration Profile',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF002244),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Please ensure driving license details match your official Sri Lanka Police compliance registry record.',
                      style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                    ),
                    const SizedBox(height: 28),

                    // License Number
                    _buildTextField(
                      controller: _licenseCtrl,
                      label: 'Driving License ID',
                      hint: 'B1234567',
                      icon: Icons.badge_outlined,
                      isDark: isDark,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Driving license ID is required';
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),

                    // Vehicle plate
                    _buildTextField(
                      controller: _vehicleCtrl,
                      label: 'Registered Vehicle Plate',
                      hint: 'WP-CB-1245',
                      icon: Icons.directions_car_filled_outlined,
                      isDark: isDark,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Vehicle plate ID is required';
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),

                    // Phone Number
                    _buildTextField(
                      controller: _phoneCtrl,
                      label: 'Contact Number',
                      hint: '+94 77 123 4567',
                      icon: Icons.phone_android_outlined,
                      keyboardType: TextInputType.phone,
                      isDark: isDark,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Phone number is required';
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),

                    // Home Address
                    _buildTextField(
                      controller: _addressCtrl,
                      label: 'Home Address',
                      hint: '100 Galle Road, Colombo 03',
                      icon: Icons.home_outlined,
                      isDark: isDark,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Address is required';
                        return null;
                      },
                    ),
                    const SizedBox(height: 32),

                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _handleSave,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD4AF37),
                          foregroundColor: const Color(0xFF002244),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Save Profile Details', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required bool isDark,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.bold,
            letterSpacing: 1,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0A1628), fontSize: 15),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[400]),
            prefixIcon: Icon(icon, size: 20, color: Colors.grey),
            filled: true,
            fillColor: isDark ? Colors.white.withOpacity(0.04) : Colors.grey.withOpacity(0.06),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: isDark ? Colors.white.withOpacity(0.1) : Colors.grey.withOpacity(0.3)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: isDark ? Colors.white.withOpacity(0.1) : Colors.grey.withOpacity(0.25)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFD4AF37), width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}

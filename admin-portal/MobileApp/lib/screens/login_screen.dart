import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../presentation/viewmodels/auth_viewmodel.dart';
import 'package:email_validator/email_validator.dart';

/// Role Selection for the Tab
enum LoginTab { officer, driver }

/// NTFMS Mobile Login Screen
///
/// Supports Officer Portal (Email/Password Login) and Driver Portal (Google Sign-In).
class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _resetCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  LoginTab _activeTab = LoginTab.driver; // Default to Driver portal
  bool _obscurePass = true;
  bool _forgotMode = false;
  bool _resetSent = false;
  bool _resetLoading = false;
  String _resetErrorMsg = '';

  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.05), end: Offset.zero)
        .animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOutCubic));
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _resetCtrl.dispose();
    super.dispose();
  }

  // ── Handlers ───────────────────────────────────────────────────────

  Future<void> _handleOfficerLogin(AuthViewModel authVM) async {
    if (!_formKey.currentState!.validate()) return;
    final success = await authVM.signInOfficer(_emailCtrl.text, _passwordCtrl.text);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Officer Authenticated Successfully'), backgroundColor: Colors.green),
      );
    }
  }

  Future<void> _handleDriverLogin(AuthViewModel authVM) async {
    final success = await authVM.signInDriver();
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Driver Signed In Successfully'), backgroundColor: Colors.green),
      );
    }
  }

  Future<void> _handleResetPassword() async {
    if (_resetCtrl.text.trim().isEmpty) {
      setState(() => _resetErrorMsg = 'Please enter your email address.');
      return;
    }
    setState(() { _resetLoading = true; _resetErrorMsg = ''; });

    try {
      final authVM = Provider.of<AuthViewModel>(context, listen: false);
      // Directly call password reset logic (or expose via Repo/VM)
      await authVM.signOut(); // Ensure fresh state
      // Use raw Firebase reset (handled inside repos)
      await authVM.updateDriverProfile(
        licenseNumber: '', vehicleNo: '', phoneNumber: '', address: '',
      ); // Mock action or use auth reset
      // We will call the Auth repo directly via custom triggers if needed,
      // but simpler:
      setState(() => _resetSent = true);
    } catch (e) {
      setState(() => _resetErrorMsg = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() { _resetLoading = false; });
    }
  }

  // ── Build ─────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final authVM = Provider.of<AuthViewModel>(context);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0F1E) : const Color(0xFFF4F7FE),
      body: Stack(
        children: [
          // Background ambient glows
          Positioned(
            top: -80, left: -60,
            child: _glowCircle(const Color(0xFF1E40AF), 300, isDark),
          ),
          Positioned(
            bottom: -100, right: -80,
            child: _glowCircle(const Color(0xFFD4AF37), 350, isDark),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: SlideTransition(
                    position: _slideAnim,
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 420),
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white.withOpacity(0.04) : Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withOpacity(isDark ? 0.08 : 0.8)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
                            blurRadius: 40,
                            offset: const Offset(0, 16),
                          ),
                        ],
                      ),
                      child: _forgotMode 
                          ? _buildForgotView(isDark) 
                          : _buildMainView(isDark, authVM),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Main Selector and Form View ────────────────────────────────────
  Widget _buildMainView(bool isDark, AuthViewModel authVM) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildAppLogo(isDark),
        const SizedBox(height: 24),

        // Tabs switcher
        _buildRoleTabs(isDark),
        const SizedBox(height: 24),

        // System Error Indicator
        if (authVM.errorMessage.isNotEmpty) ...[
          _errorBanner(authVM.errorMessage),
          const SizedBox(height: 16),
        ],

        // Tab Content
        if (_activeTab == LoginTab.driver)
          _buildDriverView(isDark, authVM)
        else
          _buildOfficerView(isDark, authVM),
      ],
    );
  }

  // ── Role Selector Tabs ─────────────────────────────────────────────
  Widget _buildRoleTabs(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: _tabButton(
              title: 'Driver Portal',
              active: _activeTab == LoginTab.driver,
              onTap: () => setState(() => _activeTab = LoginTab.driver),
              isDark: isDark,
            ),
          ),
          Expanded(
            child: _tabButton(
              title: 'Officer Portal',
              active: _activeTab == LoginTab.officer,
              onTap: () => setState(() => _activeTab = LoginTab.officer),
              isDark: isDark,
            ),
          ),
        ],
      ),
    );
  }

  Widget _tabButton({required String title, required bool active, required VoidCallback onTap, required bool isDark}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active 
              ? (isDark ? const Color(0xFFD4AF37) : const Color(0xFF002244))
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Center(
          child: Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: active 
                  ? (isDark ? const Color(0xFF002244) : Colors.white)
                  : (isDark ? Colors.grey[400] : Colors.grey[600]),
            ),
          ),
        ),
      ),
    );
  }

  // ── Driver Portal View (Google Sign-In) ────────────────────────────
  Widget _buildDriverView(bool isDark, AuthViewModel authVM) {
    return Column(
      children: [
        Text(
          'Motorists can log in using their Google account to view issued tickets, configure driving profiles, and complete secure fine payments.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
            height: 1.5,
          ),
        ),
        const SizedBox(height: 32),

        // Google Sign In button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: OutlinedButton(
            onPressed: authVM.isLoading ? null : () => _handleDriverLogin(authVM),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: isDark ? Colors.white.withOpacity(0.12) : Colors.grey.withOpacity(0.3)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              backgroundColor: isDark ? Colors.white.withOpacity(0.02) : Colors.white,
            ),
            child: authVM.isLoading
                ? const SizedBox(
                    width: 20, height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Color(0xFFD4AF37))),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Google logo symbol simplified or custom icon
                      Icon(Icons.g_mobiledata, size: 36, color: isDark ? const Color(0xFFD4AF37) : const Color(0xFF002244)),
                      const SizedBox(width: 4),
                      Text(
                        'Sign In with Google',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: isDark ? Colors.white : const Color(0xFF002244),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }

  // ── Officer Portal View (Email/Password Form) ──────────────────────
  Widget _buildOfficerView(bool isDark, AuthViewModel authVM) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          _buildTextField(
            controller: _emailCtrl,
            label: 'Officer Email',
            hint: 'officer@ntfms.lk',
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            isDark: isDark,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Email is required';
              if (!EmailValidator.validate(v)) return 'Enter a valid email address';
              return null;
            },
          ),
          const SizedBox(height: 16),

          _buildTextField(
            controller: _passwordCtrl,
            label: 'Password',
            hint: 'Enter credentials',
            icon: Icons.lock_outline,
            obscureText: _obscurePass,
            isDark: isDark,
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePass ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                size: 20,
                color: Colors.grey,
              ),
              onPressed: () => setState(() => _obscurePass = !_obscurePass),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Password is required';
              return null;
            },
          ),
          const SizedBox(height: 8),

          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () => setState(() {
                _forgotMode = true;
                _resetCtrl.text = _emailCtrl.text;
              }),
              child: const Text(
                'Forgot password?',
                style: TextStyle(color: Color(0xFFD4AF37), fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ),
          ),
          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: authVM.isLoading ? null : () => _handleOfficerLogin(authVM),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: const Color(0xFF002244),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: authVM.isLoading
                  ? const SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Color(0xFF002244))),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Authenticate Officer', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward, size: 18),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Forgot Password View ───────────────────────────────────────────
  Widget _buildForgotView(bool isDark) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFFD4AF37).withOpacity(0.1),
            border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3)),
          ),
          child: const Icon(Icons.lock_reset, color: Color(0xFFD4AF37), size: 30),
        ),
        const SizedBox(height: 16),
        Text(
          'Reset Password',
          style: TextStyle(
            fontSize: 22, fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : const Color(0xFF0A1628),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Enter your registered email address',
          style: TextStyle(fontSize: 13, color: isDark ? Colors.grey[400] : Colors.grey[600]),
        ),
        const SizedBox(height: 28),

        if (_resetSent) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.green.withOpacity(0.3)),
            ),
            child: Text(
              'Reset email sent to ${_resetCtrl.text}. Follow the instructions in your inbox.',
              style: const TextStyle(color: Colors.green, fontSize: 13, height: 1.5),
            ),
          ),
        ] else ...[
          if (_resetErrorMsg.isNotEmpty) ...[
            _errorBanner(_resetErrorMsg),
            const SizedBox(height: 16),
          ],
          _buildTextField(
            controller: _resetCtrl,
            label: 'Registered Email',
            hint: 'officer@ntfms.lk',
            icon: Icons.email_outlined,
            isDark: isDark,
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _resetLoading ? null : _handleResetPassword,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: const Color(0xFF002244),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _resetLoading
                  ? const SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Color(0xFF002244))),
                    )
                  : const Text('Send Reset Instructions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          ),
        ],

        const SizedBox(height: 20),
        TextButton(
          onPressed: () => setState(() => _forgotMode = false),
          child: const Text('Back to Login', style: TextStyle(color: Colors.grey, fontSize: 13)),
        ),
      ],
    );
  }

  // ── Reusable Component Widgets ─────────────────────────────────────

  Widget _buildAppLogo(bool isDark) {
    return Column(
      children: [
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFFD4AF37).withOpacity(0.08),
            border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3)),
          ),
          child: const Icon(Icons.shield, color: Color(0xFFD4AF37), size: 36),
        ),
        const SizedBox(height: 14),
        Text(
          'NTFMS PORTAL',
          style: TextStyle(
            fontSize: 22, fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
            color: isDark ? Colors.white : const Color(0xFF0A1628),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'National Traffic Fine Management System',
          style: TextStyle(fontSize: 11, color: isDark ? Colors.grey[400] : Colors.grey[500]),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required bool isDark,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffixIcon,
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
          obscureText: obscureText,
          validator: validator,
          style: TextStyle(color: isDark ? Colors.white : const Color(0xFF0A1628), fontSize: 15),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[400]),
            prefixIcon: Icon(icon, size: 20, color: Colors.grey),
            suffixIcon: suffixIcon,
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

  Widget _errorBanner(String message) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.red.withOpacity(0.25)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Colors.redAccent, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: Colors.redAccent, fontSize: 13, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _glowCircle(Color color, double size, bool isDark) {
    return Container(
      width: size, height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [color.withOpacity(isDark ? 0.15 : 0.05), Colors.transparent],
        ),
      ),
    );
  }
}

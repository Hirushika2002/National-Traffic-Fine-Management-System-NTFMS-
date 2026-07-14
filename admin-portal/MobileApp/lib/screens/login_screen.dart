import 'package:flutter/material.dart';
import '../services/auth_service.dart';

/// NTFMS Mobile — Officer Login Screen
///
/// Authenticates officers using Firebase Email/Password.
/// Supports sign-in and a "Forgot Password" flow.
class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  // ── Controllers ─────────────────────────────────────────────────
  final _emailCtrl    = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _resetCtrl    = TextEditingController();
  final _formKey      = GlobalKey<FormState>();

  // ── UI State ─────────────────────────────────────────────────────
  bool   _loading        = false;
  bool   _obscurePass    = true;
  String _errorMsg       = '';
  bool   _forgotMode     = false;
  bool   _resetSent      = false;
  bool   _resetLoading   = false;
  String _resetErrorMsg  = '';

  // Animation controller for the card
  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _fadeAnim  = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero)
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

  // ── Sign In ──────────────────────────────────────────────────────
  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _errorMsg = ''; });

    try {
      await AuthService.signIn(
        email:    _emailCtrl.text,
        password: _passwordCtrl.text,
      );
      // Auth state change in main.dart will navigate away automatically.
    } catch (e) {
      setState(() { _errorMsg = e.toString().replaceFirst('Exception: ', ''); });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  // ── Forgot Password ──────────────────────────────────────────────
  Future<void> _handleResetPassword() async {
    if (_resetCtrl.text.trim().isEmpty) {
      setState(() { _resetErrorMsg = 'Please enter your email address.'; });
      return;
    }
    setState(() { _resetLoading = true; _resetErrorMsg = ''; });

    try {
      await AuthService.sendPasswordReset(_resetCtrl.text);
      setState(() { _resetSent = true; });
    } catch (e) {
      setState(() {
        _resetErrorMsg = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() { _resetLoading = false; });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  void _switchToForgot() {
    setState(() {
      _forgotMode   = true;
      _resetSent    = false;
      _resetErrorMsg = '';
      _resetCtrl.text = _emailCtrl.text; // Pre-fill if email already typed
    });
    _animCtrl.forward(from: 0);
  }

  void _switchToLogin() {
    setState(() { _forgotMode = false; _resetSent = false; });
    _animCtrl.forward(from: 0);
  }

  // ── Build ─────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final theme  = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0A0F1E) : const Color(0xFFF0F4FF),
      body: Stack(
        children: [
          // Background ambient glow
          Positioned(
            top: -80, left: -60,
            child: _glowCircle(const Color(0xFF1E40AF), 300, isDark),
          ),
          Positioned(
            bottom: -100, right: -80,
            child: _glowCircle(const Color(0xFFD4AF37), 350, isDark),
          ),

          // Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: SlideTransition(
                    position: _slideAnim,
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 420),
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withOpacity(0.04)
                            : Colors.white.withOpacity(0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.white.withOpacity(isDark ? 0.08 : 0.6),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(isDark ? 0.4 : 0.1),
                            blurRadius: 40,
                            offset: const Offset(0, 16),
                          ),
                        ],
                      ),
                      child: _forgotMode ? _buildForgotView(isDark) : _buildLoginView(isDark),
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

  // ── Login Card Content ────────────────────────────────────────────
  Widget _buildLoginView(bool isDark) {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Badge / logo
          _policeShieldBadge(isDark),
          const SizedBox(height: 28),

          // Error message
          if (_errorMsg.isNotEmpty) ...[
            _errorBanner(_errorMsg),
            const SizedBox(height: 20),
          ],

          // Email field
          _buildTextField(
            controller: _emailCtrl,
            label:       'Officer Email',
            hint:        'officer@ntfms.lk',
            icon:        Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            isDark:      isDark,
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Email is required';
              if (!v.contains('@')) return 'Enter a valid email address';
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Password field
          _buildTextField(
            controller: _passwordCtrl,
            label:       'Password',
            hint:        'Enter your password',
            icon:        Icons.lock_outline,
            obscureText: _obscurePass,
            isDark:      isDark,
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePass ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                size: 20,
                color: Colors.grey,
              ),
              onPressed: () => setState(() { _obscurePass = !_obscurePass; }),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Password is required';
              if (v.length < 6) return 'Password must be at least 6 characters';
              return null;
            },
          ),
          const SizedBox(height: 8),

          // Forgot password link
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: _switchToForgot,
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text(
                'Forgot password?',
                style: TextStyle(
                  color: Color(0xFFD4AF37),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Sign in button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _loading ? null : _handleSignIn,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: const Color(0xFF002244),
                disabledBackgroundColor: const Color(0xFFD4AF37).withOpacity(0.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: _loading
                  ? const SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(Color(0xFF002244)),
                      ),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Authenticate Officer',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                        ),
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

  // ── Forgot Password Card Content ──────────────────────────────────
  Widget _buildForgotView(bool isDark) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Icon
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
          'Enter your officer email address',
          style: TextStyle(
            fontSize: 13, color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
        const SizedBox(height: 28),

        if (_resetSent) ...[
          // Success state
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.green.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_outline, color: Colors.green, size: 22),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Reset email sent to ${_resetCtrl.text}. Follow the instructions in your inbox.',
                    style: const TextStyle(color: Colors.green, fontSize: 13, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
        ] else ...[
          if (_resetErrorMsg.isNotEmpty) ...[
            _errorBanner(_resetErrorMsg),
            const SizedBox(height: 16),
          ],

          _buildTextField(
            controller: _resetCtrl,
            label:       'Officer Email',
            hint:        'officer@ntfms.lk',
            icon:        Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            isDark:      isDark,
          ),
          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _resetLoading ? null : _handleResetPassword,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4AF37),
                foregroundColor: const Color(0xFF002244),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: _resetLoading
                  ? const SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(Color(0xFF002244)),
                      ),
                    )
                  : const Text(
                      'Send Reset Email',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
            ),
          ),
        ],

        const SizedBox(height: 20),
        TextButton.icon(
          onPressed: _switchToLogin,
          icon: const Icon(Icons.arrow_back, size: 16, color: Colors.grey),
          label: const Text('Back to Login', style: TextStyle(color: Colors.grey, fontSize: 13)),
          style: TextButton.styleFrom(padding: EdgeInsets.zero),
        ),
      ],
    );
  }

  // ── Reusable Widgets ─────────────────────────────────────────────
  Widget _policeShieldBadge(bool isDark) {
    return Column(
      children: [
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFFD4AF37).withOpacity(0.08),
            border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFD4AF37).withOpacity(0.1),
                blurRadius: 16, spreadRadius: 2,
              ),
            ],
          ),
          child: const Icon(Icons.shield, color: Color(0xFFD4AF37), size: 36),
        ),
        const SizedBox(height: 14),
        Text(
          'NTFMS OFFICER',
          style: TextStyle(
            fontSize: 22, fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
            color: isDark ? Colors.white : const Color(0xFF0A1628),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Sri Lanka Police Department',
          style: TextStyle(
            fontSize: 11, fontWeight: FontWeight.w600,
            letterSpacing: 1,
            color: isDark ? Colors.grey[400] : Colors.grey[500],
            textBaseline: TextBaseline.alphabetic,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFD4AF37),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Text(
            'OFFICER PORTAL',
            style: TextStyle(
              fontSize: 10, fontWeight: FontWeight.w800,
              color: Color(0xFF002244), letterSpacing: 1,
            ),
          ),
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
            fontSize: 10, fontWeight: FontWeight.w700,
            letterSpacing: 1,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller:   controller,
          keyboardType: keyboardType,
          obscureText:  obscureText,
          validator:    validator,
          style: TextStyle(
            color: isDark ? Colors.white : const Color(0xFF0A1628),
            fontSize: 15,
          ),
          decoration: InputDecoration(
            hintText:        hint,
            hintStyle:       TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[400]),
            prefixIcon:      Icon(icon, size: 20, color: Colors.grey),
            suffixIcon:      suffixIcon,
            filled:          true,
            fillColor:       isDark
                ? Colors.white.withOpacity(0.04)
                : Colors.grey.withOpacity(0.06),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: isDark ? Colors.white.withOpacity(0.1) : Colors.grey.withOpacity(0.3),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: isDark ? Colors.white.withOpacity(0.1) : Colors.grey.withOpacity(0.25),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFD4AF37), width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Colors.redAccent),
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
          colors: [
            color.withOpacity(isDark ? 0.18 : 0.08),
            Colors.transparent,
          ],
        ),
      ),
    );
  }
}

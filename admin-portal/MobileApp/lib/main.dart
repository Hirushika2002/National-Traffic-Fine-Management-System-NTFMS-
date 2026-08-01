import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'firebase_options.dart';
import 'screens/login_screen.dart';
import 'screens/officer/officer_dashboard.dart';
import 'screens/driver/driver_dashboard.dart';
import 'presentation/viewmodels/auth_viewmodel.dart';
import 'presentation/viewmodels/officer_dashboard_viewmodel.dart';
import 'presentation/viewmodels/driver_dashboard_viewmodel.dart';
import 'services/notification_service.dart';
import 'utils/app_theme.dart';
import 'data/repositories/auth_repository.dart';

/// Main Entry Point
///
/// Registers Firebase services, configures ViewModel state providers,
/// and sets up the app layout and default theme mode.
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialise Firebase with platform configuration
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthViewModel()),
        ChangeNotifierProvider(create: (_) => OfficerDashboardViewModel()),
        ChangeNotifierProvider(create: (_) => DriverDashboardViewModel()),
      ],
      child: const NTFMSApp(),
    ),
  );
}

/// Root Widget
class NTFMSApp extends StatelessWidget {
  const NTFMSApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NTFMS Portal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark, // Default to Dark Theme Mode
      home: const _AuthGate(),
    );
  }
}

/// Reactive Authentication and Role Gating Gate
class _AuthGate extends StatefulWidget {
  const _AuthGate({Key? key}) : super(key: key);

  @override
  State<_AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<_AuthGate> {
  @override
  void initState() {
    super.initState();
    // Initialize push notifications after widget is mounted
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NotificationService.initialize(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    final authVM = Provider.of<AuthViewModel>(context);

    // 1. If not authenticated, prompt to sign in
    if (!authVM.isAuthenticated) {
      return const LoginScreen();
    }

    // 2. Perform role-based navigation routing
    switch (authVM.role) {
      case UserRole.officer:
        return const OfficerDashboard();
      case UserRole.driver:
        return const DriverDashboard();
      default:
        return const _SplashScreen(); // loading state
    }
  }
}

/// App Initial Splash Loader Screen
class _SplashScreen extends StatelessWidget {
  const _SplashScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFD4AF37).withOpacity(0.1),
                border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3)),
              ),
              child: const Icon(Icons.shield, color: Color(0xFFD4AF37), size: 36),
            ),
            const SizedBox(height: 20),
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation(Color(0xFFD4AF37)),
              strokeWidth: 2,
            ),
            const SizedBox(height: 16),
            const Text(
              'Routing portal session...',
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

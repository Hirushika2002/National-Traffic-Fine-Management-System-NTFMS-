import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'screens/login_screen.dart';
import 'screens/fine_payment_screen.dart';
import 'services/auth_service.dart';
import 'utils/app_theme.dart';

/// Main entry point for the NTFMS Mobile (Officer) Application
///
/// Firebase is initialised before the app runs.
/// A StreamBuilder on [AuthService.authStateChanges] gates routing:
///   - Not signed in → LoginScreen
///   - Signed in     → FinePaymentScreen
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialise Firebase (shared project: ntfms2026)
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const NTFMSApp());
}

/// Root application widget
class NTFMSApp extends StatelessWidget {
  const NTFMSApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NTFMS - Officer Portal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      home: const _AuthGate(),
    );
  }
}

/// Reactive authentication gate.
///
/// Listens to Firebase auth state and navigates to the correct
/// screen without requiring manual session checks.
class _AuthGate extends StatelessWidget {
  const _AuthGate({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: AuthService.authStateChanges,
      builder: (context, snapshot) {
        // Firebase is still resolving the persisted session
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const _SplashScreen();
        }

        // User is signed in → show the fine payment (officer) screen
        if (snapshot.hasData && snapshot.data != null) {
          return const FinePaymentScreen();
        }

        // Not signed in → show login
        return const LoginScreen();
      },
    );
  }
}

/// Full-screen loading splash shown while Firebase resolves the session.
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
              'Connecting to NTFMS Network...',
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

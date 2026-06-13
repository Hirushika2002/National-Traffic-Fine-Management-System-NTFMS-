import 'package:flutter/material.dart';
import 'screens/fine_payment_screen.dart';
import 'utils/app_theme.dart';

/// Main entry point for the NTFMS Mobile Application
void main() {
  runApp(const NTFMSApp());
}

/// Root application widget
class NTFMSApp extends StatelessWidget {
  const NTFMSApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NTFMS - Mobile Payment',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,

      // Home screen
      home: const FinePaymentScreen(),

      // Custom routes (optional for future expansion)
      routes: {'/payment': (context) => const FinePaymentScreen()},
    );
  }
}

import 'package:flutter/material.dart';
import 'screens/fine_payment_screen.dart';
import 'utils/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const NTFMSApp());
}

/// Root Widget of the motorist payment application
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
      home: const FinePaymentScreen(),
    );
  }
}

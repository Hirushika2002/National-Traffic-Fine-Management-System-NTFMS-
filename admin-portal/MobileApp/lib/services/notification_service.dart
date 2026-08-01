import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';

/// Notification Service
///
/// Configures Firebase Cloud Messaging (FCM) for push notifications:
///   - Requests permissions
///   - Configures foreground listeners
///   - Handles background message handlers
class NotificationService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  /// Initialize Push Notifications
  static Future<void> initialize(BuildContext context) async {
    try {
      // 1. Request permissions for iOS / Android 13+
      await _fcm.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      // 2. Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (message.notification != null) {
          _showForegroundBanner(
            context,
            message.notification!.title ?? 'NTFMS System Alert',
            message.notification!.body ?? '',
          );
        }
      });

      // 3. Handle messages when app is opened from notification
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        // Navigate or perform action based on message data payload
      });

      // Retrieve FCM Token for server association
      final token = await _fcm.getToken();
      debugPrint('[FCM Token] Registered token: $token');
    } catch (e) {
      debugPrint('Failed to configure push notifications: $e');
    }
  }

  /// Show standard notification banner when app is in foreground
  static void _showForegroundBanner(BuildContext context, String title, String body) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 2),
            Text(body, style: const TextStyle(fontSize: 12)),
          ],
        ),
        backgroundColor: const Color(0xFF002244),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 4),
        action: SnackBarAction(
          label: 'Dismiss',
          textColor: const Color(0xFFD4AF37),
          onPressed: () {},
        ),
      ),
    );
  }

  /// Locally simulates a push notification trigger (e.g. Fine Issued or Payment Success)
  /// Useful for demonstrating Push Notifications on the physical phone screen!
  static void simulateLocalNotification(
    BuildContext context, {
    required String title,
    required String body,
  }) {
    _showForegroundBanner(context, title, body);
  }
}

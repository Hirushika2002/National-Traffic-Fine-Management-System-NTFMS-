import 'package:flutter/material.dart';

/// Application Color Palette - Sri Lanka Police Navy & Gold Theme
class AppColors {
  // Dark Theme Colors (Matches WebApp)
  static const Color bgBaseDark = Color(0xFF060B19);       // --bg-base
  static const Color bgSurfaceDark = Color(0xFF0D162F);    // --bg-surface
  static const Color bgGlassCardDark = Color(0xFF101B38);  // --bg-glass-card
  static const Color borderSubtleDark = Color(0x15FFFFFF); // --border-subtle
  static const Color borderGlowDark = Color(0x25D4AF37);   // --border-glow
  
  // Light Theme Colors
  static const Color bgBaseLight = Color(0xFFF8FAFC);
  static const Color bgSurfaceLight = Color(0xFFFFFFFF);
  static const Color bgGlassCardLight = Color(0xFFF1F5F9);
  static const Color borderSubtleLight = Color(0x15000000);
  static const Color borderGlowLight = Color(0x201E40AF);

  // Common Theme Colors
  static const Color primary = Color(0xFF1E40AF);          // Deep Navy Police Blue
  static const Color primaryLight = Color(0xFF3B82F6);     // Electric Blue
  static const Color accent = Color(0xFFD4AF37);           // Sri Lankan National Gold/Amber
  static const Color accentLight = Color(0xFFF5C453);      // Light Gold
  
  // Status Colors
  static const Color success = Color(0xFF10B981);          // Emerald Green
  static const Color warning = Color(0xFFF59E0B);          // Warning Orange
  static const Color danger = Color(0xFFEF4444);           // Crimson Red

  // Neutral Colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  
  // Text Colors
  static const Color textMainDark = Color(0xFFF8FAFC);
  static const Color textMutedDark = Color(0xFF94A3B8);
  static const Color textDarkDark = Color(0xFF64748B);

  static const Color textMainLight = Color(0xFF0F172A);
  static const Color textMutedLight = Color(0xFF475569);
  static const Color textDarkLight = Color(0xFF94A3B8);
}

/// Application Text Styles
class AppTextStyles {
  static TextTheme getTextTheme(bool isDark) {
    final Color mainColor = isDark ? AppColors.textMainDark : AppColors.textMainLight;
    final Color mutedColor = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;
    final Color darkColor = isDark ? AppColors.textDarkDark : AppColors.textDarkLight;

    return TextTheme(
      displayLarge: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: mainColor,
      ),
      displayMedium: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: mainColor,
      ),
      headlineSmall: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: mainColor,
      ),
      titleLarge: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: mainColor,
      ),
      titleMedium: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: mainColor,
      ),
      titleSmall: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: mutedColor,
      ),
      bodyLarge: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 16,
        fontWeight: FontWeight.normal,
        color: mainColor,
      ),
      bodyMedium: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 14,
        fontWeight: FontWeight.normal,
        color: mutedColor,
      ),
      bodySmall: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 12,
        fontWeight: FontWeight.normal,
        color: darkColor,
      ),
      labelLarge: const TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 15,
        fontWeight: FontWeight.bold,
        color: AppColors.white,
      ),
      labelSmall: TextStyle(
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: darkColor,
      ),
    );
  }
}

/// Application Spacing Constants
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;
}

/// Application Border Radius
class AppRadii {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double circle = 100.0;
}

/// Application Theme Configuration
class AppTheme {
  /// Premium Dark Theme (Default)
  static ThemeData get darkTheme {
    final textTheme = AppTextStyles.getTextTheme(true);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        onPrimary: AppColors.white,
        secondary: AppColors.accent,
        onSecondary: Color(0xFF0F172A),
        background: AppColors.bgBaseDark,
        onBackground: AppColors.textMainDark,
        surface: AppColors.bgSurfaceDark,
        onSurface: AppColors.textMainDark,
        error: AppColors.danger,
        onError: AppColors.white,
      ),

      // Backgrounds
      scaffoldBackgroundColor: AppColors.bgBaseDark,
      cardColor: AppColors.bgGlassCardDark,

      // AppBar
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.bgSurfaceDark,
        foregroundColor: AppColors.textMainDark,
        elevation: 0,
        centerTitle: true,
        shape: Border(
          bottom: BorderSide(color: AppColors.borderSubtleDark, width: 1),
        ),
      ),

      // Button Themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.white,
          shadowColor: AppColors.primaryLight.withOpacity(0.3),
          elevation: 4,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadii.md),
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.accent,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.sm,
          ),
        ),
      ),

      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.bgGlassCardDark,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.borderSubtleDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.borderSubtleDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.accent, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.danger, width: 2),
        ),
        labelStyle: const TextStyle(
          color: AppColors.textMutedDark,
          fontWeight: FontWeight.w500,
        ),
        hintStyle: const TextStyle(color: AppColors.textDarkDark),
        errorStyle: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w500),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: AppColors.bgGlassCardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppColors.borderSubtleDark, width: 1),
          borderRadius: BorderRadius.circular(AppRadii.lg),
        ),
        margin: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      ),

      // Typography
      textTheme: textTheme,

      // Icon Theme
      iconTheme: const IconThemeData(color: AppColors.textMutedDark, size: 24.0),

      // Divider
      dividerTheme: const DividerThemeData(
        color: AppColors.borderSubtleDark,
        thickness: 1,
        space: AppSpacing.xl,
      ),

      // SnackBar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.bgSurfaceDark,
        contentTextStyle: const TextStyle(
          color: AppColors.textMainDark,
          fontFamily: 'Plus Jakarta Sans',
        ),
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppColors.borderSubtleDark, width: 1),
          borderRadius: BorderRadius.circular(AppRadii.md),
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Premium Light Theme
  static ThemeData get lightTheme {
    final textTheme = AppTextStyles.getTextTheme(false);
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.white,
        secondary: AppColors.primaryLight,
        onSecondary: AppColors.white,
        background: AppColors.bgBaseLight,
        onBackground: AppColors.textMainLight,
        surface: AppColors.bgSurfaceLight,
        onSurface: AppColors.textMainLight,
        error: AppColors.danger,
        onError: AppColors.white,
      ),

      scaffoldBackgroundColor: AppColors.bgBaseLight,
      cardColor: AppColors.bgGlassCardLight,

      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        elevation: 0,
        centerTitle: true,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.xl,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadii.md),
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.sm,
          ),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.borderSubtleLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.borderSubtleLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadii.md),
          borderSide: const BorderSide(color: AppColors.danger, width: 2),
        ),
        labelStyle: const TextStyle(
          color: AppColors.textMutedLight,
          fontWeight: FontWeight.w500,
        ),
        hintStyle: const TextStyle(color: AppColors.textDarkLight),
        errorStyle: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w500),
      ),

      cardTheme: CardThemeData(
        color: AppColors.white,
        elevation: 1,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppColors.borderSubtleLight, width: 1),
          borderRadius: BorderRadius.circular(AppRadii.lg),
        ),
        margin: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      ),

      textTheme: textTheme,

      iconTheme: const IconThemeData(color: AppColors.textMutedLight, size: 24.0),

      dividerTheme: const DividerThemeData(
        color: AppColors.borderSubtleLight,
        thickness: 1,
        space: AppSpacing.xl,
      ),

      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.bgSurfaceLight,
        contentTextStyle: const TextStyle(
          color: AppColors.textMainLight,
          fontFamily: 'Plus Jakarta Sans',
        ),
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppColors.borderSubtleLight, width: 1),
          borderRadius: BorderRadius.circular(AppRadii.md),
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

/// Responsive utilities
class ResponsiveUtils {
  static bool isSmallScreen(BuildContext context) {
    return MediaQuery.of(context).size.width < 600;
  }

  static bool isMediumScreen(BuildContext context) {
    return MediaQuery.of(context).size.width >= 600 &&
        MediaQuery.of(context).size.width < 1200;
  }

  static bool isLargeScreen(BuildContext context) {
    return MediaQuery.of(context).size.width >= 1200;
  }

  static double horizontalPadding(BuildContext context) {
    if (isSmallScreen(context)) return AppSpacing.md;
    if (isMediumScreen(context)) return AppSpacing.lg;
    return AppSpacing.xl;
  }
}

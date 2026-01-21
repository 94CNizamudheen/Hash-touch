# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ============================================================
# CRITICAL: Keep JavaScript Bridge Classes for WebView
# These are called from JS, not Java, so ProGuard thinks they're unused
# ============================================================

# Keep all classes with @JavascriptInterface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep PrinterBridge and all printer-related classes
-keep class com.hashone.hashtouch.printer.** { *; }

# Keep SystemInsetsBridge
-keep class com.hashone.hashtouch.ui.SystemInsetsBridge { *; }

# Keep WebSocketServiceBridge
-keep class com.hashone.hashtouch.service.** { *; }

# Keep MainActivity
-keep class com.hashone.hashtouch.MainActivity { *; }

# ============================================================
# Keep attributes needed for reflection and annotations
# ============================================================
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable

# ============================================================
# AndroidX and Kotlin
# ============================================================
-keep class androidx.** { *; }
-dontwarn androidx.**

# Keep Kotlin metadata
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**

# ============================================================
# JSON/Serialization
# ============================================================
-keep class org.json.** { *; }

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
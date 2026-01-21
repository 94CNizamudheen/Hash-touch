package com.hashone.hashtouch

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.hashone.hashtouch.printer.PrinterBridge
import com.hashone.hashtouch.service.WebSocketServiceBridge
import com.hashone.hashtouch.ui.SystemInsetsBridge

class MainActivity : TauriActivity() {

  companion object {
    private const val TAG = "MainActivity"
  }

  private lateinit var printerBridge: PrinterBridge
  private lateinit var webSocketServiceBridge: WebSocketServiceBridge
  private lateinit var systemInsetsBridge: SystemInsetsBridge
  private var isWebViewReady = false

  // Permission launcher for notification permission (Android 13+)
  private val notificationPermissionLauncher = registerForActivityResult(
    ActivityResultContracts.RequestPermission()
  ) { isGranted ->
    if (isGranted) {
      Log.d(TAG, "Notification permission granted")
    } else {
      Log.w(TAG, "Notification permission denied - foreground service notification may not show")
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    // enableEdgeToEdge works on API 21+ but may have visual issues on older POS terminals
    // Only enable on Android 8.0+ (API 26) for better compatibility with Sunmi/POS devices
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      enableEdgeToEdge()
    }
    super.onCreate(savedInstanceState)

    // Request notification permission on Android 13+
    requestNotificationPermissionIfNeeded()
  }

  @SuppressLint("SetJavaScriptEnabled")
  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)

    // Initialize and inject the printer bridge
    printerBridge = PrinterBridge(this)
    webView.addJavascriptInterface(printerBridge, PrinterBridge.JS_INTERFACE_NAME)
    Log.d(TAG, "PrinterBridge injected as '${PrinterBridge.JS_INTERFACE_NAME}'")

    // Initialize and inject the WebSocket service bridge
    webSocketServiceBridge = WebSocketServiceBridge(this)
    webView.addJavascriptInterface(webSocketServiceBridge, WebSocketServiceBridge.JS_INTERFACE_NAME)
    Log.d(TAG, "WebSocketServiceBridge injected as '${WebSocketServiceBridge.JS_INTERFACE_NAME}'")

    // Initialize system insets bridge for safe area handling on POS devices
    systemInsetsBridge = SystemInsetsBridge(this, webView)
    webView.addJavascriptInterface(systemInsetsBridge, SystemInsetsBridge.JS_INTERFACE_NAME)
    systemInsetsBridge.initialize()
    isWebViewReady = true
    Log.d(TAG, "SystemInsetsBridge initialized for safe area handling")
  }

  override fun onResume() {
    super.onResume()
    Log.d(TAG, "onResume - re-injecting safe area insets")

    // Re-inject CSS variables when app comes back from background
    // Use retry mechanism to ensure it works on slow POS terminals
    if (isWebViewReady && ::systemInsetsBridge.isInitialized) {
      window.decorView.postDelayed({
        systemInsetsBridge.injectWithRetry(retryCount = 3, delayMs = 150)
        Log.d(TAG, "Safe area insets re-injection scheduled after resume")
      }, 100)
    }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    Log.d(TAG, "onWindowFocusChanged: hasFocus=$hasFocus")

    // Re-inject when window gains focus (important for POS terminals)
    if (hasFocus && isWebViewReady && ::systemInsetsBridge.isInitialized) {
      window.decorView.postDelayed({
        systemInsetsBridge.forceRefresh()
        Log.d(TAG, "Safe area insets force refresh after focus change")
      }, 200)
    }
  }

  private fun requestNotificationPermissionIfNeeded() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      val hasPermission = ContextCompat.checkSelfPermission(
        this,
        Manifest.permission.POST_NOTIFICATIONS
      ) == PackageManager.PERMISSION_GRANTED

      if (!hasPermission) {
        Log.d(TAG, "Requesting POST_NOTIFICATIONS permission")
        notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
      }
    }
  }
}

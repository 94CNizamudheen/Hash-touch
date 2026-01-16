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

class MainActivity : TauriActivity() {

  companion object {
    private const val TAG = "MainActivity"
  }

  private lateinit var printerBridge: PrinterBridge
  private lateinit var webSocketServiceBridge: WebSocketServiceBridge

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
    enableEdgeToEdge()
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

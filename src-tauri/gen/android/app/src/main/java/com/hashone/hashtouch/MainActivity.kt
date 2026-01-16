package com.hashone.hashtouch

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import com.hashone.hashtouch.printer.PrinterBridge

class MainActivity : TauriActivity() {

  private lateinit var printerBridge: PrinterBridge

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  @SuppressLint("SetJavaScriptEnabled")
  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)

    // Initialize and inject the printer bridge
    printerBridge = PrinterBridge(this)
    webView.addJavascriptInterface(printerBridge, PrinterBridge.JS_INTERFACE_NAME)

    android.util.Log.d("MainActivity", "PrinterBridge injected as '${PrinterBridge.JS_INTERFACE_NAME}'")
  }
}

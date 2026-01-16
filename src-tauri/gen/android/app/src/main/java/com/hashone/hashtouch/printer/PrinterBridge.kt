package com.hashone.hashtouch.printer

import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import org.json.JSONObject

/**
 * JavaScript Bridge for Built-in Printer
 *
 * This class provides a bridge between the WebView (frontend) and
 * the native Android printer functionality.
 *
 * Usage from JavaScript:
 *   window.BuiltinPrinter.isAvailable()
 *   window.BuiltinPrinter.detect()
 *   window.BuiltinPrinter.printEscPos(base64Data)
 *   window.BuiltinPrinter.printTest()
 */
class PrinterBridge(private val context: Context) {

    companion object {
        private const val TAG = "PrinterBridge"
        const val JS_INTERFACE_NAME = "BuiltinPrinter"
    }

    private val printer: BuiltinPrinter by lazy {
        BuiltinPrinter.getInstance(context)
    }

    /**
     * Check if built-in printer is available
     * @return "true" or "false" as string
     */
    @JavascriptInterface
    fun isAvailable(): String {
        return try {
            val available = printer.isAvailable()
            Log.d(TAG, "isAvailable: $available")
            available.toString()
        } catch (e: Exception) {
            Log.e(TAG, "isAvailable error: ${e.message}")
            "false"
        }
    }

    /**
     * Detect built-in printer and return info as JSON
     * @return JSON string with printer detection result
     */
    @JavascriptInterface
    fun detect(): String {
        return try {
            val result = printer.detectPrinter()
            val json = JSONObject().apply {
                put("available", result.available)
                put("type", result.type)
                put("deviceName", result.deviceName ?: "")
                put("vendorId", result.vendorId ?: 0)
                put("productId", result.productId ?: 0)
                put("manufacturer", result.manufacturer)
                put("model", result.model)
            }
            Log.d(TAG, "detect: $json")
            json.toString()
        } catch (e: Exception) {
            Log.e(TAG, "detect error: ${e.message}")
            JSONObject().apply {
                put("available", false)
                put("error", e.message)
            }.toString()
        }
    }

    /**
     * Print raw ESC/POS data (base64 encoded)
     * @param base64Data Base64 encoded ESC/POS command bytes
     * @return JSON string with result { success: boolean, error?: string }
     */
    @JavascriptInterface
    fun printEscPos(base64Data: String): String {
        return try {
            Log.d(TAG, "printEscPos called, data length: ${base64Data.length}")

            // Decode base64 to bytes
            val data = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT)
            Log.d(TAG, "Decoded ${data.size} bytes")

            // Print
            val success = printer.printRaw(data)

            JSONObject().apply {
                put("success", success)
                if (!success) {
                    put("error", "Failed to send data to printer")
                }
            }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "printEscPos error: ${e.message}")
            JSONObject().apply {
                put("success", false)
                put("error", e.message)
            }.toString()
        }
    }

    /**
     * Print a test page
     * @return JSON string with result { success: boolean, error?: string }
     */
    @JavascriptInterface
    fun printTest(): String {
        return try {
            Log.d(TAG, "printTest called")
            val success = printer.printTestPage()

            JSONObject().apply {
                put("success", success)
                if (!success) {
                    put("error", "Failed to print test page")
                }
            }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "printTest error: ${e.message}")
            JSONObject().apply {
                put("success", false)
                put("error", e.message)
            }.toString()
        }
    }

    /**
     * Connect to the printer
     * @return JSON string with result { success: boolean, error?: string }
     */
    @JavascriptInterface
    fun connect(): String {
        return try {
            val success = printer.connect()
            JSONObject().apply {
                put("success", success)
                if (!success) {
                    put("error", "Failed to connect to printer")
                }
            }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "connect error: ${e.message}")
            JSONObject().apply {
                put("success", false)
                put("error", e.message)
            }.toString()
        }
    }

    /**
     * Disconnect from the printer
     */
    @JavascriptInterface
    fun disconnect(): String {
        return try {
            printer.disconnect()
            JSONObject().apply {
                put("success", true)
            }.toString()
        } catch (e: Exception) {
            Log.e(TAG, "disconnect error: ${e.message}")
            JSONObject().apply {
                put("success", false)
                put("error", e.message)
            }.toString()
        }
    }
}

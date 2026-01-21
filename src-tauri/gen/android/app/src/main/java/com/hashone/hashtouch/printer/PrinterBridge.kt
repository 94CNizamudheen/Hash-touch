package com.hashone.hashtouch.printer

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.os.Build
import android.util.Log
import android.webkit.JavascriptInterface
import org.json.JSONObject

class PrinterBridge(private val context: Context) {

    companion object {
        private const val TAG = "PrinterBridge"
        const val JS_INTERFACE_NAME = "BuiltinPrinter"
        private const val ACTION_USB_PERMISSION = "com.hashone.hashtouch.USB_PERMISSION"
    }

    // ✅ UNIVERSAL PRINTER MANAGER (STEP 6)
    private val printerManager by lazy {
        UniversalPrinterManager(context)
    }

    // Keep BuiltinPrinter ONLY for detection + debug helpers
    private val builtinPrinter by lazy {
        BuiltinPrinter.getInstance(context)
    }

    private val usbManager: UsbManager? by lazy {
        context.getSystemService(Context.USB_SERVICE) as? UsbManager
    }

    @Volatile
    private var permissionGranted: Boolean? = null

    // -------------------- USB PERMISSION RECEIVER --------------------

    private val usbReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {

            if (ACTION_USB_PERMISSION == intent.action) {

                synchronized(this@PrinterBridge) {

                    val device: UsbDevice? =
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            intent.getParcelableExtra(
                                UsbManager.EXTRA_DEVICE,
                                UsbDevice::class.java
                            )
                        } else {
                            @Suppress("DEPRECATION")
                            intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
                        }

                    permissionGranted =
                        intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)

                    Log.d(TAG, "USB permission result=$permissionGranted for ${device?.deviceName}")

                    (this@PrinterBridge as Object).notifyAll()
                }
            }
        }
    }

    // -------------------- AVAILABILITY --------------------

    @JavascriptInterface
    fun isAvailable(): String {
        return try {
            printerManager.isAvailable().toString()
        } catch (e: Exception) {
            Log.e(TAG, "isAvailable error", e)
            "false"
        }
    }

    // -------------------- DETECTION --------------------

    @JavascriptInterface
    fun detect(): String {
        return try {

            val result = builtinPrinter.detectPrinter()

            JSONObject().apply {
                put("available", result.available)
                put("type", result.type)
                put("deviceName", result.deviceName ?: "")
                put("vendorId", result.vendorId ?: 0)
                put("productId", result.productId ?: 0)
                put("manufacturer", result.manufacturer)
                put("model", result.model)

                // Add reason when not available
                if (!result.available) {
                    val reason = when (result.type) {
                        "serial_no_permission" -> "Serial port found but no write permission. Device may not have a built-in printer."
                        "none" -> "No built-in printer detected on this device."
                        else -> "Printer not available."
                    }
                    put("reason", reason)
                }
            }.toString()

        } catch (e: Exception) {

            Log.e(TAG, "detect error", e)

            JSONObject().apply {
                put("available", false)
                put("error", e.message)
            }.toString()
        }
    }

    // -------------------- PRINT ESC/POS --------------------

    @JavascriptInterface
    fun printEscPos(base64Data: String): String {

        return try {

            val data = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT)

            // ✅ PRINT VIA UNIVERSAL ROUTER
            val result = printerManager.print(data)

            JSONObject().apply {
                put("success", result.success)
                if (!result.success) {
                    put("error", result.error)
                }
            }.toString()

        } catch (e: Exception) {

            Log.e(TAG, "printEscPos error", e)

            JSONObject().apply {
                put("success", false)
                put("error", e.message ?: "Print failed")
            }.toString()
        }
    }

    // -------------------- TEST PRINT --------------------

    @JavascriptInterface
    fun printTest(): String {

        return try {

            val testData = builtinPrinter.printTestPage()

            JSONObject().apply {
                put("success", testData.success)
                if (!testData.success) {
                    put("error", testData.error)
                }
            }.toString()

        } catch (e: Exception) {

            Log.e(TAG, "printTest error", e)

            JSONObject().apply {
                put("success", false)
                put("error", e.message)
            }.toString()
        }
    }

    // -------------------- USB PERMISSION CHECK --------------------

    @JavascriptInterface
    fun hasPermission(): String {

        return try {

            val detection = builtinPrinter.detectPrinter()

            // SERIAL printers don't need permission
            if (detection.type == "serial_builtin") {
                return JSONObject().apply {
                    put("granted", true)
                    put("type", "serial")
                }.toString()
            }

            val manager = usbManager ?: return JSONObject().apply {
                put("granted", false)
            }.toString()

            for ((_, device) in manager.deviceList) {
                if (manager.hasPermission(device)) {
                    return JSONObject().apply {
                        put("granted", true)
                        put("deviceName", device.deviceName)
                    }.toString()
                }
            }

            JSONObject().apply {
                put("granted", false)
            }.toString()

        } catch (e: Exception) {

            Log.e(TAG, "hasPermission error", e)

            JSONObject().apply {
                put("granted", false)
                put("error", e.message)
            }.toString()
        }
    }

    // -------------------- REQUEST PERMISSION --------------------

    @JavascriptInterface
    fun requestPermission(): String {

        return try {

            val detection = builtinPrinter.detectPrinter()

            // SERIAL printer → skip permission
            if (detection.type == "serial_builtin") {
                return JSONObject().apply {
                    put("success", true)
                    put("type", "serial")
                }.toString()
            }

            val manager = usbManager ?: return JSONObject().apply {
                put("success", false)
                put("error", "USB Manager not available")
            }.toString()

            val devices = manager.deviceList

            if (devices.isEmpty()) {
                return JSONObject().apply {
                    put("success", false)
                    put("error", "No USB devices found")
                }.toString()
            }

            val printerDevice = devices.values.first()

            // Already allowed
            if (manager.hasPermission(printerDevice)) {
                return JSONObject().apply {
                    put("success", true)
                    put("alreadyGranted", true)
                }.toString()
            }

            permissionGranted = null

            val filter = IntentFilter(ACTION_USB_PERMISSION)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(usbReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                @Suppress("UnspecifiedRegisterReceiverFlag")
                context.registerReceiver(usbReceiver, filter)
            }

            val flags =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0

            val permissionIntent = PendingIntent.getBroadcast(
                context,
                0,
                Intent(ACTION_USB_PERMISSION),
                flags
            )

            manager.requestPermission(printerDevice, permissionIntent)

            synchronized(this) {

                var waited = 0L
                val timeout = 15000L

                while (permissionGranted == null && waited < timeout) {
                    try {
                        (this as Object).wait(500)
                        waited += 500
                    } catch (_: InterruptedException) {
                    }
                }
            }

            try {
                context.unregisterReceiver(usbReceiver)
            } catch (_: Exception) {
            }

            val granted = permissionGranted == true

            JSONObject().apply {
                put("success", granted)
                if (!granted) {
                    put("error", "USB permission denied")
                }
            }.toString()

        } catch (e: Exception) {

            Log.e(TAG, "requestPermission error", e)

            JSONObject().apply {
                put("success", false)
                put("error", e.message ?: "Permission failed")
            }.toString()
        }
    }

    // -------------------- DEBUG HELPERS --------------------

    @JavascriptInterface
    fun listSerialPorts(): String {

        return try {

            val ports = builtinPrinter.getAvailableSerialPorts()

            JSONObject().apply {
                put("count", ports.size)
                put("ports", ports)
            }.toString()

        } catch (e: Exception) {

            JSONObject().apply {
                put("count", 0)
                put("ports", emptyList<String>())
                put("error", e.message)
            }.toString()
        }
    }

    @JavascriptInterface
    fun listUsbDevices(): String {

        return try {

            val manager = usbManager ?: return JSONObject().apply {
                put("count", 0)
                put("devices", emptyList<String>())
            }.toString()

            val devices = manager.deviceList.values.map {
                "${it.deviceName} VID=${it.vendorId} PID=${it.productId}"
            }

            JSONObject().apply {
                put("count", devices.size)
                put("devices", devices)
            }.toString()

        } catch (e: Exception) {

            JSONObject().apply {
                put("count", 0)
                put("devices", emptyList<String>())
                put("error", e.message)
            }.toString()
        }
    }

    /**
     * Get full diagnostic info - use this to identify how to print on unknown devices
     */
    @JavascriptInterface
    fun getDiagnostics(): String {
        return try {
            val diagnostics = printerManager.getDiagnostics()
            val json = JSONObject()

            // Device info
            val deviceInfo = diagnostics["device"] as? Map<*, *>
            json.put("device", JSONObject().apply {
                put("manufacturer", deviceInfo?.get("manufacturer") ?: "unknown")
                put("model", deviceInfo?.get("model") ?: "unknown")
                put("brand", deviceInfo?.get("brand") ?: "unknown")
                put("device", deviceInfo?.get("device") ?: "unknown")
                put("product", deviceInfo?.get("product") ?: "unknown")
            })

            // Adapter status
            val adapters = diagnostics["adapters"] as? Map<*, *>
            json.put("adapters", JSONObject().apply {
                put("sunmi", adapters?.get("sunmi") ?: false)
                put("pax", adapters?.get("pax") ?: false)
                put("intent", adapters?.get("intent") ?: false)
                put("usb", adapters?.get("usb") ?: false)
                put("serial", adapters?.get("serial") ?: false)
            })

            // Print services found
            val services = diagnostics["printServices"] as? List<*> ?: emptyList<Any>()
            json.put("printServices", org.json.JSONArray(services.map { svc ->
                if (svc is Map<*, *>) {
                    JSONObject().apply {
                        put("action", svc["action"])
                        put("package", svc["package"])
                        put("name", svc["name"])
                    }
                } else {
                    svc.toString()
                }
            }))

            // Serial ports
            val ports = diagnostics["serialPorts"] as? List<*> ?: emptyList<Any>()
            json.put("serialPorts", org.json.JSONArray(ports))

            json.toString()

        } catch (e: Exception) {
            Log.e(TAG, "getDiagnostics error", e)
            JSONObject().apply {
                put("error", e.message)
            }.toString()
        }
    }

    /**
     * Scan for ALL print-related services on the device
     * Use this to find vendor-specific print services
     */
    @JavascriptInterface
    fun scanPrintServices(): String {
        return try {
            val services = printerManager.scanAllPrintRelatedServices()
            val intentPrinter = IntentPrinterAdapter(context)
            val intentServices = intentPrinter.scanAvailableServices()

            JSONObject().apply {
                put("allPrintRelated", org.json.JSONArray(services))
                put("intentServices", org.json.JSONArray(intentServices))
                put("count", services.size + intentServices.size)
            }.toString()

        } catch (e: Exception) {
            Log.e(TAG, "scanPrintServices error", e)
            JSONObject().apply {
                put("error", e.message)
            }.toString()
        }
    }

    /**
     * Cleanup all printer resources. Call this when app is being destroyed.
     */
    fun cleanup() {
        Log.d(TAG, "PrinterBridge cleanup")
        try {
            context.unregisterReceiver(usbReceiver)
        } catch (_: Exception) {}

        builtinPrinter.cleanup()
    }
}

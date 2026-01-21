package com.hashone.hashtouch.printer

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log

class UniversalPrinterManager(private val context: Context) {

    companion object {
        private const val TAG = "UniversalPrinter"

        // Common print service actions used by various POS manufacturers
        private val COMMON_PRINT_SERVICES = listOf(
            // Sunmi
            "woyou.aidlservice.jiuiv5.IWoyouService",
            // Common Chinese POS
            "com.printer.service",
            "com.android.printer.service",
            "android.print.service",
            "com.pos.printer",
            "com.iposprinter.service",
            "net.posprinter.service",
            "com.xcheng.printerservice",
            // CloudeCode / Generic
            "com.cloude.printer",
            "com.cloudecode.printer",
            "com.print.service.IPrintService",
            // Others
            "com.gprinter.service",
            "com.zcs.print"
        )

        // Common print broadcast actions
        private val PRINT_BROADCAST_ACTIONS = listOf(
            "com.pos.print.action.PRINT",
            "android.intent.action.PRINT",
            "com.printer.action.PRINT_DATA"
        )
    }

    // Vendor-specific adapters (order matters - most specific first)
    private val sunmi = SunmiPrinterAdapter(context)
    private val pax = PaxPrinterAdapter(context)
    private val cloudcode = CloudCodeAdapter(context)
    private val ingenico = IngenicoAdapter(context)
    private val verifone = VerifoneAdapter(context)
    private val newland = NewlandAdapter(context)
    private val urovo = UrovoAdapter(context)
    private val telpo = TelpoAdapter(context)
    private val imin = IminAdapter(context)
    private val hprt = HprtAdapter(context)

    // Generic adapters (fallbacks)
    private val intentPrinter = IntentPrinterAdapter(context)
    private val usb = UsbPrinterAdapter(context)
    private val serial = SerialPrinterAdapter(context)

    // List of all vendor adapters with their names for logging
    private data class AdapterEntry(
        val name: String,
        val isAvailable: () -> Boolean,
        val print: (ByteArray) -> PrintResult
    )

    private val vendorAdapters = listOf(
        AdapterEntry("SUNMI", sunmi::isAvailable, sunmi::print),
        AdapterEntry("PAX", pax::isAvailable, pax::print),
        AdapterEntry("CLOUDCODE", cloudcode::isAvailable, cloudcode::print),
        AdapterEntry("INGENICO", ingenico::isAvailable, ingenico::print),
        AdapterEntry("VERIFONE", verifone::isAvailable, verifone::print),
        AdapterEntry("NEWLAND", newland::isAvailable, newland::print),
        AdapterEntry("UROVO", urovo::isAvailable, urovo::print),
        AdapterEntry("TELPO", telpo::isAvailable, telpo::print),
        AdapterEntry("IMIN", imin::isAvailable, imin::print),
        AdapterEntry("HPRT", hprt::isAvailable, hprt::print),
    )

    fun isAvailable(): Boolean {
        // Check vendor adapters
        for (adapter in vendorAdapters) {
            if (adapter.isAvailable()) return true
        }
        // Check generic adapters
        return intentPrinter.isAvailable() || usb.isAvailable() || serial.isAvailable()
    }

    fun print(data: ByteArray): PrintResult {
        Log.d(TAG, "Device: ${Build.MANUFACTURER} ${Build.MODEL} (${Build.BRAND})")

        // 1️⃣ Try vendor-specific adapters first (BEST reliability)
        for (adapter in vendorAdapters) {
            if (adapter.isAvailable()) {
                Log.d(TAG, "Using ${adapter.name} printer")
                return adapter.print(data)
            }
        }

        // 2️⃣ Intent-based printers (many Chinese POS)
        if (intentPrinter.isAvailable()) {
            Log.d(TAG, "Using INTENT printer")
            return intentPrinter.print(data)
        }

        // 3️⃣ USB printers
        if (usb.isAvailable()) {
            Log.d(TAG, "Using USB printer")
            return usb.print(data)
        }

        // 4️⃣ Serial fallback
        if (serial.isAvailable()) {
            Log.d(TAG, "Using SERIAL printer")
            return serial.print(data)
        }

        // No printer found - provide helpful diagnostics
        val serialPorts = BuiltinPrinter.getInstance(context).getAvailableSerialPorts()
        val hasInaccessiblePorts = serialPorts.any { it.contains("w=false") }

        val errorMsg = buildString {
            append("No printer found on ${Build.MANUFACTURER} ${Build.MODEL}. ")
            if (hasInaccessiblePorts) {
                append("Serial ports exist but require system permissions. ")
            }
            append("Run getDiagnostics() to identify available print methods.")
        }

        Log.w(TAG, errorMsg)
        Log.d(TAG, "Serial ports: $serialPorts")

        return PrintResult(false, errorMsg)
    }

    /**
     * Get detailed diagnostic info about available printers
     */
    fun getDiagnostics(): Map<String, Any> {
        val diagnostics = mutableMapOf<String, Any>()

        diagnostics["device"] = mapOf(
            "manufacturer" to Build.MANUFACTURER,
            "model" to Build.MODEL,
            "brand" to Build.BRAND,
            "device" to Build.DEVICE,
            "product" to Build.PRODUCT
        )

        // Check all vendor adapters
        val adapterStatus = mutableMapOf<String, Boolean>()
        for (adapter in vendorAdapters) {
            adapterStatus[adapter.name.lowercase()] = adapter.isAvailable()
        }
        // Add generic adapters
        adapterStatus["intent"] = intentPrinter.isAvailable()
        adapterStatus["usb"] = usb.isAvailable()
        adapterStatus["serial"] = serial.isAvailable()

        diagnostics["adapters"] = adapterStatus

        // Scan for print services
        diagnostics["printServices"] = scanPrintServices()

        // Get serial ports
        diagnostics["serialPorts"] = BuiltinPrinter.getInstance(context).getAvailableSerialPorts()

        return diagnostics
    }

    /**
     * Scan device for available print-related services
     */
    private fun scanPrintServices(): List<Map<String, String>> {
        val services = mutableListOf<Map<String, String>>()

        for (action in COMMON_PRINT_SERVICES) {
            val intent = Intent(action)
            val resolved = context.packageManager.queryIntentServices(intent, PackageManager.MATCH_ALL)

            for (info in resolved) {
                services.add(mapOf(
                    "action" to action,
                    "package" to info.serviceInfo.packageName,
                    "name" to info.serviceInfo.name
                ))
            }
        }

        return services
    }

    /**
     * Get list of all services that might be print-related
     */
    fun scanAllPrintRelatedServices(): List<String> {
        val result = mutableListOf<String>()

        try {
            val packages = context.packageManager.getInstalledPackages(PackageManager.GET_SERVICES)

            for (pkg in packages) {
                pkg.services?.forEach { service ->
                    val name = service.name.lowercase()
                    if (name.contains("print") || name.contains("printer") ||
                        name.contains("pos") || name.contains("thermal")) {
                        result.add("${pkg.packageName}/${service.name}")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to scan services", e)
        }

        return result
    }
}

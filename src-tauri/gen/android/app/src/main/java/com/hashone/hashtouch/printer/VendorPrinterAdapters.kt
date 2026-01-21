package com.hashone.hashtouch.printer

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log

/**
 * Additional vendor-specific printer adapters for common POS brands
 */

// ==================== INGENICO ====================
class IngenicoAdapter(private val context: Context) {

    companion object {
        private const val TAG = "IngenicoAdapter"
        private const val INGENICO_PRINT_SERVICE = "com.ingenico.ipp.printer"
    }

    fun isAvailable(): Boolean {
        val isIngenico = Build.MANUFACTURER.lowercase().let {
            it.contains("ingenico") || it.contains("aevi")
        }
        if (!isIngenico) return false

        // Check for print service
        return try {
            val intent = Intent("$INGENICO_PRINT_SERVICE.PRINT")
            context.packageManager.queryIntentServices(intent, 0).isNotEmpty()
        } catch (e: Exception) {
            false
        }
    }

    fun print(data: ByteArray): PrintResult {
        return try {
            val intent = Intent("$INGENICO_PRINT_SERVICE.PRINT")
            intent.putExtra("data", data)
            intent.putExtra("raw", data)
            context.startService(intent)
            PrintResult(true)
        } catch (e: Exception) {
            Log.e(TAG, "Ingenico print failed", e)
            PrintResult(false, e.message)
        }
    }
}

// ==================== VERIFONE ====================
class VerifoneAdapter(private val context: Context) {

    companion object {
        private const val TAG = "VerifoneAdapter"
    }

    fun isAvailable(): Boolean {
        val isVerifone = Build.MANUFACTURER.lowercase().contains("verifone")
        if (!isVerifone) return false

        // Verifone uses their SDK - check if classes exist
        return try {
            Class.forName("com.verifone.peripherals.Printer")
            true
        } catch (e: Exception) {
            false
        }
    }

    fun print(data: ByteArray): PrintResult {
        return try {
            // Use reflection since we may not have SDK at compile time
            val printerClass = Class.forName("com.verifone.peripherals.Printer")
            val getInstance = printerClass.getMethod("getInstance", Context::class.java)
            val printer = getInstance.invoke(null, context)

            val printMethod = printerClass.getMethod("print", ByteArray::class.java)
            printMethod.invoke(printer, data)

            PrintResult(true)
        } catch (e: Exception) {
            Log.e(TAG, "Verifone print failed", e)
            PrintResult(false, e.message)
        }
    }
}

// ==================== NEWLAND ====================
class NewlandAdapter(private val context: Context) {

    companion object {
        private const val TAG = "NewlandAdapter"
        private const val NEWLAND_SERVICE = "com.newland.me.DeviceService"
    }

    fun isAvailable(): Boolean {
        val isNewland = Build.MANUFACTURER.lowercase().let {
            it.contains("newland") || it.contains("nlpos")
        }
        if (!isNewland) return false

        return try {
            val intent = Intent(NEWLAND_SERVICE)
            context.packageManager.queryIntentServices(intent, 0).isNotEmpty()
        } catch (e: Exception) {
            false
        }
    }

    fun print(data: ByteArray): PrintResult {
        return try {
            // Newland uses AIDL service similar to Sunmi
            val intent = Intent(NEWLAND_SERVICE)
            intent.putExtra("print_data", data)
            context.startService(intent)
            PrintResult(true)
        } catch (e: Exception) {
            Log.e(TAG, "Newland print failed", e)
            PrintResult(false, e.message)
        }
    }
}

// ==================== UROVO ====================
class UrovoAdapter(private val context: Context) {

    companion object {
        private const val TAG = "UrovoAdapter"
    }

    fun isAvailable(): Boolean {
        val isUrovo = Build.MANUFACTURER.lowercase().let {
            it.contains("urovo") || it.contains("ubx")
        }
        if (!isUrovo) return false

        return try {
            Class.forName("android.device.PrinterManager")
            true
        } catch (e: Exception) {
            false
        }
    }

    fun print(data: ByteArray): PrintResult {
        return try {
            val pmClass = Class.forName("android.device.PrinterManager")
            val constructor = pmClass.getConstructor()
            val printer = constructor.newInstance()

            // setupPage and print
            val setupMethod = pmClass.getMethod("setupPage", Int::class.java, Int::class.java)
            setupMethod.invoke(printer, -1, -1) // default width/height

            val printMethod = pmClass.getMethod("printRawData", ByteArray::class.java)
            printMethod.invoke(printer, data)

            PrintResult(true)
        } catch (e: Exception) {
            Log.e(TAG, "Urovo print failed", e)
            PrintResult(false, e.message)
        }
    }
}

// ==================== TELPO ====================
class TelpoAdapter(private val context: Context) {

    companion object {
        private const val TAG = "TelpoAdapter"
    }

    fun isAvailable(): Boolean {
        val isTelpo = Build.MANUFACTURER.lowercase().contains("telpo")
        if (!isTelpo) return false

        return try {
            Class.forName("com.telpo.tps550.api.printer.ThermalPrinter")
            true
        } catch (e: Exception) {
            false
        }
    }

    fun print(data: ByteArray): PrintResult {
        return try {
            val printerClass = Class.forName("com.telpo.tps550.api.printer.ThermalPrinter")
            val getInstance = printerClass.getMethod("getInstance")
            val printer = getInstance.invoke(null)

            val resetMethod = printerClass.getMethod("reset")
            resetMethod.invoke(printer)

            val writeMethod = printerClass.getMethod("write", ByteArray::class.java)
            writeMethod.invoke(printer, data)

            PrintResult(true)
        } catch (e: Exception) {
            Log.e(TAG, "Telpo print failed", e)
            PrintResult(false, e.message)
        }
    }
}

// ==================== IMIN ====================
class IminAdapter(private val context: Context) {

    companion object {
        private const val TAG = "IminAdapter"
        private const val IMIN_SERVICE = "com.imin.printerservice"
    }

    fun isAvailable(): Boolean {
        val isImin = Build.MANUFACTURER.lowercase().contains("imin")
        if (!isImin) return false

        return try {
            val pm = context.packageManager
            pm.getPackageInfo(IMIN_SERVICE, 0)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun print(data: ByteArray): PrintResult {
        return try {
            // IMIN uses similar API to Sunmi
            val intent = Intent("$IMIN_SERVICE.IPosPrinterService")
            intent.setPackage(IMIN_SERVICE)
            intent.putExtra("print_data", data)
            context.startService(intent)
            PrintResult(true)
        } catch (e: Exception) {
            Log.e(TAG, "IMIN print failed", e)
            PrintResult(false, e.message)
        }
    }
}

// ==================== HPRT ====================
class HprtAdapter(private val context: Context) {

    companion object {
        private const val TAG = "HprtAdapter"
    }

    fun isAvailable(): Boolean {
        val isHprt = Build.MANUFACTURER.lowercase().contains("hprt")
        if (!isHprt) return false

        return try {
            Class.forName("com.hprt.api.HPRTPrinterHelper")
            true
        } catch (e: Exception) {
            false
        }
    }

    fun print(data: ByteArray): PrintResult {
        return try {
            val helperClass = Class.forName("com.hprt.api.HPRTPrinterHelper")
            val printMethod = helperClass.getMethod("printRawData", ByteArray::class.java)
            printMethod.invoke(null, data)
            PrintResult(true)
        } catch (e: Exception) {
            Log.e(TAG, "HPRT print failed", e)
            PrintResult(false, e.message)
        }
    }
}

// ==================== CLOUDCODE ====================
class CloudCodeAdapter(private val context: Context) {

    companion object {
        private const val TAG = "CloudCodeAdapter"

        // Known CloudCode print service packages/actions
        private val CLOUDCODE_SERVICES = listOf(
            "com.cloude.printer",
            "com.cloudecode.printer",
            "com.cloude.printservice",
            "com.cloudecode.printservice",
            "com.cloude.pos.printer",
            "com.cloudcode.printer",
            "com.cloudcode.printservice",
            // Cp50 specific
            "com.cp50.printer",
            "com.cloudcode.cp50.printer"
        )

        private val CLOUDCODE_PACKAGES = listOf(
            "com.cloude.printer",
            "com.cloudecode.printer",
            "com.cloude.printservice",
            "com.cloudcode.printer",
            "com.cloudcode.printservice"
        )

        // Common serial port paths for CloudCode devices
        private val CLOUDCODE_SERIAL_PORTS = listOf(
            "/dev/ttyS1",
            "/dev/ttyS0",
            "/dev/ttyMT1",
            "/dev/ttyMT0"
        )

        // Cp50 typical baud rate
        private const val CP50_BAUD_RATE = 115200
    }

    private var foundService: String? = null
    private var foundPackage: String? = null
    private var useSerialFallback = false

    fun isAvailable(): Boolean {
        // Check manufacturer - support various spellings
        val manufacturer = Build.MANUFACTURER.lowercase()
        val brand = Build.BRAND.lowercase()
        val model = Build.MODEL.lowercase()

        val isCloudCode = manufacturer.contains("cloude") ||
            manufacturer.contains("cloudcode") ||
            manufacturer.contains("cloud code") ||
            manufacturer.contains("cloud_code") ||
            brand.contains("cloude") ||
            brand.contains("cloudcode") ||
            model.contains("cp50") ||  // Cp50 model detection
            model.contains("cp-50")

        if (!isCloudCode) return false

        Log.d(TAG, "CloudCode device detected: $manufacturer $model")

        // Try to find the print service
        for (service in CLOUDCODE_SERVICES) {
            try {
                val intent = Intent(service)
                val resolved = context.packageManager.queryIntentServices(intent, PackageManager.MATCH_ALL)
                if (resolved.isNotEmpty()) {
                    foundService = service
                    foundPackage = resolved.first().serviceInfo.packageName
                    Log.d(TAG, "Found CloudCode service: $service in package $foundPackage")
                    return true
                }
            } catch (e: Exception) {
                // Continue to next
            }
        }

        // Try checking if known packages exist
        for (pkg in CLOUDCODE_PACKAGES) {
            try {
                context.packageManager.getPackageInfo(pkg, 0)
                foundPackage = pkg
                Log.d(TAG, "Found CloudCode package: $pkg")
                return true
            } catch (e: Exception) {
                // Continue to next
            }
        }

        // Check for CloudCode SDK classes via reflection
        val sdkClasses = listOf(
            "com.cloude.printer.PrinterService",
            "com.cloudecode.printer.PrinterManager",
            "com.cloude.sdk.printer.Printer",
            "com.cloudcode.printer.PrinterManager"
        )

        for (className in sdkClasses) {
            try {
                Class.forName(className)
                Log.d(TAG, "Found CloudCode SDK class: $className")
                return true
            } catch (e: Exception) {
                // Continue to next
            }
        }

        // For CloudCode devices without SDK, use serial fallback with proper config
        // Check if we have writable serial ports
        for (port in CLOUDCODE_SERIAL_PORTS) {
            val file = java.io.File(port)
            if (file.exists() && file.canWrite()) {
                Log.d(TAG, "CloudCode device using serial fallback: $port")
                useSerialFallback = true
                return true
            }
        }

        return false
    }

    fun print(data: ByteArray): PrintResult {
        // Method 1: Try bound service
        if (foundService != null) {
            try {
                val intent = Intent(foundService)
                if (foundPackage != null) {
                    intent.setPackage(foundPackage)
                }
                intent.putExtra("print_data", data)
                intent.putExtra("data", data)
                intent.putExtra("raw", data)
                intent.putExtra("escpos", data)

                val result = context.startService(intent)
                if (result != null) {
                    Log.d(TAG, "CloudCode service started: $result")
                    return PrintResult(true)
                }
            } catch (e: Exception) {
                Log.w(TAG, "CloudCode service method failed: ${e.message}")
            }
        }

        // Method 2: Try SDK reflection
        val sdkAttempts = listOf(
            Triple("com.cloude.printer.PrinterService", "getInstance", "printRaw"),
            Triple("com.cloudecode.printer.PrinterManager", "getPrinter", "print"),
            Triple("com.cloude.sdk.printer.Printer", "getInstance", "sendRawData"),
            Triple("com.cloudcode.printer.PrinterManager", "getInstance", "print")
        )

        for ((className, getMethod, printMethod) in sdkAttempts) {
            try {
                val printerClass = Class.forName(className)

                // Try to get instance
                val getInstance = try {
                    printerClass.getMethod(getMethod)
                } catch (e: Exception) {
                    printerClass.getMethod(getMethod, Context::class.java)
                }

                val printer = if (getInstance.parameterCount == 0) {
                    getInstance.invoke(null)
                } else {
                    getInstance.invoke(null, context)
                }

                if (printer != null) {
                    // Try to find print method
                    val print = printerClass.getMethod(printMethod, ByteArray::class.java)
                    print.invoke(printer, data)
                    Log.d(TAG, "CloudCode SDK print succeeded via $className")
                    return PrintResult(true)
                }
            } catch (e: Exception) {
                Log.d(TAG, "CloudCode SDK $className not available: ${e.message}")
            }
        }

        // Method 3: Serial fallback with proper configuration (for Cp50 and similar)
        if (useSerialFallback) {
            Log.d(TAG, "Using CloudCode serial fallback")
            val serialResult = printViaConfiguredSerial(data)
            if (serialResult.success) {
                return serialResult
            }
            Log.w(TAG, "CloudCode serial fallback failed: ${serialResult.error}")
        }

        // Method 4: Try broadcast
        try {
            val broadcastActions = listOf(
                "com.cloude.printer.action.PRINT",
                "com.cloudecode.printer.action.PRINT_RAW",
                "com.cloude.action.PRINT",
                "com.cloudcode.printer.action.PRINT"
            )

            for (action in broadcastActions) {
                val intent = Intent(action)
                intent.putExtra("print_data", data)
                intent.putExtra("data", data)
                intent.putExtra("raw", data)
                context.sendBroadcast(intent)
                Log.d(TAG, "Sent CloudCode broadcast: $action")
            }

            // Note: broadcasts can't be verified, but on CloudCode devices this may work
            return PrintResult(true)

        } catch (e: Exception) {
            Log.e(TAG, "CloudCode broadcast failed", e)
        }

        return PrintResult(false, "CloudCode printer service not responding")
    }

    /**
     * Print via serial port with proper configuration for CloudCode devices
     */
    private fun printViaConfiguredSerial(data: ByteArray): PrintResult {
        // Find available port
        var targetPort: String? = null
        for (port in CLOUDCODE_SERIAL_PORTS) {
            val file = java.io.File(port)
            if (file.exists() && file.canWrite()) {
                targetPort = port
                break
            }
        }

        if (targetPort == null) {
            return PrintResult(false, "No writable serial port found")
        }

        Log.d(TAG, "CloudCode printing to serial port: $targetPort")

        // Configure serial port first
        val configResult = configureSerialPort(targetPort)
        if (!configResult) {
            Log.w(TAG, "Could not configure serial port, attempting print anyway")
        }

        // Write data
        var fos: java.io.FileOutputStream? = null
        return try {
            fos = java.io.FileOutputStream(targetPort)

            val chunkSize = 512
            var offset = 0

            while (offset < data.size) {
                val len = minOf(chunkSize, data.size - offset)
                fos.write(data, offset, len)
                fos.flush()
                offset += len

                if (offset < data.size) {
                    Thread.sleep(10)
                }
            }

            Log.d(TAG, "CloudCode serial print complete: ${data.size} bytes to $targetPort")

            // Give printer time to process
            Thread.sleep(300)

            PrintResult(true)

        } catch (e: Exception) {
            Log.e(TAG, "CloudCode serial print failed", e)
            PrintResult(false, "Serial print failed: ${e.message}")
        } finally {
            try { fos?.close() } catch (_: Exception) {}
        }
    }

    /**
     * Configure serial port with stty for CloudCode devices
     */
    private fun configureSerialPort(port: String): Boolean {
        // Common baud rates to try (Cp50 typically uses 115200 or 9600)
        val baudRates = listOf(115200, 9600, 19200, 38400, 57600)

        for (baud in baudRates) {
            try {
                val process = ProcessBuilder("sh", "-c",
                    "stty -F $port $baud cs8 -cstopb -parenb raw -echo 2>&1")
                    .start()

                val output = process.inputStream.bufferedReader().use { it.readText() }
                val exitCode = process.waitFor()

                if (exitCode == 0) {
                    Log.d(TAG, "CloudCode serial port configured: $port @ $baud baud")
                    return true
                } else {
                    Log.d(TAG, "stty $baud failed: $output")
                }
            } catch (e: Exception) {
                Log.d(TAG, "stty failed for $baud: ${e.message}")
            }
        }
        return false
    }
}

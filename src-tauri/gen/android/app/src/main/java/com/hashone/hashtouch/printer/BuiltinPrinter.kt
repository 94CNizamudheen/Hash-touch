package com.hashone.hashtouch.printer

import android.content.Context
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbDeviceConnection
import android.hardware.usb.UsbEndpoint
import android.hardware.usb.UsbInterface
import android.hardware.usb.UsbManager
import android.os.Build
import android.util.Log

/**
 * Generic Android POS Built-in Printer Handler
 *
 * Supports printing via USB serial (most common for Android POS devices)
 * Works with devices that expose their internal thermal printer as USB
 */
class BuiltinPrinter(private val context: Context) {

    companion object {
        private const val TAG = "BuiltinPrinter"

        // Common USB vendor IDs for thermal printers
        private val PRINTER_VENDOR_IDS = setOf(
            0x0483, // STMicroelectronics (common in Chinese POS)
            0x0416, // Winbond (many thermal printers)
            0x04B8, // Epson
            0x0519, // Star Micronics
            0x0DD4, // Custom Engineering
            0x0FE6, // Contec/Generic
            0x1504, // Face (common POS printer)
            0x20D1, // Simba
            0x1659, // ShenZhen
            0x6868, // Generic Chinese thermal
            0x0525, // PLX Technology (USB-Serial bridge)
            0x067B, // Prolific (USB-Serial)
            0x10C4, // Silicon Labs (USB-Serial)
            0x1A86, // QinHeng (CH340 USB-Serial, very common)
        )

        // USB class for printers
        private const val USB_CLASS_PRINTER = 7

        @Volatile
        private var instance: BuiltinPrinter? = null

        fun getInstance(context: Context): BuiltinPrinter {
            return instance ?: synchronized(this) {
                instance ?: BuiltinPrinter(context.applicationContext).also { instance = it }
            }
        }
    }

    private var usbManager: UsbManager? = null
    private var usbDevice: UsbDevice? = null
    private var usbConnection: UsbDeviceConnection? = null
    private var usbInterface: UsbInterface? = null
    private var usbEndpoint: UsbEndpoint? = null

    init {
        usbManager = context.getSystemService(Context.USB_SERVICE) as? UsbManager
    }

    /**
     * Detect if a built-in printer is available
     */
    fun detectPrinter(): PrinterDetectionResult {
        Log.d(TAG, "Detecting built-in printer...")
        Log.d(TAG, "Device: ${Build.MANUFACTURER} ${Build.MODEL}")

        // Check USB devices for printer
        val usbPrinter = findUsbPrinter()
        if (usbPrinter != null) {
            Log.d(TAG, "Found USB printer: ${usbPrinter.deviceName}")
            return PrinterDetectionResult(
                available = true,
                type = "usb_builtin",
                deviceName = usbPrinter.deviceName,
                vendorId = usbPrinter.vendorId,
                productId = usbPrinter.productId,
                manufacturer = Build.MANUFACTURER,
                model = Build.MODEL
            )
        }

        Log.d(TAG, "No built-in printer detected")
        return PrinterDetectionResult(
            available = false,
            type = "none",
            deviceName = null,
            vendorId = null,
            productId = null,
            manufacturer = Build.MANUFACTURER,
            model = Build.MODEL
        )
    }

    /**
     * Find USB printer device
     */
    private fun findUsbPrinter(): UsbDevice? {
        val manager = usbManager ?: return null
        val deviceList = manager.deviceList

        Log.d(TAG, "Scanning ${deviceList.size} USB devices...")

        for ((_, device) in deviceList) {
            Log.d(TAG, "USB Device: ${device.deviceName}, VID: ${device.vendorId}, PID: ${device.productId}, Class: ${device.deviceClass}")

            // Check if it's a known printer vendor
            if (PRINTER_VENDOR_IDS.contains(device.vendorId)) {
                Log.d(TAG, "Found device from known printer vendor: ${device.vendorId}")
                return device
            }

            // Check device class
            if (device.deviceClass == USB_CLASS_PRINTER) {
                Log.d(TAG, "Found USB printer class device")
                return device
            }

            // Check interface classes
            for (i in 0 until device.interfaceCount) {
                val iface = device.getInterface(i)
                if (iface.interfaceClass == USB_CLASS_PRINTER) {
                    Log.d(TAG, "Found USB printer interface")
                    return device
                }
                // Also check for CDC (serial) interfaces that might be printers
                if (iface.interfaceClass == UsbConstants.USB_CLASS_CDC_DATA ||
                    iface.interfaceClass == UsbConstants.USB_CLASS_COMM) {
                    Log.d(TAG, "Found potential serial printer interface")
                    return device
                }
            }
        }

        return null
    }

    /**
     * Check if printer is available (quick check)
     */
    fun isAvailable(): Boolean {
        return findUsbPrinter() != null
    }

    /**
     * Initialize printer connection
     */
    fun connect(): Boolean {
        val device = findUsbPrinter() ?: run {
            Log.e(TAG, "No USB printer found")
            return false
        }

        val manager = usbManager ?: return false

        // Check if we have permission
        if (!manager.hasPermission(device)) {
            Log.e(TAG, "No USB permission for device")
            return false
        }

        // Open connection
        val connection = manager.openDevice(device) ?: run {
            Log.e(TAG, "Failed to open USB device")
            return false
        }

        // Find printer interface and endpoint
        for (i in 0 until device.interfaceCount) {
            val iface = device.getInterface(i)

            // Look for bulk OUT endpoint (for sending data to printer)
            for (j in 0 until iface.endpointCount) {
                val endpoint = iface.getEndpoint(j)
                if (endpoint.type == UsbConstants.USB_ENDPOINT_XFER_BULK &&
                    endpoint.direction == UsbConstants.USB_DIR_OUT) {

                    // Claim interface
                    if (connection.claimInterface(iface, true)) {
                        usbDevice = device
                        usbConnection = connection
                        usbInterface = iface
                        usbEndpoint = endpoint
                        Log.d(TAG, "Printer connected successfully")
                        return true
                    }
                }
            }
        }

        Log.e(TAG, "Failed to find suitable endpoint")
        connection.close()
        return false
    }

    /**
     * Disconnect printer
     */
    fun disconnect() {
        usbInterface?.let { iface ->
            usbConnection?.releaseInterface(iface)
        }
        usbConnection?.close()
        usbDevice = null
        usbConnection = null
        usbInterface = null
        usbEndpoint = null
        Log.d(TAG, "Printer disconnected")
    }

    /**
     * Print raw ESC/POS data
     */
    fun printRaw(data: ByteArray): Boolean {
        // Try to connect if not connected
        if (usbConnection == null || usbEndpoint == null) {
            if (!connect()) {
                Log.e(TAG, "Cannot connect to printer")
                return false
            }
        }

        val connection = usbConnection ?: return false
        val endpoint = usbEndpoint ?: return false

        return try {
            // Send data in chunks (max 16384 bytes per transfer typically)
            val chunkSize = 4096
            var offset = 0

            while (offset < data.size) {
                val length = minOf(chunkSize, data.size - offset)
                val chunk = data.copyOfRange(offset, offset + length)

                val result = connection.bulkTransfer(endpoint, chunk, length, 5000)
                if (result < 0) {
                    Log.e(TAG, "Bulk transfer failed at offset $offset, result: $result")
                    return false
                }

                offset += length
            }

            Log.d(TAG, "Print data sent successfully (${data.size} bytes)")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Print failed: ${e.message}")
            false
        }
    }

    /**
     * Print test page
     */
    fun printTestPage(): Boolean {
        val testData = buildTestPageEscPos()
        return printRaw(testData)
    }

    /**
     * Build ESC/POS test page commands
     */
    private fun buildTestPageEscPos(): ByteArray {
        val commands = mutableListOf<Byte>()

        // Initialize printer
        commands.addAll(byteArrayOf(0x1B, 0x40).toList()) // ESC @

        // Center alignment
        commands.addAll(byteArrayOf(0x1B, 0x61, 0x01).toList()) // ESC a 1

        // Double size
        commands.addAll(byteArrayOf(0x1D, 0x21, 0x33).toList()) // GS ! 0x33

        // "TEST PRINT"
        commands.addAll("TEST PRINT".toByteArray().toList())
        commands.add(0x0A) // LF

        // Normal size
        commands.addAll(byteArrayOf(0x1D, 0x21, 0x00).toList()) // GS ! 0x00
        commands.add(0x0A)

        // "Printer is working!"
        commands.addAll("Printer is working!".toByteArray().toList())
        commands.add(0x0A)

        // Device info
        commands.add(0x0A)
        commands.addAll("Device: ${Build.MANUFACTURER} ${Build.MODEL}".toByteArray().toList())
        commands.add(0x0A)

        // Feed and cut
        commands.add(0x0A)
        commands.add(0x0A)
        commands.add(0x0A)
        commands.addAll(byteArrayOf(0x1D, 0x56, 0x00).toList()) // GS V 0 (full cut)

        return commands.toByteArray()
    }

    /**
     * Data class for printer detection result
     */
    data class PrinterDetectionResult(
        val available: Boolean,
        val type: String,
        val deviceName: String?,
        val vendorId: Int?,
        val productId: Int?,
        val manufacturer: String,
        val model: String
    )
}

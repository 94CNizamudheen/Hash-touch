
package com.hashone.hashtouch.printer

import android.content.Context
import android.hardware.usb.*

class UsbPrinterAdapter(context: Context) {

    private val builtin = BuiltinPrinter.getInstance(context)

    fun isAvailable(): Boolean {
        return builtin.detectPrinter().type == "usb_builtin"
    }

    fun print(data: ByteArray): PrintResult {
        return builtin.printRaw(data)
    }
}

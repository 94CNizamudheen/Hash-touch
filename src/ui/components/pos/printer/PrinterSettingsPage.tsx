import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/ui/shadcn/components/ui/button"
import { Plus, ArrowLeft, Bug, RefreshCw } from "lucide-react"
import { type Printer, printerService, type BuiltinPrinterDetection } from "@services/local/printer.local.service"
import { generateUUID } from "@/utils/uuid"
import PrinterStats from "./PrinterStats"
import PrinterList from "./PrinterList"
import PrinterFormModal from "./PrinterFormModal"
import { useTranslation } from "react-i18next"

export default function PrinterSettingsPage() {
  const navigate = useNavigate()
  const [printers, setPrinters] = useState<Printer[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Printer | null>(null)
  const { t } = useTranslation();

  // Debug state
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{
    bridgeAvailable: boolean;
    isAvailable: boolean;
    detection: BuiltinPrinterDetection | null;
    usbDevices: { count: number; devices: unknown[]; error?: string } | null;
    serialPorts: { count: number; ports: string[]; error?: string } | null;
    error: string | null;
  } | null>(null)

  const emptyPrinter: Printer = {
    id: generateUUID(),
    name: "",
    printer_type: "network",
    ip_address: "",
    port: 9100,
    is_active: false,
  }

  const loadPrinters = async () => {
    const list = await printerService.getAllPrinters()
    setPrinters(list)
  }

  const runDiagnostics = () => {
    try {
      const bridgeAvailable = typeof window !== "undefined" && !!window.BuiltinPrinter
      const isAvailable = printerService.isBuiltinPrinterAvailable()
      const detection = printerService.detectBuiltinPrinter()
      const usbDevices = printerService.listUsbDevices()
      const serialPorts = printerService.listSerialPorts()

      setDebugInfo({
        bridgeAvailable,
        isAvailable,
        detection,
        usbDevices,
        serialPorts,
        error: null
      })
    } catch (e) {
      setDebugInfo({
        bridgeAvailable: false,
        isAvailable: false,
        detection: null,
        usbDevices: null,
        serialPorts: null,
        error: e instanceof Error ? e.message : String(e)
      })
    }
  }

  const forceAddBuiltinPrinter = async () => {
    try {
      const builtinPrinter: Printer = {
        id: `builtin-${Date.now()}`,
        name: "Built-in Printer (Manual)",
        printer_type: "builtin",
        is_active: true,
      }
      await printerService.savePrinter(builtinPrinter)
      await loadPrinters()
      alert("Built-in printer added manually!")
    } catch (e) {
      alert("Failed to add: " + (e instanceof Error ? e.message : String(e)))
    }
  }

  useEffect(() => {
    (async () => {
      // Auto-detect and setup builtin printer if available (Android POS terminals)
      try {
        const result = await printerService.autoSetupBuiltinPrinter()
        console.log("Auto-setup result:", result)
      } catch (e) {
        console.log("Builtin printer auto-setup skipped:", e)
      }
      await loadPrinters()
    })()
  }, [])

  const openAddModal = () => {
    setEditing({ ...emptyPrinter, id: generateUUID() })
    setOpen(true)
  }

  const openEditModal = (printer: Printer) => {
    setEditing(printer)
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="h-screen flex flex-col p-4 sm:p-6 max-w-7xl mx-auto gap-4 sm:gap-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">
            {t("Printer Management")}
          </h1>
        </div>

        {/* Add button - visible on mobile in header */}
        <Button
          onClick={openAddModal}
          className="gap-2 btn-primary sm:hidden h-10"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t("Add")}</span>
        </Button>
      </div>

      {/* Debug Section */}
      <div className="flex flex-col flex-1 min-h-0 gap-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Built-in Printer Diagnostics
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={runDiagnostics} className="gap-1">
                <RefreshCw className="w-3 h-3" />
                Run Diagnostics
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDebug(!showDebug)}>
                {showDebug ? "Hide" : "Show"} Details
              </Button>
            </div>
          </div>

          {debugInfo && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${debugInfo.bridgeAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>JS Bridge (window.BuiltinPrinter): {debugInfo.bridgeAvailable ? 'Available' : 'NOT Available'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${debugInfo.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Printer Available: {debugInfo.isAvailable ? 'Yes' : 'No'}</span>
              </div>

              {showDebug && (
                <div className="mt-2 space-y-2">
                  {debugInfo.detection && (
                    <div>
                      <p className="text-xs font-semibold mb-1">Detection Result:</p>
                      <div className="p-2 bg-black/10 dark:bg-white/10 rounded text-xs font-mono overflow-auto max-h-32">
                        <pre>{JSON.stringify(debugInfo.detection, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  {debugInfo.usbDevices && (
                    <div>
                      <p className="text-xs font-semibold mb-1">
                        USB Devices Found: {debugInfo.usbDevices.count}
                      </p>
                      <div className="p-2 bg-black/10 dark:bg-white/10 rounded text-xs font-mono overflow-auto max-h-32">
                        <pre>{JSON.stringify(debugInfo.usbDevices, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  {debugInfo.serialPorts && (
                    <div>
                      <p className="text-xs font-semibold mb-1">
                        Serial Ports Found: {debugInfo.serialPorts.count}
                      </p>
                      <div className="p-2 bg-black/10 dark:bg-white/10 rounded text-xs font-mono overflow-auto max-h-32">
                        <pre>{JSON.stringify(debugInfo.serialPorts, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {debugInfo.error && (
                <div className="text-red-600 dark:text-red-400">
                  Error: {debugInfo.error}
                </div>
              )}

              {!debugInfo.bridgeAvailable && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300 text-xs">
                  <strong>Issue:</strong> The JavaScript bridge is not available. This means either:
                  <ul className="list-disc ml-4 mt-1">
                    <li>You're not running on Android</li>
                    <li>The PrinterBridge was not injected in MainActivity</li>
                    <li>The WebView hasn't loaded the bridge yet</li>
                  </ul>
                </div>
              )}

              {debugInfo.bridgeAvailable && !debugInfo.isAvailable && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-yellow-700 dark:text-yellow-300 text-xs">
                  <strong>Issue:</strong> Bridge available but no printer detected. This means:
                  <ul className="list-disc ml-4 mt-1">
                    <li>No USB printer hardware found on this device</li>
                    <li>The device may not have a built-in printer</li>
                    <li>USB device not recognized as a printer</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {!debugInfo && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Click "Run Diagnostics" to check built-in printer status
            </p>
          )}

          {/* Manual add button as fallback */}
          <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
            <Button size="sm" variant="secondary" onClick={forceAddBuiltinPrinter}>
              Force Add Built-in Printer (Manual)
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Use this if auto-detection fails but you know the device has a printer
            </p>
          </div>
        </div>

        {/* Stats */}
        <PrinterStats printers={printers} />

        {/* Printer List Section */}
        <div className="bg-secondary rounded-lg border border-border p-4 sm:p-6 flex flex-col min-h-0 flex-1">

          <div className="hidden sm:flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t("Printers")}</h2>
            <Button onClick={openAddModal} className="gap-2 btn-primary">
              <Plus className="w-4 h-4" />
              {t("Add New")}
            </Button>
          </div>

          <h2 className="text-base font-semibold mb-4 sm:hidden">{t("Printers")}</h2>

          {/* ONLY SCROLL AREA */}
          <div className="flex-1 overflow-y-auto -mx-4 px-4 sm:-mx-6 sm:px-6">
            <PrinterList
              printers={printers}
              reload={loadPrinters}
              onEdit={openEditModal}
            />
          </div>

        </div>

      </div>
      {/* Modal */}
      <PrinterFormModal
        open={open}
        editing={editing}
        onClose={closeModal}
        reload={loadPrinters}
      />
    </div>
  )
}

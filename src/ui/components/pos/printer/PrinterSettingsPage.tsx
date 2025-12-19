import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PrinterSetting } from "@db/types"
import { printerService } from "@core/services/printer.service"
import PrinterStats from "./PrinterStats"
import PrinterList from "./PrinterList"
import PrinterFormModal from "./PrinterFormModal"

export default function PrinterSettingsPage() {
  const [printers, setPrinters] = useState<PrinterSetting[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PrinterSetting | null>(null)

  const emptyPrinter: PrinterSetting = {
    id: 0,
    name: "",
    printer_type: "network",
    ip_address: "",
    port: 9100,
    is_active: 0,
  }

  const loadPrinters = async () => {
    const list = await printerService.listPrinters()
    setPrinters(list)
  }

  useEffect(() => {
    loadPrinters()
  }, [])

  const openAddModal = () => {
    setEditing(emptyPrinter)
    setOpen(true)
  }

  const openEditModal = (printer: PrinterSetting) => {
    setEditing(printer)
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <h1 className="text-3xl font-bold">Printer Management</h1>

      <PrinterStats printers={printers} />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border border-border p-6">

            {/* List Header WITH Add Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Printers</h2>

              <Button onClick={openAddModal} className="gap-2 btn-primary">
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            </div>

            <PrinterList
              printers={printers}
              reload={loadPrinters}
              onEdit={openEditModal}
            />
          </div>
        </div>

        {/* Right Column: Modal */}
        <div className="lg:col-span-1">
          <PrinterFormModal
            open={open}
            editing={editing}
            onClose={closeModal}
            reload={loadPrinters}
          />
        </div>
      </div>
    </div>
  )
}

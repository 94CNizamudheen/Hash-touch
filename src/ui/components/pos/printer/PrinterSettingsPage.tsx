import { useEffect, useState } from "react"
import { Button } from "@/ui/shadcn/components/ui/button"
import { Plus } from "lucide-react"
import { type Printer, printerService } from "@services/local/printer.local.service"
import PrinterStats from "./PrinterStats"
import PrinterList from "./PrinterList"
import PrinterFormModal from "./PrinterFormModal"
import { useTranslation } from "react-i18next"

export default function PrinterSettingsPage() {
  const [printers, setPrinters] = useState<Printer[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Printer | null>(null)
  const { t } = useTranslation();
  const emptyPrinter: Printer = {
    id: crypto.randomUUID(),
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

  useEffect(() => {
    (async () => {
      await loadPrinters()
    })()
  }, [])

  const openAddModal = () => {
    setEditing({ ...emptyPrinter, id: crypto.randomUUID() })
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <h1 className="text-3xl font-bold">
        {t("Printer Management")}
      </h1>

      <PrinterStats printers={printers} />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2">
          <div className="bg-secondary rounded-lg border border-border p-6">

            {/* List Header WITH Add Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{t("Printers")}</h2>

              <Button onClick={openAddModal} className="gap-2 btn-primary">
                <Plus className="w-4 h-4" />
                {t("Add New")}
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

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/ui/shadcn/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import { type Printer, printerService } from "@services/local/printer.local.service"
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
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

      {/* Stats */}
      <PrinterStats printers={printers} />

      {/* Printer List Section */}
      <div className="bg-secondary rounded-lg border border-border p-4 sm:p-6">
        {/* List Header WITH Add Button - hidden on mobile */}
        <div className="hidden sm:flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t("Printers")}</h2>
          <Button onClick={openAddModal} className="gap-2 btn-primary">
            <Plus className="w-4 h-4" />
            {t("Add New")}
          </Button>
        </div>

        {/* Mobile section header */}
        <h2 className="text-base font-semibold mb-4 sm:hidden">{t("Printers")}</h2>

        <PrinterList
          printers={printers}
          reload={loadPrinters}
          onEdit={openEditModal}
        />
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

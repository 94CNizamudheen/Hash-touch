import { Button } from "@/ui/shadcn/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/ui/shadcn/components/ui/card"
import { Switch } from "@/ui/shadcn/components/ui/switch"
import { printerService, type Printer as PrinterType } from "@services/local/printer.local.service"
import { Printer, Trash2, Pencil } from "lucide-react"

interface Props {
  printer: PrinterType
  reload: () => void
  onEdit: (p: PrinterType) => void
}

export default function PrinterItem({ printer, reload, onEdit }: Props) {
  const isActive = printer.is_active

  const toggleActive = async (val: boolean) => {
    await printerService.setPrinterActive(printer.id, val)
    reload()
  }

  const deletePrinter = async () => {
    if (!confirm("Delete this printer?")) return
    await printerService.deletePrinter(printer.id)
    reload()
  }

  const testPrinter = async () => {
    try {
      await printerService.testPrinter(printer)
      alert("Test printed!")
    } catch (error) {
      alert("Print failed: " + error)
    }
  }

  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow bg-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base sm:text-sm truncate">
              {printer.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {printer.printer_type === "network"
                ? `${printer.ip_address}:${printer.port}`
                : "USB Printer"}
            </p>
          </div>

          {/* Status badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Switch
            checked={isActive}
            onCheckedChange={toggleActive}
            className={isActive ? "bg-primary" : "bg-destructive"}
          />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={testPrinter}
          className="flex-1 sm:flex-none h-10 sm:h-9 min-w-[80px]"
        >
          <Printer className="h-4 w-4 mr-1.5" />
          <span>Test</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(printer)}
          className="flex-1 sm:flex-none h-10 sm:h-9 min-w-[80px]"
        >
          <Pencil className="h-4 w-4 mr-1.5" />
          <span>Edit</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={deletePrinter}
          className="h-10 sm:h-9 px-3"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

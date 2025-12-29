
import { Button } from "@/ui/shadcn/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/ui/shadcn/components/ui/card"
import { Switch } from "@/ui/shadcn/components/ui/switch"

import {  printerService, type Printer as PrinterType } from "@services/local/printer.local.service"
import { Printer, Trash2 } from "lucide-react"

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
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow bg-navigation-foreground ">

      <CardHeader className="pb-2">

        <div className="inline-block px-3 py-1 rounded-lg  border border-border shadow-sm">
          <h3 className="font-semibold text-background tracking-wide text-sm">
            {printer.name}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          {printer.printer_type === "network"
            ? `${printer.ip_address}:${printer.port}`
            : "USB Printer"}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mt-3">
          <Switch
            checked={isActive}
            onCheckedChange={toggleActive}
            className={isActive ? "bg-primary" : "bg-destructive"}
          />

          <span
            className={`text-sm font-medium ${
              isActive ? "text-green-600 dark:text-green-400" : "text-destructive"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={testPrinter}>
          <Printer className="h-4 w-4 mr-1" /> Test
        </Button>

        <Button variant="secondary" size="sm" onClick={() => onEdit(printer)}>
          Edit
        </Button>

        <Button variant="destructive" size="sm" onClick={deletePrinter}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

import { type Printer } from "@services/local/printer.local.service";
import PrinterItem from "./PrinterItem";

interface Props {
  printers: Printer[]
  reload: () => void
  onEdit: (p: Printer) => void
}

export default function PrinterList({ printers, reload, onEdit }: Props) {
  if (printers.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-muted-foreground">
        <p className="text-sm sm:text-base">No printers configured yet.</p>
        <p className="text-xs sm:text-sm mt-1">Add one to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 ">
      {printers.map((p) => (
        <PrinterItem
          key={p.id}
          printer={p}
          reload={reload}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

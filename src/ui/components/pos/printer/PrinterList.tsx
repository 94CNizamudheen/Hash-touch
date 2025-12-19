import { PrinterSetting } from "@db/types";
import PrinterItem from "./PrinterItem";


interface Props {
  printers: PrinterSetting[]
  reload: () => void
  onEdit: (p: PrinterSetting) => void
}

export default function PrinterList({ printers, reload, onEdit }: Props) {
  if (printers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No printers configured yet. Add one to get started.</div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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


// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"
// import { Button } from "@/components/ui/button"

// import { useState, useEffect } from "react"
// import { PrinterSetting } from "@db/types"
// import { printerService } from "@core/services/printer.service"

// interface Props {
//     open: boolean
//     editing: PrinterSetting | null
//     onClose: () => void
//     reload: () => void
// }

// export default function PrinterFormModal({ open, editing, onClose, reload }: Props) {
//     const [form, setForm] = useState<PrinterSetting | null>(null)

//     useEffect(() => {
//         if (editing) setForm({ ...editing })
//     }, [editing])

//     if (!form) return null

//     const update = (patch: Partial<PrinterSetting>) => setForm({ ...form, ...patch })

//     const save = async () => {
//         if (form.id === 0) {
//             await printerService.createPrinter(form)
//         } else {
//             await printerService.updatePrinter(form)
//         }
//         reload()
//         onClose()
//     }

//     return (
//         <Dialog open={open} onOpenChange={onClose}>
//             <DialogContent className="space-y-4">
//                 <DialogHeader>
//                     <DialogTitle>{form.id === 0 ? "Add New Printer" : "Edit Printer"}</DialogTitle>
//                 </DialogHeader>

//                 {/* Printer Name */}
//                 <div className="space-y-2">
//                     <label className="text-sm font-medium">Printer Name</label>
//                     <Input
//                         placeholder="e.g., Office Printer 1"
//                         value={form.name}
//                         onChange={(e) => update({ name: e.target.value })}
//                     />
//                 </div>

//                 {/* IP Address */}
//                 <div className="space-y-2">
//                     <label className="text-sm font-medium">IP Address</label>
//                     <Input
//                         placeholder="192.168.1.100"
//                         value={form.ip_address || ""}
//                         onChange={(e) => update({ ip_address: e.target.value })}
//                     />
//                 </div>

//                 {/* Port */}
//                 <div className="space-y-2">
//                     <label className="text-sm font-medium">Port</label>
//                     <Input
//                         placeholder="9100"
//                         type="number"
//                         value={form.port || 9100}
//                         onChange={(e) => update({ port: Number(e.target.value) })}
//                     />
//                 </div>

//                 {/* Active Status */}
//                 <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
//                     <div className="flex items-center gap-3">
//                         <Switch
//                             checked={form.is_active === 1}
//                             onCheckedChange={(v) => update({ is_active: v ? 1 : 0 })}
//                             className={form.is_active === 1 ? "bg-primary" : "bg-destructive"}
//                         />
//                         <span className={form.is_active === 1 ? "text-primary" : "text-destructive"}>
//                             {form.is_active === 1 ? "Active" : "Inactive"}
//                         </span>
//                     </div>
//                 </div>

//                 <DialogFooter>
//                     <Button variant="outline" onClick={onClose}>
//                         Cancel
//                     </Button>
//                     <Button onClick={save}>{form.id === 0 ? "Add Printer" : "Update Printer"}</Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     )
// }

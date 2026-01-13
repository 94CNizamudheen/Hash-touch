import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/shadcn/components/ui/dialog"
import { useState, useEffect, useTransition } from "react"
import { type Printer, printerService } from "@services/local/printer.local.service"
import { Input } from "@/ui/shadcn/components/ui/input"
import { Button } from "@/ui/shadcn/components/ui/button"
import { Switch } from "@/ui/shadcn/components/ui/switch"


interface Props {
    open: boolean
    editing: Printer | null
    onClose: () => void
    reload: () => void
}

export default function PrinterFormModal({ open, editing, onClose, reload }: Props) {
    const [form, setForm] = useState<Printer | null>(null)
    const [isNew, setIsNew] = useState(false)
    const [, startTransition] = useTransition()

    useEffect(() => {
        if (editing) {
            startTransition(() => {
                setForm({ ...editing })
                setIsNew(!editing.created_at)
            })
        }
    }, [editing])

    if (!form) return null

    const update = (patch: Partial<Printer>) => setForm({ ...form, ...patch })

    const save = async () => {
        await printerService.savePrinter(form)
        reload()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-lg mx-auto sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg sm:text-xl">
                            {form.id === "0" ? "Add New Printer" : "Edit Printer"}
                        </DialogTitle>
               
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Printer Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Printer Name</label>
                        <Input
                            placeholder="e.g., Office Printer 1"
                            value={form.name}
                            onChange={(e) => update({ name: e.target.value })}
                            className="h-11 sm:h-10 text-base sm:text-sm"
                        />
                    </div>

                    {/* IP Address */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">IP Address</label>
                        <Input
                            placeholder="192.168.1.100"
                            value={form.ip_address || ""}
                            onChange={(e) => update({ ip_address: e.target.value })}
                            className="h-11 sm:h-10 text-base sm:text-sm"
                            inputMode="decimal"
                        />
                    </div>

                    {/* Port */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Port</label>
                        <Input
                            placeholder="9100"
                            type="number"
                            value={form.port || 9100}
                            onChange={(e) => update({ port: Number(e.target.value) })}
                            className="h-11 sm:h-10 text-base sm:text-sm"
                            inputMode="numeric"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Status</span>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${form.is_active ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                                {form.is_active ? "Active" : "Inactive"}
                            </span>
                            <Switch
                                checked={form.is_active}
                                onCheckedChange={(v) => update({ is_active: v })}
                                className={form.is_active ? "bg-primary" : "bg-destructive"}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto h-11 sm:h-10 order-2 sm:order-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={save}
                        className="w-full sm:w-auto h-11 sm:h-10 order-1 sm:order-2"
                    >
                        {isNew ? "Add Printer" : "Update Printer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

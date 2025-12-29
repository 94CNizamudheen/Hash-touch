
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
            <DialogContent className="space-y-4">
                <DialogHeader>
                    <DialogTitle>{form.id === "0" ? "Add New Printer" : "Edit Printer"}</DialogTitle>
                </DialogHeader>

                {/* Printer Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Printer Name</label>
                    <Input
                        placeholder="e.g., Office Printer 1"
                        value={form.name}
                        onChange={(e) => update({ name: e.target.value })}
                    />
                </div>

                {/* IP Address */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">IP Address</label>
                    <Input
                        placeholder="192.168.1.100"
                        value={form.ip_address || ""}
                        onChange={(e) => update({ ip_address: e.target.value })}
                    />
                </div>

                {/* Port */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Port</label>
                    <Input
                        placeholder="9100"
                        type="number"
                        value={form.port || 9100}
                        onChange={(e) => update({ port: Number(e.target.value) })}
                    />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={form.is_active}
                            onCheckedChange={(v) => update({ is_active: v })}
                            className={form.is_active ? "bg-primary" : "bg-destructive"}
                        />
                        <span className={form.is_active ? "text-primary" : "text-destructive"}>
                            {form.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={save}>{isNew ? "Add Printer" : "Update Printer"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

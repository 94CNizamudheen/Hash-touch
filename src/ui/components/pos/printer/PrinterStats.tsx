import type { Printer } from "@services/local/printer.local.service"
import { Card } from "@/ui/shadcn/components/ui/card"

interface Props {
  printers: Printer[]
}

export default function PrinterStats({ printers }: Props) {
  const activeCount = printers.filter((p) => p.is_active).length
  const inactiveCount = printers.filter((p) => !p.is_active).length
  const totalCount = printers.length

  const stats = [
    { label: "Active", value: activeCount, color: "text-green-600 dark:text-green-400" },
    { label: "Inactive", value: inactiveCount, color: "text-destructive" },
    { label: "Total", value: totalCount, color: "text-primary" },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-3 sm:p-4 bg-secondary border-border">
          <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
          <p className={`text-xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
        </Card>
      ))}
    </div>
  )
}

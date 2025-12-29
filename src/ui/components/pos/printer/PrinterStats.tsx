

// import type { PrinterSetting } from "@db/types"
// import { Card } from "@/components/ui/card"

// interface Props {
//   printers: PrinterSetting[]
// }

// export default function PrinterStats({ printers }: Props) {
//   const activeCount = printers.filter((p) => p.is_active === 1).length
//   const inactiveCount = printers.filter((p) => p.is_active === 0).length
//   const totalCount = printers.length

//   const stats = [
//     { label: "Active", value: activeCount, color: "text-green-600 dark:text-green-400" },
//     { label: "Inactive", value: inactiveCount, color: "text-destructive" },
//     { label: "Total", value: totalCount, color: "text-primary" },
//   ]

//   return (
//     <div className="grid grid-cols-3 gap-4">
//       {stats.map((stat) => (
//         <Card key={stat.label} className="p-4 bg-card border-border">
//           <p className="text-sm text-muted-foreground">{stat.label}</p>
//           <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
//         </Card>
//       ))}
//     </div>
//   )
// }

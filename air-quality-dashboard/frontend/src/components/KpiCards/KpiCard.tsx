interface KpiCardProps {
  label: string
  value: number | null | undefined
  unit: string
  colorClass: string
  textClass: string
  bandLabel: string
}

export default function KpiCard({
  label,
  value,
  unit,
  colorClass,
  textClass,
  bandLabel,
}: KpiCardProps) {
  return (
    <div className={`rounded-lg p-4 shadow flex flex-col gap-1 ${colorClass}`}>
      <span className={`text-xs font-semibold uppercase tracking-wide opacity-80 ${textClass}`}>
        {label}
      </span>
      <span className={`text-2xl font-bold ${textClass}`}>
        {value != null ? value.toFixed(1) : '—'}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </span>
      <span className={`text-xs ${textClass} opacity-70`}>{bandLabel}</span>
    </div>
  )
}

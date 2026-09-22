import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
           | 'normal' | 'perhatian' | 'peringatan' | 'teguran'
           | 'ringan' | 'sedang' | 'berat' | 'sangat_berat'
           | 'gold' | 'tercatat'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantClasses: Record<string, string> = {
    // Generic
    default:      'bg-[rgba(217,164,65,0.1)] text-[#D9A441] border border-[rgba(217,164,65,0.2)]',
    success:      'bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.18)]',
    warning:      'bg-[rgba(217,164,65,0.1)] text-[#D9A441] border border-[rgba(217,164,65,0.2)]',
    danger:       'bg-[rgba(239,68,68,0.1)] text-[#f87171] border border-[rgba(239,68,68,0.18)]',
    info:         'bg-[rgba(91,122,157,0.12)] text-[#7aa5cc] border border-[rgba(91,122,157,0.2)]',
    outline:      'border border-[rgba(255,255,255,0.1)] text-[#91A4BD]',
    // Status siswa
    normal:       'bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.18)]',
    perhatian:    'bg-[rgba(217,164,65,0.1)] text-[#D9A441] border border-[rgba(217,164,65,0.2)]',
    peringatan:   'bg-[rgba(249,115,22,0.1)] text-[#fb923c] border border-[rgba(249,115,22,0.2)]',
    teguran:      'bg-[rgba(239,68,68,0.1)] text-[#f87171] border border-[rgba(239,68,68,0.18)]',
    // Tingkat pelanggaran
    ringan:       'bg-[rgba(91,122,157,0.12)] text-[#7aa5cc] border border-[rgba(91,122,157,0.2)]',
    sedang:       'bg-[rgba(217,164,65,0.1)] text-[#D9A441] border border-[rgba(217,164,65,0.2)]',
    berat:        'bg-[rgba(249,115,22,0.1)] text-[#fb923c] border border-[rgba(249,115,22,0.2)]',
    sangat_berat: 'bg-[rgba(239,68,68,0.1)] text-[#f87171] border border-[rgba(239,68,68,0.18)]',
    // Misc
    gold:         'bg-[rgba(217,164,65,0.1)] text-[#D9A441] border border-[rgba(217,164,65,0.2)]',
    tercatat:     'bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.18)]',
  }

  return (
    <span
      className={cn(
        "badge",
        `badge-${variant}`,
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide",
        variantClasses[variant] ?? variantClasses.default,
        className
      )}
      {...props}
    />
  )
}

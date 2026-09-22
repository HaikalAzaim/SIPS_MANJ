import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatTime(time: string): string {
  return time
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
}

export function generateNomorSurat(prefix: string, count: number, year: number): string {
  const num = String(count).padStart(4, '0')
  return `${num}/${prefix}/SIPS/${year}`
}

export function getStatusFromPoin(
  totalPoin: number,
  thresholds?: { namaStatus: string; minimumPoin: number; maximumPoin: number | null; warna: string }[]
): { status: string; warna: string } {
  if (!thresholds || !Array.isArray(thresholds)) {
    return { status: 'Normal', warna: '#22c55e' }
  }
  for (let i = thresholds.length - 1; i >= 0; i--) {
    const t = thresholds[i]
    if (totalPoin >= t.minimumPoin) {
      return { status: t.namaStatus, warna: t.warna }
    }
  }
  return { status: 'Normal', warna: '#22c55e' }
}


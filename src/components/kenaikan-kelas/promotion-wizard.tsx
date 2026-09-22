"use client"

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PreparationStep } from './steps/preparation-step'
import { ClassMappingStep } from './steps/class-mapping-step'
import { StudentVerificationStep } from './steps/student-verification-step'
import { ConfirmationStep } from './steps/confirmation-step'

interface PromotionWizardProps {
  tahunAjaranList: any[]
  existingProcessId?: string | null
}

const STEPS = [
  { number: 1, label: 'Persiapan', desc: 'Pilih tahun ajaran' },
  { number: 2, label: 'Pemetaan Kelas', desc: 'Tentukan kelas tujuan' },
  { number: 3, label: 'Verifikasi Siswa', desc: 'Periksa data siswa' },
  { number: 4, label: 'Konfirmasi', desc: 'Review & proses' },
]

export function PromotionWizard({ tahunAjaranList, existingProcessId }: PromotionWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(existingProcessId ? 2 : 1)
  const [processId, setProcessId] = useState<string | null>(existingProcessId || null)
  const [processData, setProcessData] = useState<any>(null)

  const handleProcessCreated = useCallback((id: string, data?: any) => {
    setProcessId(id)
    setProcessData(data)
    setCurrentStep(2)
  }, [])

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }, [])

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  const handleComplete = useCallback(() => {
    router.push('/kenaikan-kelas')
    router.refresh()
  }, [router])

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mb-8">
        {STEPS.map((step, i) => {
          const isActive = currentStep === step.number
          const isCompleted = currentStep > step.number
          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300 border-2",
                    isCompleted
                      ? "bg-[#D9A441] border-[#D9A441] text-[#07111F]"
                      : isActive
                        ? "bg-[rgba(217,164,65,0.15)] border-[#D9A441] text-[#D9A441]"
                        : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                  )}
                >
                  {isCompleted ? <Check size={18} /> : step.number}
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-[12px] font-semibold",
                    isActive || isCompleted ? "text-[var(--foreground)]" : "text-[var(--text-muted)]"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-[#4a5c73] hidden sm:block">{step.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 mt-[-24px] rounded transition-colors duration-300",
                  currentStep > step.number
                    ? "bg-[#D9A441]"
                    : "bg-[rgba(255,255,255,0.07)]"
                )} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <PreparationStep
            tahunAjaranList={tahunAjaranList}
            onProcessCreated={handleProcessCreated}
            onCancel={() => router.push('/kenaikan-kelas')}
          />
        )}
        {currentStep === 2 && processId && (
          <ClassMappingStep
            processId={processId}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && processId && (
          <StudentVerificationStep
            processId={processId}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && processId && (
          <ConfirmationStep
            processId={processId}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  )
}

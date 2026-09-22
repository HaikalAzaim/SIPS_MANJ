"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { StudentAcademicHistory } from './student-academic-history'

interface SiswaDetailTabsProps {
  pelanggaran: any[]
  academicHistory: any[]
}

export function SiswaDetailTabs({ pelanggaran, academicHistory }: SiswaDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<'pelanggaran' | 'riwayat-kelas'>('pelanggaran')

  const tabs = [
    { key: 'pelanggaran', label: `Riwayat Pelanggaran (${pelanggaran.length})` },
    { key: 'riwayat-kelas', label: `Riwayat Kelas (${academicHistory.length})` },
  ] as const

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex border-b border-[rgba(255,255,255,0.07)]">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 cursor-pointer ${
                activeTab === tab.key
                  ? 'text-[#D9A441] border-[#D9A441]'
                  : 'text-[#64748B] border-transparent hover:text-[#8FA4BD]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'pelanggaran' && (
          <div className="table-wrapper">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '3.5rem' }}>No</th>
                    <th style={{ width: '8.5rem' }}>Tanggal</th>
                    <th style={{ width: '5.5rem' }}>Waktu</th>
                    <th>Pelanggaran</th>
                    <th style={{ width: '7.5rem' }}>Kategori</th>
                    <th style={{ width: '5rem' }} className="td-center">Poin</th>
                    <th style={{ width: '10rem' }}>Dicatat Oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {pelanggaran.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-[#64748B]">Belum ada pelanggaran</td>
                    </tr>
                  ) : (
                    pelanggaran.map((p, i) => (
                      <tr key={p.id}>
                        <td className="td-mono">{i + 1}</td>
                        <td className="whitespace-nowrap text-[#8FA4BD] text-[12px]">{formatDate(p.tanggal)}</td>
                        <td className="td-mono text-[12px] text-[#8FA4BD]">{p.waktu}</td>
                        <td className="td-primary font-medium">{p.kategoriPelanggaran.nama}</td>
                        <td>
                          <Badge variant={
                            p.kategoriPelanggaran.tingkat === 'RINGAN' ? 'info' :
                            p.kategoriPelanggaran.tingkat === 'SEDANG' ? 'warning' :
                            p.kategoriPelanggaran.tingkat === 'BERAT' ? 'danger' : 'danger'
                          }>
                            {p.kategoriPelanggaran.tingkat}
                          </Badge>
                        </td>
                        <td className="td-center font-bold text-[#D9A62E]">{p.poin}</td>
                        <td className="td-muted text-[12px]">{p.dicatatOleh.name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'riwayat-kelas' && (
          <StudentAcademicHistory records={academicHistory} />
        )}
      </CardContent>
    </Card>
  )
}

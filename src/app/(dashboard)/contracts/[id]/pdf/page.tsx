'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function ContractPdfPage() {
  const { id } = useParams<{ id: string }>()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    setPdfUrl(`/api/contracts/${id}/pdf`)
  }, [id])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/contracts"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a contratos
        </Link>

        <a
          href={`/api/contracts/${id}/pdf`}
          download
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Descargar PDF
        </a>
      </div>

      {pdfUrl && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="Vista previa del contrato"
          />
        </div>
      )}
    </div>
  )
}

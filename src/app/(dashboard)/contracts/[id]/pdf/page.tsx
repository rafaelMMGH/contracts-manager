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
          href="/"
          className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al inicio
        </Link>

        <a
          href={`/api/contracts/${id}/pdf`}
          download
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Descargar PDF
        </a>
      </div>

      {pdfUrl && (
        <div
          className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
          style={{ height: 'calc(100vh - 160px)' }}
        >
          <iframe
            src={pdfUrl}
            className="h-full w-full"
            title="Vista previa del contrato"
          />
        </div>
      )}
    </div>
  )
}

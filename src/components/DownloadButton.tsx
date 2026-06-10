import { useState, useRef, useEffect } from 'react'
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DownloadPayload, Format } from '@/services/downloadService'
import { toast } from 'sonner'

interface DownloadButtonProps {
  payload: DownloadPayload
}

export function DownloadButton({ payload }: DownloadButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<Format | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDownload = async (format: Format) => {
    setLoading(format)
    setOpen(false)
    try {
      const { downloadFile } = await import('@/services/downloadService')
      await downloadFile(payload, format)
      toast.success(`Descargado en formato ${format.toUpperCase()}`)
    } catch {
      toast.error('Error al descargar el archivo')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={!!loading}
        className="gap-2"
      >
        <Download size={16} />
        {loading ? `Descargando ${loading.toUpperCase()}...` : 'Descargar'}
        <ChevronDown size={14} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-outline bg-surface-bright p-1 shadow-md animate-in fade-in zoom-in-95">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={loading === 'pdf'}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-on-surface transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50 cursor-pointer"
          >
            <FileText size={16} />
            PDF
          </button>
          <button
            onClick={() => handleDownload('excel')}
            disabled={loading === 'excel'}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-on-surface transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
      )}
    </div>
  )
}

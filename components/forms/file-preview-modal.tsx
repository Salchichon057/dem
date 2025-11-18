'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface FilePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string
  fileName: string
}

export default function FilePreviewModal({
  open,
  onOpenChange,
  fileUrl,
  fileName,
}: FilePreviewModalProps) {
  const fullUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${fileUrl}`
  
  // Detectar tipo de archivo por extensión
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)
  const isPDF = fileExtension === 'pdf'

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fullUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate flex-1">{fileName}</span>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Descargar archivo"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fullUrl, '_blank')}
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isImage ? (
            <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
              <Image
                src={fullUrl}
                alt={fileName}
                width={800}
                height={600}
                className="object-contain max-h-[70vh]"
                unoptimized
              />
            </div>
          ) : isPDF ? (
            <div className="w-full bg-gray-50 rounded-lg overflow-hidden">
              <iframe
                src={fullUrl}
                className="w-full h-[70vh]"
                title={fileName}
              />
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground mb-4">
                Vista previa no disponible para este tipo de archivo
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Tipo de archivo: {fileExtension.toUpperCase()}
              </p>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Descargar archivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

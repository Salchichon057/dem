'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface PhotoPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  photoUrl: string
  beneficiaryName: string
}

export default function PhotoPreviewModal({
  open,
  onOpenChange,
  photoUrl,
  beneficiaryName,
}: PhotoPreviewModalProps) {
  const handleDownload = () => {
    window.open(photoUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Foto de {beneficiaryName}</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full aspect-square max-h-[70vh] rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={photoUrl}
            alt={`Foto de ${beneficiaryName}`}
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir en nueva pestaña
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

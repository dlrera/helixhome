'use client'

import { useCallback, useState } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  type: 'image' | 'manual'
  onUploadComplete: (fileOrUrl: File | string) => void
  currentFileUrl?: string
  disabled?: boolean
  className?: string
}

export function FileUpload({
  type,
  onUploadComplete,
  currentFileUrl,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentFileUrl || null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const acceptedTypes =
    type === 'image'
      ? 'image/jpeg,image/jpg,image/png,image/webp'
      : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  const maxSize = 4 // MB - Vercel Hobby tier has ~4.5MB request body limit

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`)
        return
      }

      // Set preview for images
      if (type === 'image') {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFileName(file.name)
      }

      // Note: Actual upload will happen when the form is submitted
      // Store the file for later upload
      onUploadComplete(file)
    },
    [type, maxSize, onUploadComplete]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleRemove = useCallback(() => {
    setPreview(null)
    setFileName(null)
    setError(null)
    onUploadComplete('')
  }, [onUploadComplete])

  return (
    <div className={cn('space-y-2', className)}>
      {preview && type === 'image' ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : fileName && type === 'manual' ? (
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">{fileName}</span>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'cursor-pointer hover:border-primary'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            !disabled && document.getElementById(`file-input-${type}`)?.click()
          }
        >
          <input
            id={`file-input-${type}`}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span>{' '}
              or drag and drop
            </div>
            <div className="text-xs text-muted-foreground">
              {type === 'image'
                ? 'PNG, JPG, WebP up to 4MB'
                : 'PDF, DOC, DOCX up to 4MB'}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

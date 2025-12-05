import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2, Info, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/magicui/border-beam'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import type { Batch } from '@/types'

interface UploadCSVProps {
  apiUrl: string
  onSuccess: (batch: Batch) => void
}

export default function UploadCSV({ apiUrl, onSuccess }: UploadCSVProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Batch | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Por favor, selecione um arquivo CSV')
        setFile(null)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile)
      setError(null)
    } else {
      setError('Por favor, solte um arquivo CSV')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Por favor, selecione um arquivo')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer upload')
      }

      setSuccess(data)
      onSuccess(data)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop Zone */}
        <Card className="relative overflow-hidden">
          {isDragging && <BorderBeam size={300} duration={10} />}
          <CardContent className="p-0">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center px-6 py-16",
                "border-2 border-dashed rounded-xl transition-all duration-300",
                isDragging 
                  ? "border-orange-500 bg-orange-500/5" 
                  : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30",
                file && "border-emerald-500/50 bg-emerald-500/5"
              )}
            >
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    y: isDragging ? -5 : 0,
                    scale: isDragging ? 1.1 : 1 
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={cn(
                    "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors",
                    isDragging 
                      ? "bg-orange-500/20" 
                      : file 
                        ? "bg-emerald-500/20" 
                        : "bg-zinc-800"
                  )}>
                    <Upload className={cn(
                      "w-8 h-8 transition-colors",
                      isDragging 
                        ? "text-orange-400" 
                        : file 
                          ? "text-emerald-400" 
                          : "text-zinc-400"
                    )} />
                  </div>
                </motion.div>

                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  {file ? 'Arquivo selecionado' : 'Arraste e solte seu arquivo CSV'}
                </h3>
                <p className="text-sm text-zinc-500 mb-6">ou</p>
                
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" className="pointer-events-none">
                    <File className="w-4 h-4 mr-2" />
                    Selecionar arquivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                
                <p className="text-xs text-zinc-500 mt-4">
                  CSV até 5MB • Máximo 200 leads
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
        
        {/* Selected File */}
        <AnimatePresence mode="wait">
          {file && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <File className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{file.name}</p>
                        <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="text-zinc-400 hover:text-zinc-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-rose-500/30 bg-rose-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-rose-300">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
                <BorderBeam size={200} duration={12} colorFrom="#10b981" colorTo="#34d399" />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-emerald-300 mb-2">{success.message}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">Batch ID:</span>
                          <code className="px-2 py-0.5 bg-zinc-800 rounded text-emerald-400 text-xs">
                            {success.batchId}
                          </code>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400">Total:</span>
                            <Badge variant="success">{success.totalLeads} leads</Badge>
                          </div>
                          {success.leadsInvalidos > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-400">Inválidos:</span>
                              <Badge variant="warning">{success.leadsInvalidos}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <ShimmerButton
          type="submit"
          disabled={!file || loading}
          className={cn(
            "w-full",
            (!file || loading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Enviar para Processamento</span>
            </>
          )}
        </ShimmerButton>
      </form>

      {/* Info Card */}
      <Card className="bg-zinc-900/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <h3 className="font-semibold text-zinc-100">Formato do CSV</h3>
          </div>
          <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
            <code className="text-zinc-400">
              <span className="text-orange-400">nome</span>,<span className="text-orange-400">email</span>,<span className="text-zinc-500">empresa</span>{'\n'}
              João Silva,joao@example.com,Empresa A{'\n'}
              Maria Santos,maria@example.com,
            </code>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">nome (obrigatório)</Badge>
            <Badge variant="secondary">email (obrigatório)</Badge>
            <Badge variant="outline">empresa (opcional)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

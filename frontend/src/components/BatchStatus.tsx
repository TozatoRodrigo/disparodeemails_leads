import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, Loader2, FileText, RefreshCw, Users, Mail, TrendingUp, Pause, Play } from 'lucide-react'
import { authFetch } from '@/hooks/useAuthFetch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BorderBeam } from '@/components/magicui/border-beam'
import { NumberTicker } from '@/components/magicui/number-ticker'
import type { BatchStatus as BatchStatusType } from '@/types'

interface BatchStatusProps {
  apiUrl: string
  batchId: string | null
  refreshKey: number
}

const AUTO_REFRESH_INTERVAL = 5000 // 5 segundos

export default function BatchStatus({ apiUrl, batchId, refreshKey }: BatchStatusProps) {
  const [status, setStatus] = useState<BatchStatusType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputBatchId, setInputBatchId] = useState(batchId || '')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL / 1000)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Função de fetch memoizada
  const fetchStatus = useCallback(async (id: string, isAutoRefresh = false) => {
    if (!id.trim()) {
      setError('Por favor, informe o Batch ID')
      return
    }

    if (!isAutoRefresh) setLoading(true)
    setError(null)

    try {
      const response = await authFetch(`${apiUrl}/api/upload/status/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar status')
      }

      setStatus(data)
      
      // Se completou ou erro, para o auto-refresh
      if (data.status === 'completed' || data.status === 'error') {
        setAutoRefresh(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar status')
      setStatus(null)
    } finally {
      if (!isAutoRefresh) setLoading(false)
    }
  }, [apiUrl])

  // Efeito para buscar status inicial
  useEffect(() => {
    if (batchId) {
      setInputBatchId(batchId)
      setAutoRefresh(true) // Ativa auto-refresh quando novo batch
      fetchStatus(batchId)
    }
  }, [batchId, refreshKey, fetchStatus])

  // Efeito para auto-refresh durante processamento
  useEffect(() => {
    // Limpa intervalos anteriores
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    if (autoRefresh && inputBatchId && status?.status === 'processing') {
      // Reset countdown
      setCountdown(AUTO_REFRESH_INTERVAL / 1000)

      // Countdown visual
      countdownRef.current = setInterval(() => {
        setCountdown(prev => (prev > 1 ? prev - 1 : AUTO_REFRESH_INTERVAL / 1000))
      }, 1000)

      // Auto-refresh
      intervalRef.current = setInterval(() => {
        fetchStatus(inputBatchId, true)
      }, AUTO_REFRESH_INTERVAL)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [autoRefresh, inputBatchId, status?.status, fetchStatus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAutoRefresh(true) // Ativa auto-refresh ao buscar manualmente
    fetchStatus(inputBatchId)
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          icon: CheckCircle2,
          label: 'Concluído',
          variant: 'success' as const,
        }
      case 'processing':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          icon: Clock,
          label: 'Processando',
          variant: 'processing' as const,
        }
      case 'error':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          icon: XCircle,
          label: 'Erro',
          variant: 'destructive' as const,
        }
      default:
        return {
          bg: 'bg-zinc-500/10',
          border: 'border-zinc-500/30',
          text: 'text-zinc-400',
          icon: Clock,
          label: 'Pendente',
          variant: 'secondary' as const,
        }
    }
  }

  const calculateProgress = () => {
    if (!status) return 0
    const total = status.totalLeads
    const processed = status.sucessos + (status.erros?.length || 0)
    return Math.round((processed / total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="text"
                value={inputBatchId}
                onChange={(e) => setInputBatchId(e.target.value)}
                placeholder="Cole o Batch ID aqui..."
                className="pl-10"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !inputBatchId.trim()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

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

      {/* Status Display */}
      <AnimatePresence mode="wait">
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Main Status Card */}
            <Card className="relative overflow-hidden">
              {status.status === 'processing' && (
                <BorderBeam size={250} duration={8} colorFrom="#3b82f6" colorTo="#60a5fa" />
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{status.filename}</CardTitle>
                      <p className="text-xs text-zinc-500 font-mono">{inputBatchId}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusConfig(status.status).variant}>
                    {(() => {
                      const Icon = getStatusConfig(status.status).icon
                      return <Icon className="w-3 h-3 mr-1" />
                    })()}
                    {getStatusConfig(status.status).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Progress Bar */}
                {status.status === 'processing' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Progresso</span>
                      <span className="text-sm font-medium text-zinc-100">
                        {calculateProgress()}%
                      </span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs text-zinc-500">Total Leads</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-100">
                      <NumberTicker value={status.totalLeads} />
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-emerald-400">Enviados</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">
                      <NumberTicker value={status.sucessos} />
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span className="text-xs text-rose-400">Erros</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-400">
                      <NumberTicker value={status.erros?.length || 0} />
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-blue-400">Taxa</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">
                      {status.totalLeads > 0 
                        ? Math.round((status.sucessos / status.totalLeads) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Errors List */}
            {status.erros && status.erros.length > 0 && (
              <Card className="border-rose-500/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <CardTitle className="text-base text-rose-300">
                      Erros ({status.erros.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {status.erros.map((erro, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-rose-500/5 rounded-lg border border-rose-500/10"
                      >
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-zinc-300">{erro.email}</p>
                            <p className="text-xs text-rose-400">{erro.error}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timestamps */}
            <Card className="bg-zinc-900/50">
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Criado em</p>
                    <p className="text-sm font-medium text-zinc-300">
                      {new Date(status.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Atualizado em</p>
                    <p className="text-sm font-medium text-zinc-300">
                      {new Date(status.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Info with Auto-Refresh */}
            {status.status === 'processing' && (
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-300">
                        Processando emails via Make.com
                      </p>
                      <p className="text-xs text-zinc-500">
                        {autoRefresh 
                          ? `Atualizando automaticamente em ${countdown}s...`
                          : 'Auto-refresh pausado'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAutoRefresh}
                        className={autoRefresh ? 'text-blue-400' : 'text-zinc-400'}
                      >
                        {autoRefresh ? (
                          <><Pause className="w-4 h-4 mr-1" /> Pausar</>
                        ) : (
                          <><Play className="w-4 h-4 mr-1" /> Retomar</>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchStatus(inputBatchId)}
                        disabled={loading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Message */}
            {status.status === 'completed' && (
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-300">
                        Processamento concluído!
                      </p>
                      <p className="text-xs text-zinc-500">
                        {status.sucessos} email{status.sucessos !== 1 ? 's' : ''} enviado{status.sucessos !== 1 ? 's' : ''} com sucesso
                        {status.erros && status.erros.length > 0 && `, ${status.erros.length} com erro`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!status && !error && !loading && (
        <Card className="bg-zinc-900/30">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-400 mb-2">
                Nenhum batch selecionado
              </h3>
              <p className="text-sm text-zinc-500">
                Informe um Batch ID acima para ver o status
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

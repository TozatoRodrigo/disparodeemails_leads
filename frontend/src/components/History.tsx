import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle2, Clock, XCircle, FileText, Loader2, AlertCircle, ChevronRight, Calendar, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authFetch } from '@/hooks/useAuthFetch'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedListAll } from '@/components/magicui/animated-list'
import type { HistoryBatch } from '@/types'

interface HistoryProps {
  apiUrl: string
  onSelectBatch: (batchId: string) => void
}

export default function History({ apiUrl, onSelectBatch }: HistoryProps) {
  const [batches, setBatches] = useState<HistoryBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await authFetch(`${apiUrl}/api/upload/history`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar histórico')
      }

      setBatches(data.batches || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar histórico')
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <Card className="bg-zinc-900/30">
        <CardContent className="py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-500">Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
          <Button
            onClick={fetchHistory}
            variant="outline"
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Últimos batches</h3>
          <p className="text-sm text-zinc-500">{batches.length} batches encontrados</p>
        </div>
        <Button
          onClick={fetchHistory}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Batches List */}
      {batches.length === 0 ? (
        <Card className="bg-zinc-900/30">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-400 mb-2">
                Nenhum batch encontrado
              </h3>
              <p className="text-sm text-zinc-500">
                Faça upload de um CSV ou cole JSON para começar
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AnimatedListAll className="space-y-3">
          {batches.map((batch) => {
            const statusConfig = getStatusConfig(batch.status)
            const StatusIcon = statusConfig.icon
            const successRate = batch.totalLeads > 0 
              ? Math.round((batch.sucessos / batch.totalLeads) * 100)
              : 0

            return (
              <Card
                key={batch.id}
                className={cn(
                  "group cursor-pointer transition-all duration-300",
                  "hover:border-zinc-600 hover:bg-zinc-800/50",
                  "active:scale-[0.99]"
                )}
                onClick={() => onSelectBatch(batch.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                      statusConfig.bg
                    )}>
                      <StatusIcon className={cn("w-6 h-6", statusConfig.text)} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-zinc-100 truncate">{batch.filename}</p>
                        <Badge variant={statusConfig.variant} className="flex-shrink-0">
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono truncate mb-2">
                        {batch.id}
                      </p>
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>{batch.totalLeads} leads</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{batch.sucessos}</span>
                        </div>
                        {batch.erros > 0 && (
                          <div className="flex items-center gap-1.5 text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{batch.erros}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(batch.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Success Rate */}
                    <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <TrendingUp className={cn(
                          "w-4 h-4",
                          successRate >= 90 ? "text-emerald-400" :
                          successRate >= 70 ? "text-amber-400" :
                          "text-rose-400"
                        )} />
                        <span className={cn(
                          "text-lg font-bold tabular-nums",
                          successRate >= 90 ? "text-emerald-400" :
                          successRate >= 70 ? "text-amber-400" :
                          "text-rose-400"
                        )}>
                          {successRate}%
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">taxa sucesso</span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </AnimatedListAll>
      )}
    </div>
  )
}

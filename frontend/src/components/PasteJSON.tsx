import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, AlertCircle, Loader2, Info, Sparkles, Code2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authFetch } from '@/hooks/useAuthFetch'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/magicui/border-beam'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { NumberTicker } from '@/components/magicui/number-ticker'
import type { Batch, Lead } from '@/types'

interface PasteJSONProps {
  apiUrl: string
  onSuccess: (batch: Batch) => void
}

export default function PasteJSON({ apiUrl, onSuccess }: PasteJSONProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Batch | null>(null)

  // Parse and validate JSON in real-time
  const jsonStats = useMemo(() => {
    if (!jsonInput.trim()) {
      return { valid: false, count: 0, error: null }
    }
    try {
      const parsed = JSON.parse(jsonInput)
      let leads: Lead[]
      
      if (Array.isArray(parsed)) {
        leads = parsed
      } else if (parsed.leads && Array.isArray(parsed.leads)) {
        leads = parsed.leads
      } else {
        return { valid: false, count: 0, error: 'Formato inválido' }
      }
      
      const validLeads = leads.filter(l => l.nome && l.email)
      return { valid: true, count: leads.length, validCount: validLeads.length, error: null }
    } catch {
      return { valid: false, count: 0, error: 'JSON inválido' }
    }
  }, [jsonInput])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!jsonInput.trim()) {
      setError('Por favor, cole o JSON com os leads')
      return
    }

    setLoading(true)

    try {
      let leads: Lead[]
      
      try {
        const parsed = JSON.parse(jsonInput)
        
        if (Array.isArray(parsed)) {
          leads = parsed
        } else if (parsed.leads && Array.isArray(parsed.leads)) {
          leads = parsed.leads
        } else {
          throw new Error('Formato JSON inválido. Use um array de leads ou um objeto com propriedade "leads"')
        }
      } catch {
        throw new Error('JSON inválido. Verifique a sintaxe.')
      }

      if (leads.length === 0) {
        throw new Error('O JSON deve conter pelo menos um lead')
      }

      if (leads.length > 200) {
        throw new Error(`Limite de 200 leads excedido. Encontrados: ${leads.length}`)
      }

      const invalidLeads = leads.filter(lead => !lead.nome || !lead.email)
      if (invalidLeads.length > 0) {
        throw new Error(`Alguns leads estão sem nome ou email`)
      }

      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const url = `${baseUrl}/api/upload/json`
      
      const response = await authFetch(url, {
        method: 'POST',
        body: JSON.stringify(leads),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer upload')
      }

      setSuccess(data)
      onSuccess(data)
      setJsonInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar JSON')
    } finally {
      setLoading(false)
    }
  }

  const handleExample = () => {
    const example = [
      {
        nome: 'João Silva',
        email: 'joao@example.com',
        empresa: 'Empresa A'
      },
      {
        nome: 'Maria Santos',
        email: 'maria@example.com',
        empresa: null
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro@example.com',
        empresa: 'Empresa B'
      }
    ]
    setJsonInput(JSON.stringify(example, null, 2))
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* JSON Editor */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Code2 className="w-4 h-4" />
                  <span>leads.json</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {jsonInput && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <span className={cn(
                      "text-sm font-medium tabular-nums",
                      jsonStats.valid ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {jsonStats.valid ? (
                        <NumberTicker value={jsonStats.count} />
                      ) : (
                        jsonStats.error
                      )}
                      {jsonStats.valid && ' leads'}
                    </span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleExample}
                  className="text-xs text-zinc-400 hover:text-zinc-100"
                >
                  Exemplo
                </Button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="relative">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[
  {
    "nome": "João Silva",
    "email": "joao@example.com",
    "empresa": "Empresa A"
  }
]'
                className={cn(
                  "w-full h-80 p-4 bg-zinc-950 font-mono text-sm text-zinc-300",
                  "focus:outline-none resize-none",
                  "placeholder:text-zinc-600",
                  "selection:bg-orange-500/30"
                )}
                spellCheck={false}
              />
              {/* Line numbers effect */}
              <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-zinc-900 to-transparent pointer-events-none" />
            </div>

            {/* Editor Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-900/50">
              <span className="text-xs text-zinc-500">
                Aceita array de leads ou objeto com propriedade "leads"
              </span>
              <Badge variant={jsonStats.valid ? "success" : jsonInput ? "destructive" : "secondary"}>
                {!jsonInput ? 'Aguardando...' : jsonStats.valid ? 'JSON Válido' : 'JSON Inválido'}
              </Badge>
            </div>
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
          disabled={!jsonInput.trim() || loading || !jsonStats.valid}
          className={cn(
            "w-full",
            (!jsonInput.trim() || loading || !jsonStats.valid) && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Enviar para Processamento</span>
            </>
          )}
        </ShimmerButton>
      </form>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900/50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <h3 className="font-semibold text-zinc-100">Formato 1: Array</h3>
            </div>
            <div className="bg-zinc-950 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <code className="text-zinc-400">
                <span className="text-zinc-500">[</span>{'\n'}
                {'  '}<span className="text-zinc-500">{'{'}</span>{'\n'}
                {'    '}<span className="text-orange-400">"nome"</span>: <span className="text-emerald-400">"João"</span>,{'\n'}
                {'    '}<span className="text-orange-400">"email"</span>: <span className="text-emerald-400">"joao@ex.com"</span>{'\n'}
                {'  '}<span className="text-zinc-500">{'}'}</span>{'\n'}
                <span className="text-zinc-500">]</span>
              </code>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <h3 className="font-semibold text-zinc-100">Formato 2: Objeto</h3>
            </div>
            <div className="bg-zinc-950 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <code className="text-zinc-400">
                <span className="text-zinc-500">{'{'}</span>{'\n'}
                {'  '}<span className="text-orange-400">"leads"</span>: <span className="text-zinc-500">[</span>{'\n'}
                {'    '}<span className="text-zinc-500">{'{'}</span> <span className="text-orange-400">"nome"</span>: <span className="text-emerald-400">"João"</span>... <span className="text-zinc-500">{'}'}</span>{'\n'}
                {'  '}<span className="text-zinc-500">]</span>{'\n'}
                <span className="text-zinc-500">{'}'}</span>
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

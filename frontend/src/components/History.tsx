import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Clock, XCircle, FileText, Loader2, AlertCircle } from 'lucide-react';
import type { HistoryBatch } from '../types';

interface HistoryProps {
  apiUrl: string;
  onSelectBatch: (batchId: string) => void;
}

export default function History({ apiUrl, onSelectBatch }: HistoryProps) {
  const [batches, setBatches] = useState<HistoryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/upload/history`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar histórico');
      }

      setBatches(data.batches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar histórico');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: CheckCircle2,
          label: 'Concluído'
        };
      case 'processing':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: Clock,
          label: 'Processando'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: XCircle,
          label: 'Erro'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: Clock,
          label: 'Pendente'
        };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-900">Últimos batches processados</h3>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-1">Nenhum batch encontrado</p>
          <p className="text-xs text-gray-400">Faça upload de um CSV ou cole JSON para começar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {batches.map((batch) => {
            const statusConfig = getStatusConfig(batch.status);
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={batch.id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                onClick={() => onSelectBatch(batch.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{batch.filename}</p>
                      <p className="text-xs text-gray-500 font-mono truncate mt-0.5">{batch.id}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded ${statusConfig.bg} border ${statusConfig.border} flex items-center gap-1.5 flex-shrink-0 ml-2`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.text}`} />
                    <span className={`text-xs font-medium ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-0.5">Total</p>
                    <p className="font-semibold text-gray-900 text-sm">{batch.totalLeads}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-0.5">Sucessos</p>
                    <p className="font-semibold text-green-600 text-sm">{batch.sucessos}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-0.5">Erros</p>
                    <p className="font-semibold text-red-600 text-sm">{batch.erros}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-0.5">Data</p>
                    <p className="font-semibold text-gray-900 text-xs">
                      {new Date(batch.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

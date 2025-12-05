import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import type { BatchStatus as BatchStatusType } from '../types';

interface BatchStatusProps {
  apiUrl: string;
  batchId: string | null;
  refreshKey: number;
}

export default function BatchStatus({ apiUrl, batchId, refreshKey }: BatchStatusProps) {
  const [status, setStatus] = useState<BatchStatusType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputBatchId, setInputBatchId] = useState(batchId || '');

  useEffect(() => {
    if (batchId) {
      setInputBatchId(batchId);
      fetchStatus(batchId);
    }
  }, [batchId, refreshKey]);

  const fetchStatus = async (id: string) => {
    if (!id.trim()) {
      setError('Por favor, informe o Batch ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/upload/status/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar status');
      }

      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(inputBatchId);
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

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputBatchId}
          onChange={(e) => setInputBatchId(e.target.value)}
          placeholder="Cole o Batch ID aqui"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !inputBatchId.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" />
              Buscar
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {status && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Arquivo</p>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="font-medium text-gray-900 text-sm">{status.filename}</p>
              </div>
            </div>
            <div className={`p-4 ${getStatusConfig(status.status).bg} border ${getStatusConfig(status.status).border} rounded-lg`}>
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getStatusConfig(status.status).icon;
                  return <Icon className={`w-4 h-4 ${getStatusConfig(status.status).text}`} />;
                })()}
                <span className={`font-medium text-sm ${getStatusConfig(status.status).text}`}>
                  {getStatusConfig(status.status).label}
                </span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total de Leads</p>
              <p className="text-2xl font-bold text-blue-600">{status.totalLeads}</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Sucessos</p>
              <p className="text-2xl font-bold text-green-600">{status.sucessos}</p>
            </div>
          </div>

          {status.erros && status.erros.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="font-semibold text-red-900 text-sm">
                  Erros ({status.erros.length})
                </p>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {status.erros.map((erro, index) => (
                  <div key={index} className="p-2 bg-white rounded border border-red-100">
                    <p className="text-xs text-red-800">
                      <span className="font-medium">{erro.email}:</span> {erro.error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 mb-1">Criado em</p>
              <p className="text-sm font-medium text-gray-900">{new Date(status.createdAt).toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Atualizado em</p>
              <p className="text-sm font-medium text-gray-900">{new Date(status.updatedAt).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {status.status === 'processing' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-800">
                  O batch está sendo processado. Os emails estão sendo enviados pelo Make.com.
                  Atualize a página para ver o progresso.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!status && !error && !loading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Informe um Batch ID para ver o status</p>
        </div>
      )}
    </div>
  );
}

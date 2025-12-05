import { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import type { Batch } from '../types';

interface UploadCSVProps {
  apiUrl: string;
  onSuccess: (batch: Batch) => void;
}

export default function UploadCSV({ apiUrl, onSuccess }: UploadCSVProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Batch | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Por favor, selecione um arquivo CSV');
        setFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Por favor, solte um arquivo CSV');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer upload');
      }

      setSuccess(data);
      onSuccess(data);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center px-6 py-8 
              border-2 border-dashed rounded-lg transition-all duration-200
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }
              ${file ? 'border-green-500 bg-green-50' : ''}
            `}
          >
            <div className="text-center">
              <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {file ? 'Arquivo selecionado' : 'Arraste e solte seu arquivo CSV aqui'}
              </p>
              <p className="text-xs text-gray-500 mb-3">ou</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <File className="w-4 h-4" />
                Selecionar arquivo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-xs text-gray-400 mt-3">
                CSV até 5MB • Máximo 200 leads
              </p>
            </div>
          </div>
          
          {file && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-2">{success.message}</p>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-700">
                    <span className="font-medium">Batch ID:</span>{' '}
                    <code className="px-1.5 py-0.5 bg-green-100 rounded text-green-800">{success.batchId}</code>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Total de leads:</span>{' '}
                    <span className="text-green-700 font-semibold">{success.totalLeads}</span>
                  </p>
                  {success.leadsInvalidos > 0 && (
                    <p className="text-yellow-700">
                      <span className="font-medium">Leads inválidos:</span> {success.leadsInvalidos}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Enviar para Processamento
            </>
          )}
        </button>
      </form>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2 mb-2">
          <Info className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-gray-900">Formato do CSV</h3>
        </div>
        <pre className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-x-auto mb-2">
{`nome,email,empresa
João Silva,joao@example.com,Empresa A
Maria Santos,maria@example.com,`}
        </pre>
        <div className="text-xs text-gray-600 space-y-0.5">
          <p>• <strong>Colunas obrigatórias:</strong> nome, email</p>
          <p>• <strong>Coluna opcional:</strong> empresa</p>
        </div>
      </div>
    </div>
  );
}

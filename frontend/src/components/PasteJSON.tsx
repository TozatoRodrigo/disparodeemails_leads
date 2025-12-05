import { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import type { Batch, Lead } from '../types';

interface PasteJSONProps {
  apiUrl: string;
  onSuccess: (batch: Batch) => void;
}

export default function PasteJSON({ apiUrl, onSuccess }: PasteJSONProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Batch | null>(null);

  const convertJSONToCSV = (leads: Lead[]): string => {
    const headers = ['nome', 'email', 'empresa'];
    const rows = leads.map(lead => [
      lead.nome || '',
      lead.email || '',
      lead.empresa || ''
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!jsonInput.trim()) {
      setError('Por favor, cole o JSON com os leads');
      return;
    }

    setLoading(true);

    try {
      let leads: Lead[];
      
      try {
        const parsed = JSON.parse(jsonInput);
        
        if (Array.isArray(parsed)) {
          leads = parsed;
        } else if (parsed.leads && Array.isArray(parsed.leads)) {
          leads = parsed.leads;
        } else {
          throw new Error('Formato JSON inválido. Use um array de leads ou um objeto com propriedade "leads"');
        }
      } catch (parseError) {
        throw new Error('JSON inválido. Verifique a sintaxe.');
      }

      if (leads.length === 0) {
        throw new Error('O JSON deve conter pelo menos um lead');
      }

      if (leads.length > 200) {
        throw new Error(`Limite de 200 leads excedido. Encontrados: ${leads.length}`);
      }

      const invalidLeads = leads.filter(lead => !lead.nome || !lead.email);
      if (invalidLeads.length > 0) {
        throw new Error(`Alguns leads estão sem nome ou email`);
      }

      const csvContent = convertJSONToCSV(leads);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], `leads-${Date.now()}.csv`, { type: 'text/csv' });

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
      setJsonInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar JSON');
    } finally {
      setLoading(false);
    }
  };

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
    ];
    setJsonInput(JSON.stringify(example, null, 2));
  };


  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Cole o JSON com os leads
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExample}
                className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Exemplo
              </button>
            </div>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Cole aqui o JSON no formato:&#10;[&#10;  {&#10;    "nome": "João Silva",&#10;    "email": "joao@example.com",&#10;    "empresa": "Empresa A"&#10;  }&#10;]'
            className="w-full h-64 p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400 resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Aceita array de leads ou objeto com propriedade "leads". Máximo 200 leads.
          </p>
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
          disabled={!jsonInput.trim() || loading}
          className="w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Enviar para Processamento
            </>
          )}
        </button>
      </form>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2 mb-3">
          <Info className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-gray-900">Formatos aceitos</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Formato 1: Array direto</p>
            <pre className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
{`[
  {
    "nome": "João Silva",
    "email": "joao@example.com",
    "empresa": "Empresa A"
  }
]`}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Formato 2: Objeto com "leads"</p>
            <pre className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
{`{
  "leads": [
    {
      "nome": "João Silva",
      "email": "joao@example.com",
      "empresa": "Empresa A"
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

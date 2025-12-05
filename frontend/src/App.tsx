import { useState } from 'react';
import { Mail, Upload, FileText, BarChart3, History as HistoryIcon } from 'lucide-react';
import UploadCSV from './components/UploadCSV';
import PasteJSON from './components/PasteJSON';
import BatchStatus from './components/BatchStatus';
import History from './components/History';
import type { Batch } from './types';

// Construir URL da API corretamente
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Se não tiver protocolo, adicionar https://
  if (envUrl && !envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    return `https://${envUrl}`;
  }
  
  // Se tiver protocolo, usar direto
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback para desenvolvimento local
  return 'http://localhost:3001';
};

const API_URL = getApiUrl();

const tabs = [
  { id: 'upload', label: 'Upload CSV', icon: Upload },
  { id: 'json', label: 'Colar JSON', icon: FileText },
  { id: 'status', label: 'Status', icon: BarChart3 },
  { id: 'history', label: 'Histórico', icon: HistoryIcon },
] as const;

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'json' | 'status' | 'history'>('upload');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = (batch: Batch) => {
    setSelectedBatchId(batch.batchId);
    setActiveTab('status');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Compacto */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Email Dispatcher
              </h1>
              <p className="text-sm text-gray-600">
                Sistema de disparo de e-mails via Make.com
              </p>
            </div>
          </div>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Tabs Compactas */}
          <div className="border-b border-gray-200 bg-gray-50/50">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium
                      transition-all duration-200 relative
                      ${isActive 
                        ? 'text-blue-600 bg-white border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'upload' && (
              <UploadCSV apiUrl={API_URL} onSuccess={handleUploadSuccess} />
            )}
            {activeTab === 'json' && (
              <PasteJSON apiUrl={API_URL} onSuccess={handleUploadSuccess} />
            )}
            {activeTab === 'status' && (
              <BatchStatus
                apiUrl={API_URL}
                batchId={selectedBatchId}
                refreshKey={refreshKey}
              />
            )}
            {activeTab === 'history' && (
              <History
                apiUrl={API_URL}
                onSelectBatch={(batchId: string) => {
                  setSelectedBatchId(batchId);
                  setActiveTab('status');
                }}
              />
            )}
          </div>
        </div>

        {/* Footer Compacto */}
        <footer className="mt-4 text-center text-xs text-gray-500">
          Powered by Make.com • Email Dispatcher v1.0
        </footer>
      </div>
    </div>
  );
}

export default App;

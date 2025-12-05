import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import AuthPage from '@/components/auth/AuthPage'
import { Sidebar } from '@/components/layout/Sidebar'
import { Particles } from '@/components/magicui/particles'
import UploadCSV from '@/components/UploadCSV'
import PasteJSON from '@/components/PasteJSON'
import BatchStatus from '@/components/BatchStatus'
import History from '@/components/History'
import type { Batch } from '@/types'

// Construir URL da API corretamente
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  
  if (envUrl && !envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    return `https://${envUrl}`
  }
  
  if (envUrl) {
    return envUrl
  }
  
  return 'http://localhost:3001'
}

const API_URL = getApiUrl()

type TabId = 'upload' | 'json' | 'status' | 'history'

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('upload')
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!user) {
    return <AuthPage />
  }

  // Authenticated - show app
  const handleUploadSuccess = (batch: Batch) => {
    setSelectedBatchId(batch.batchId)
    setActiveTab('status')
    setRefreshKey(prev => prev + 1)
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'upload':
        return { title: 'Upload CSV', subtitle: 'Envie um arquivo CSV com seus leads' }
      case 'json':
        return { title: 'Colar JSON', subtitle: 'Cole os dados dos leads em formato JSON' }
      case 'status':
        return { title: 'Status do Batch', subtitle: 'Acompanhe o status dos seus envios' }
      case 'history':
        return { title: 'Histórico', subtitle: 'Visualize todos os batches processados' }
    }
  }

  const pageInfo = getPageTitle()

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background particles */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={30}
        staticity={50}
        color="#ff6b35"
        size={0.5}
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-rose-500/5 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-orange-500/10 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        user={user}
        onSignOut={signOut}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-2">
              {pageInfo.title}
            </h1>
            <p className="text-zinc-400">
              {pageInfo.subtitle}
            </p>
          </header>

          {/* Content Area */}
          <div className="space-y-6">
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
                  setSelectedBatchId(batchId)
                  setActiveTab('status')
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

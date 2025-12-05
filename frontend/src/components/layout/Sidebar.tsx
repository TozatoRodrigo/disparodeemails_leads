import { cn } from "@/lib/utils"
import { Mail, Upload, FileText, BarChart3, History, Zap } from "lucide-react"

type TabId = 'upload' | 'json' | 'status' | 'history'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const navItems = [
  { id: 'upload' as const, label: 'Upload CSV', icon: Upload, description: 'Envie arquivos CSV' },
  { id: 'json' as const, label: 'Colar JSON', icon: FileText, description: 'Cole dados JSON' },
  { id: 'status' as const, label: 'Status', icon: BarChart3, description: 'Acompanhe os envios' },
  { id: 'history' as const, label: 'Histórico', icon: History, description: 'Batches anteriores' },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-zinc-950 border-r border-zinc-800/50 fixed left-0 top-0">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg text-zinc-100 tracking-tight">
                Email Dispatcher
              </h1>
              <p className="text-xs text-zinc-500">Powered by Make.com</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-orange-500/20 to-rose-500/10 text-orange-400 shadow-lg shadow-orange-500/5"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-orange-500/20"
                        : "bg-zinc-800/50 group-hover:bg-zinc-700/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.label}</p>
                    <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-orange-500 to-rose-500" />
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/50">
          <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800/50 border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-zinc-300">Sistema Online</span>
            </div>
            <p className="text-xs text-zinc-500">
              Conectado ao Make.com
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/50 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-orange-400"
                    : "text-zinc-500"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive && "bg-orange-500/20"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}


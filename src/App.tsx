import { useState } from 'react';
import {
  LayoutDashboard, Monitor, ScanLine, Ticket,
  Settings, CreditCard, RefreshCw, Clock,
  ParkingCircle, Users, Menu, X, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider } from './store/appStore';
import { cn } from './lib/utils';
import DashboardPage from './pages/DashboardPage';
import MonitoringPage from './pages/MonitoringPage';
import SimulatorPage from './pages/SimulatorPage';
import TicketPage from './pages/TicketPage';
import PolicyPage from './pages/PolicyPage';
import BillingPage from './pages/BillingPage';
import SyncPage from './pages/SyncPage';
import HistoryPage from './pages/HistoryPage';

const TABS = [
  { id: 'dashboard', label: 'Overall', icon: LayoutDashboard, group: 'Monitor' },
  { id: 'monitoring', label: 'Real-time', icon: Monitor, group: 'Monitor' },
  { id: 'simulator', label: 'Simulate', icon: ScanLine, group: 'Operation' },
  { id: 'ticket', label: 'Ticket', icon: Ticket, group: 'Operation' },
  { id: 'policy', label: 'Policy', icon: Settings, group: 'Manage' },
  { id: 'billing', label: 'Finance & BKPay', icon: CreditCard, group: 'Manage' },
  { id: 'sync', label: 'Sync DATACORE', icon: RefreshCw, group: 'Manage' },
  { id: 'history', label: 'History', icon: Clock, group: 'Manage' },
] as const;

type TabId = typeof TABS[number]['id'];

const GROUPS = ['Monitor', 'Operation', 'Manage'] as const;

function PageContent({ id }: { id: TabId }) {
  switch (id) {
    case 'dashboard': return <DashboardPage />;
    case 'monitoring': return <MonitoringPage />;
    case 'simulator': return <SimulatorPage />;
    case 'ticket': return <TicketPage />;
    case 'policy': return <PolicyPage />;
    case 'billing': return <BillingPage />;
    case 'sync': return <SyncPage />;
    case 'history': return <HistoryPage />;
  }
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1e0a3c] text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
        'lg:relative lg:flex',
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0">
          <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <ParkingCircle className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm leading-tight">HCMUT</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Smart Parking</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {GROUPS.map(group => {
            const groupTabs = TABS.filter(t => t.group === group);
            return (
              <div key={group}>
                {sidebarOpen && (
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold px-3 mb-2">{group}</p>
                )}
                <div className="space-y-0.5">
                  {groupTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      title={!sidebarOpen ? tab.label : undefined}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                          : 'text-white/60 hover:bg-white/8 hover:text-white',
                      )}>
                      <tab.icon className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left truncate">{tab.label}</span>
                          {activeTab === tab.id && <ChevronRight className="w-3 h-3 opacity-60" />}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">Admin User</p>
                <p className="text-[10px] text-white/40 truncate">hieube17@gmail.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className={cn('flex flex-col flex-1 min-w-0 transition-all duration-300', sidebarOpen ? 'lg:ml-0' : '')}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900">{currentTab.label}</h1>
              <p className="text-xs text-gray-400">{currentTab.group} · Mock Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Online System
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">
              Mock Demo v1.0
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}>
              <PageContent id={activeTab} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}


import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FileSignature, 
  ShieldCheck, 
  Eye, 
  Bell, 
  Search,
  Menu,
  X,
  ClipboardList,
  Megaphone,
  Briefcase,
  History,
  Lock,
  BookOpen,
  MessageSquare,
  Scale,
  AlertCircle,
  HelpCircle,
  Database,
  BarChartHorizontal,
  UserCircle
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import PartnershipsModule from './components/Partnerships';
import AmendmentsModule from './components/Amendments';
import OSCModule from './components/OSCProfile';
import TransparencyPortal from './components/Transparency';
import AccountabilityModule from './components/Accountability';
import ChamamentoModule from './components/Chamamento';
import AuditLogsModule from './components/AuditLogs';
import PMISModule from './components/PMIS';
import LegislationModule from './components/Legislation';
import CommunicationModule from './components/Communication';
import ManualModule from './components/Manual';
import ReportsModule from './components/Reports';

import { UserRole } from './types';
import { MOCK_USER, getAccessibleRoutes, User } from './services/authContext';

const SidebarItem = ({ to, icon: Icon, label, active, hidden }: { to: string, icon: any, label: string, active: boolean, hidden?: boolean }) => {
  if (hidden) return null;
  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
        active ? 'bg-teal-900 text-white shadow-lg translate-x-1' : 'text-teal-100 hover:bg-teal-700/50'
      }`}
    >
      <Icon size={18} />
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const location = useLocation();

  const routes = getAccessibleRoutes(currentUser.role);
  const canAccess = (path: string) => routes.includes('all') || routes.includes(path);

  if (location.pathname === '/transparency') {
    return <TransparencyPortal />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Dinâmica baseada em RBAC */}
      <aside className={`bg-teal-800 text-white w-72 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-50 h-full border-r border-teal-700/50 overflow-y-auto scrollbar-hide`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center text-teal-900 shadow-xl shadow-teal-900/40">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">MROSC<span className="text-teal-400">Digital</span></h1>
              <p className="text-[9px] font-bold text-teal-300 uppercase tracking-widest mt-1">RBAC Compliance v2.5</p>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-2 text-[10px] font-black text-teal-400/50 uppercase tracking-widest mb-2">Operacional</div>
        <nav className="px-4 space-y-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/amendments" icon={FileText} label="Emendas Parlamentares" active={location.pathname === '/amendments'} hidden={!canAccess('/amendments')} />
          <SidebarItem to="/pmis" icon={Briefcase} label="PMIS" active={location.pathname === '/pmis'} hidden={!canAccess('/pmis')} />
          <SidebarItem to="/chamamento" icon={Megaphone} label="Chamamentos" active={location.pathname === '/chamamento'} hidden={!canAccess('/chamamento')} />
          <SidebarItem to="/partnerships" icon={FileSignature} label="Parcerias" active={location.pathname.startsWith('/partnerships')} hidden={!canAccess('/partnerships')} />
          <SidebarItem to="/accountability" icon={ClipboardList} label="Contas (REO/REFF)" active={location.pathname === '/accountability'} hidden={!canAccess('/accountability')} />
        </nav>

        <div className="px-4 py-6 text-[10px] font-black text-teal-400/50 uppercase tracking-widest mt-4 border-t border-teal-700/30">Gestão e Dados</div>
        <nav className="px-4 space-y-1">
          <SidebarItem to="/oscs" icon={Users} label="Cadastro OSCs" active={location.pathname === '/oscs'} hidden={!canAccess('/oscs')} />
          <SidebarItem to="/reports" icon={BarChartHorizontal} label="Relatórios e BI" active={location.pathname === '/reports'} hidden={!canAccess('/reports')} />
          <SidebarItem to="/legislation" icon={Scale} label="Legislação e Modelos" active={location.pathname === '/legislation'} hidden={!canAccess('/legislation')} />
          <SidebarItem to="/communication" icon={MessageSquare} label="Comunicações" active={location.pathname === '/communication'} hidden={!canAccess('/communication')} />
        </nav>

        <div className="px-4 py-6 text-[10px] font-black text-teal-400/50 uppercase tracking-widest mt-4 border-t border-teal-700/30">Controle e Ajuda</div>
        <nav className="px-4 space-y-1 mb-24">
          <SidebarItem to="/logs" icon={History} label="Audit Trail (LGPD)" active={location.pathname === '/logs'} hidden={!canAccess('/logs')} />
          <SidebarItem to="/manual" icon={BookOpen} label="Manual do Sistema" active={location.pathname === '/manual'} hidden={!canAccess('/manual')} />
          <SidebarItem to="/transparency" icon={Eye} label="Portal Público" active={false} />
        </nav>

        <div className="fixed bottom-0 w-72 p-6 bg-teal-900 border-t border-teal-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center font-black text-teal-900 shadow-lg uppercase">
              {currentUser.name.substring(0,2)}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white text-xs truncate">{currentUser.name}</p>
              <p className="text-teal-400 text-[10px] uppercase font-black tracking-tighter truncate">{currentUser.role}</p>
            </div>
            <button 
              onClick={() => {
                // Alternar perfis para teste da demo
                const roles = Object.values(UserRole);
                const nextRole = roles[(roles.indexOf(currentUser.role) + 1) % roles.length];
                setCurrentUser({ ...currentUser, role: nextRole });
              }}
              title="Trocar Perfil (Demo Mode)"
              className="ml-auto text-teal-500 hover:text-white transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b h-20 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={22} />
            </button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Busca global baseada em permissão..." 
                className="pl-12 pr-6 py-3 border-none rounded-2xl text-sm bg-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/10 outline-none w-80 lg:w-[480px] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
             <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] font-black text-teal-600 uppercase">Ambiente Seguro</span>
                <span className="text-[9px] text-gray-400 font-bold">{currentUser.department || 'Acesso Externo'}</span>
             </div>
            <div className="relative cursor-pointer group">
              <Bell className="text-gray-400 group-hover:text-teal-600 transition-colors" size={20} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">5</span>
            </div>
            <div className="h-10 w-px bg-gray-100"></div>
            <button className="flex items-center space-x-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-teal-600 transition-colors">
              <UserCircle size={20} />
              <span>Meu Perfil</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
          <Routes>
            <Route path="/" element={<Dashboard user={currentUser} />} />
            <Route path="/amendments" element={canAccess('/amendments') ? <AmendmentsModule /> : <AccessDenied />} />
            <Route path="/pmis" element={canAccess('/pmis') ? <PMISModule /> : <AccessDenied />} />
            <Route path="/chamamento" element={canAccess('/chamamento') ? <ChamamentoModule /> : <AccessDenied />} />
            <Route path="/partnerships/*" element={canAccess('/partnerships') ? <PartnershipsModule user={currentUser} /> : <AccessDenied />} />
            <Route path="/accountability" element={canAccess('/accountability') ? <AccountabilityModule user={currentUser} /> : <AccessDenied />} />
            <Route path="/oscs" element={canAccess('/oscs') ? <OSCModule /> : <AccessDenied />} />
            <Route path="/reports" element={canAccess('/reports') ? <ReportsModule /> : <AccessDenied />} />
            <Route path="/legislation" element={canAccess('/legislation') ? <LegislationModule /> : <AccessDenied />} />
            <Route path="/communication" element={canAccess('/communication') ? <CommunicationModule /> : <AccessDenied />} />
            <Route path="/logs" element={canAccess('/logs') ? <AuditLogsModule /> : <AccessDenied />} />
            <Route path="/manual" element={<ManualModule />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-4">
    <div className="p-6 bg-red-50 text-red-600 rounded-full">
      <Lock size={64} />
    </div>
    <h2 className="text-3xl font-black text-gray-900">Acesso Restrito</h2>
    <p className="text-gray-500 text-center max-w-md">Seu perfil de usuário não possui permissão para acessar este módulo. Entre em contato com o Administrador Master se acreditar que isto é um erro.</p>
    <Link to="/" className="px-8 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Voltar ao Dashboard</Link>
  </div>
);

// Auxiliar para Icone de Refresh (não importado acima)
import { RefreshCw } from 'lucide-react';

const AppWrapper = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

export default AppWrapper;

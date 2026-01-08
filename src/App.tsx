import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, FileSignature, ShieldCheck, Eye, Bell, Search,
  Menu, X, ClipboardList, Megaphone, Briefcase, History, Lock, BookOpen,
  MessageSquare, Scale, BarChartHorizontal, UserCircle, LogOut
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
import UsersManagement from './components/UsersManagement'; // Certifique-se que o arquivo existe

import { useAuth, getAccessibleRoutes, AuthProvider } from './services/authContext';
import { RoleLabels, UserRole } from './types'; // Importando UserRole para comparar corretamente

const SidebarItem = ({ 
  to, 
  icon: Icon, 
  label, 
  active, 
  hidden, 
  onClick 
}: { 
  to: string, 
  icon: any, 
  label: string, 
  active: boolean, 
  hidden?: boolean, 
  onClick?: () => void 
}) => {
  if (hidden) return null;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all whitespace-nowrap ${
        active ? 'bg-teal-900 text-white shadow-lg translate-x-1' : 'text-teal-100 hover:bg-teal-700/50'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
};

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-teal-700 font-bold">Carregando Sistema...</div>;
  }

  if (location.pathname === '/transparency') {
    return <TransparencyPortal />;
  }

  if (!user) {
    return <Navigate to="/transparency" replace />;
  }

  const routes = getAccessibleRoutes(user.role);
  
  // Função de verificação de acesso refinada
  const canAccess = (key: string) => {
    // 1. Se o usuário for MASTER, libera tudo imediatamente
    if (user.role === UserRole.MASTER || user.role === 'MASTER') return true;

    // 2. Verifica rotas (começa com /)
    if (key.startsWith('/')) {
        return routes.includes('all') || routes.includes(key);
    }
    
    // 3. Verifica capabilities específicas
    if (routes.includes('all')) return true;
    
    // Fallback específico para gestão de usuários (apenas MASTER)
    if (key === 'MANAGE_USERS') {
        return user.role === UserRole.MASTER || user.role === 'MASTER';
    }
    
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`
          bg-teal-800 text-white 
          h-full z-50
          border-r border-teal-700/50 overflow-y-auto scrollbar-hide
          transition-all duration-300 ease-in-out
          fixed md:relative 
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden'}
        `}
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center text-teal-900 shadow-xl shadow-teal-900/40 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div className="whitespace-nowrap">
              <h1 className="text-lg font-black tracking-tighter leading-none">MROSC<span className="text-teal-400">Digital</span></h1>
              <p className="text-[9px] font-bold text-teal-300 uppercase tracking-widest mt-1">RBAC Compliance v3.0</p>
            </div>
          </div>
          <button className="md:hidden text-teal-200 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-2 text-[10px] font-black text-teal-400/50 uppercase tracking-widest mb-2 whitespace-nowrap">Operacional</div>
        <nav className="px-4 space-y-1">
          <SidebarItem onClick={handleMobileClick} to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem onClick={handleMobileClick} to="/amendments" icon={FileText} label="Emendas Parlamentares" active={location.pathname === '/amendments'} hidden={!canAccess('/amendments')} />
          <SidebarItem onClick={handleMobileClick} to="/pmis" icon={Briefcase} label="PMIS" active={location.pathname === '/pmis'} hidden={!canAccess('/pmis')} />
          <SidebarItem onClick={handleMobileClick} to="/chamamento" icon={Megaphone} label="Chamamentos" active={location.pathname === '/chamamento'} hidden={!canAccess('/chamamento')} />
          <SidebarItem onClick={handleMobileClick} to="/partnerships" icon={FileSignature} label="Parcerias" active={location.pathname.startsWith('/partnerships')} hidden={!canAccess('/partnerships')} />
          <SidebarItem onClick={handleMobileClick} to="/accountability" icon={ClipboardList} label="Contas (REO/REFF)" active={location.pathname === '/accountability'} hidden={!canAccess('/accountability')} />
        </nav>

        <div className="px-4 py-6 text-[10px] font-black text-teal-400/50 uppercase tracking-widest mt-4 border-t border-teal-700/30 whitespace-nowrap">Gestão e Dados</div>
        <nav className="px-4 space-y-1">
          <SidebarItem onClick={handleMobileClick} to="/oscs" icon={Users} label="Cadastro OSCs" active={location.pathname === '/oscs'} hidden={!canAccess('/oscs')} />
          <SidebarItem onClick={handleMobileClick} to="/reports" icon={BarChartHorizontal} label="Relatórios e BI" active={location.pathname === '/reports'} hidden={!canAccess('/reports')} />
          <SidebarItem onClick={handleMobileClick} to="/legislation" icon={Scale} label="Legislação e Modelos" active={location.pathname === '/legislation'} hidden={!canAccess('/legislation')} />
          <SidebarItem onClick={handleMobileClick} to="/communication" icon={MessageSquare} label="Comunicações" active={location.pathname === '/communication'} hidden={!canAccess('/communication')} />
        </nav>

        <div className="px-4 py-6 text-[10px] font-black text-teal-400/50 uppercase tracking-widest mt-4 border-t border-teal-700/30 whitespace-nowrap">Controle e Ajuda</div>
        <nav className="px-4 space-y-1 mb-24">
          <SidebarItem onClick={handleMobileClick} to="/logs" icon={History} label="Audit Trail (LGPD)" active={location.pathname === '/logs'} hidden={!canAccess('/logs')} />
          <SidebarItem onClick={handleMobileClick} to="/manual" icon={BookOpen} label="Manual do Sistema" active={location.pathname === '/manual'} hidden={!canAccess('/manual')} />
          
          {/* MENU EXCLUSIVO MASTER */}
          <SidebarItem 
            onClick={handleMobileClick}
            to="/users" 
            icon={Users} 
            label="Gerenciar Usuários" 
            active={location.pathname === '/users'} 
            hidden={!canAccess('MANAGE_USERS')} 
          />
          
          <SidebarItem onClick={handleMobileClick} to="/transparency" icon={Eye} label="Portal Público" active={false} />
        </nav>

        <div className="fixed bottom-0 w-72 p-6 bg-teal-900 border-t border-teal-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center font-black text-teal-900 shadow-lg uppercase shrink-0">
              {user.name.substring(0,2)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-white text-xs truncate">{user.name}</p>
              {/* Exibindo nome bonito do cargo e DEBUG se necessário */}
              <p className="text-teal-400 text-[10px] uppercase font-black tracking-tighter truncate">
                {RoleLabels[user.role] || user.role}
              </p>
            </div>
            <button onClick={signOut} title="Sair do Sistema" className="ml-auto text-teal-500 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b h-20 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={22} />
            </button>
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Busca global..." 
                className="pl-12 pr-6 py-3 border-none rounded-2xl text-sm bg-gray-100 focus:bg-white focus:ring-4 focus:ring-teal-500/10 outline-none w-80 lg:w-[480px] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
              <div className="flex flex-col items-end mr-4 hidden sm:flex">
                <span className="text-[10px] font-black text-teal-600 uppercase">Ambiente Seguro</span>
                <span className="text-[9px] text-gray-400 font-bold">{user.department || 'Externo'}</span>
              </div>
            <div className="relative cursor-pointer group">
              <Bell className="text-gray-400 group-hover:text-teal-600 transition-colors" size={20} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
            <button className="flex items-center space-x-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-teal-600 transition-colors">
              <UserCircle size={20} />
              <span className="hidden sm:inline">Perfil</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-gray-50/50">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/amendments" element={canAccess('/amendments') ? <AmendmentsModule /> : <AccessDenied />} />
            <Route path="/pmis" element={canAccess('/pmis') ? <PMISModule /> : <AccessDenied />} />
            <Route path="/chamamento" element={canAccess('/chamamento') ? <ChamamentoModule /> : <AccessDenied />} />
            <Route path="/partnerships/*" element={canAccess('/partnerships') ? <PartnershipsModule user={user} /> : <AccessDenied />} />
            <Route path="/accountability" element={canAccess('/accountability') ? <AccountabilityModule user={user} /> : <AccessDenied />} />
            <Route path="/oscs" element={canAccess('/oscs') ? <OSCModule /> : <AccessDenied />} />
            <Route path="/reports" element={canAccess('/reports') ? <ReportsModule /> : <AccessDenied />} />
            <Route path="/legislation" element={canAccess('/legislation') ? <LegislationModule /> : <AccessDenied />} />
            <Route path="/communication" element={canAccess('/communication') ? <CommunicationModule /> : <AccessDenied />} />
            <Route path="/logs" element={canAccess('/logs') ? <AuditLogsModule /> : <AccessDenied />} />
            <Route path="/manual" element={<ManualModule />} />
            
            {/* ROTA MASTER */}
            <Route path="/users" element={canAccess('MANAGE_USERS') ? <UsersManagement /> : <AccessDenied /> } />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in zoom-in">
    <div className="p-6 bg-red-50 text-red-600 rounded-full">
      <Lock size={64} />
    </div>
    <h2 className="text-3xl font-black text-gray-900">Acesso Restrito</h2>
    <p className="text-gray-500 text-center max-w-md">Seu perfil não possui permissão para acessar este módulo. Contate o Administrador Master se achar que isso é um erro.</p>
    <Link to="/" className="px-8 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-900 transition-all">
      Voltar ao Dashboard
    </Link>
  </div>
);

const AppWrapper = () => (
  <AuthProvider>
    <HashRouter>
      <AppContent />
    </HashRouter>
  </AuthProvider>
);

export default AppWrapper;
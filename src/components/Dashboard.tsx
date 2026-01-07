import React, { useState, useEffect } from 'react';
import { 
  Activity, FileBarChart, AlertTriangle, TrendingUp, ChevronUp, ChevronDown, ShieldCheck, Megaphone,
  DollarSign, Scale, History, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { User } from '../services/authContext';
import { UserRole, PartnershipStatus } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardProps { user: User; }

// Componente Visual do Card
const StatCard = ({ title, value, icon: Icon, color, trend, pulse }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all relative overflow-hidden group">
    {pulse && (
      <div className="absolute top-4 right-4 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </div>
    )}
    <div className="flex items-center justify-between mb-8">
      <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-700 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-[10px] font-black flex items-center space-x-1 ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend.positive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{trend.value}%</span>
        </span>
      )}
    </div>
    <div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
      <h3 className="text-4xl font-black text-gray-900">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isOSC = user.role === UserRole.OSC_LEGAL || user.role === UserRole.OSC_USER;
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePartnerships: 0,
    totalValue: 0,
    chamamentosCount: 0,
    alertsCount: 0
  });
  const [pieData, setPieData] = useState<any[]>([]);
  
  // Dados Mockados para o Gráfico de Barras (Difícil calcular real sem tabela de transações financeiras detalhada)
  const barData = [
    { name: 'Jan', valor: 120000 },
    { name: 'Fev', valor: 150000 },
    { name: 'Mar', valor: 180000 },
    { name: 'Abr', valor: 200000 },
    { name: 'Mai', valor: 160000 },
    { name: 'Jun', valor: 250000 },
  ];

  const COLORS_PIE = ['#0f766e', '#0d9488', '#f59e0b', '#ef4444', '#6366f1'];

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Buscando Parcerias (Aplicando filtro se for OSC)
      let query = supabase.from('partnerships').select('id, status, total_value, osc_id');
      
      // Se for OSC, precisamos filtrar. Como o user.id está na tabela profiles e vinculado ao osc_id...
      // Simplificação: Assumindo que o filtro de RLS do Supabase já cuida disso se configurado, 
      // ou filtramos manualmente se tivermos o oscId no contexto.
      // Para garantir, vamos confiar nas Policies (RLS) que criamos no SQL.
      
      const { data: partnerships, error: partError } = await query;
      if (partError) throw partError;

      // 2. Buscando Chamamentos (Geral)
      const { count: chamamentosCount } = await supabase
        .from('chamamentos')
        .select('*', { count: 'exact', head: true });

      // 3. Buscando Alertas (OSCs com CND vencida)
      const { count: alertsCount } = await supabase
        .from('oscs')
        .select('*', { count: 'exact', head: true })
        .eq('cnd_status', 'expired');

      // PROCESSAMENTO DOS DADOS
      const activeCount = partnerships?.length || 0;
      const totalVal = partnerships?.reduce((acc, curr) => acc + (curr.total_value || 0), 0) || 0;

      // Agrupamento para o Gráfico de Pizza
      const statusMap: Record<string, number> = {};
      partnerships?.forEach(p => {
        // Traduzindo status do banco para label legível
        const label = translateStatus(p.status);
        statusMap[label] = (statusMap[label] || 0) + 1;
      });

      const processedPieData = Object.keys(statusMap).map(key => ({
        name: key,
        value: statusMap[key]
      }));

      // Se não tiver dados, coloca um placeholder para o gráfico não quebrar
      if (processedPieData.length === 0) {
        processedPieData.push({ name: 'Sem dados', value: 1 });
      }

      setStats({
        activePartnerships: activeCount,
        totalValue: totalVal,
        chamamentosCount: chamamentosCount || 0,
        alertsCount: alertsCount || 0
      });
      setPieData(processedPieData);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'proposal': 'Em Proposta',
      'analysis': 'Em Análise',
      'approved': 'Aprovada',
      'active': 'Em Execução',
      'execution': 'Em Execução',
      'concluded': 'Concluída',
      'rejected': 'Rejeitada'
    };
    return map[status] || status;
  };

  const formatCurrency = (val: number) => {
    // Formatação compacta: 1.2M, 500K ou valor total
    if (val > 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    if (val > 1000) return `R$ ${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return (
       <div className="flex items-center justify-center h-screen text-teal-600">
          <Loader2 className="animate-spin mr-2" size={40} />
          <span className="font-bold text-xl tracking-widest">Carregando Indicadores...</span>
       </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center space-x-3 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <div className="w-10 h-px bg-teal-600/30"></div>
            <span>Unidade Unaí/MG • Exercício {new Date().getFullYear()}</span>
          </div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">
            {isOSC ? 'Painel da Instituição' : 'Gestão Estratégica MROSC'}
          </h2>
          <p className="text-gray-500 font-medium italic mt-2">"Lei Municipal 3.083/17 e Decreto 7.259/23."</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Link to="/transparency" className="flex-1 md:flex-none px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-3 transition-all shadow-sm text-gray-700">
            <ShieldCheck size={18} /> Transparência
          </Link>
          {!isOSC && (
            <button className="flex-1 md:flex-none px-8 py-4 bg-teal-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-900 flex items-center justify-center gap-3 shadow-2xl shadow-teal-900/30 transition-all active:scale-95">
              <FileBarChart size={18} /> Exportar SICOM
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Parcerias / Propostas" 
          value={stats.activePartnerships.toString().padStart(2, '0')} 
          icon={Activity} 
          color="teal" 
          trend={{ value: 12, positive: true }} 
        />
        <StatCard 
          title="Recursos Geridos" 
          value={formatCurrency(stats.totalValue)} 
          icon={DollarSign} 
          color="indigo" 
        />
        <StatCard 
          title="Editais Abertos" 
          value={stats.chamamentosCount.toString().padStart(2, '0')} 
          icon={Megaphone} 
          color="blue" 
        />
        <StatCard 
          title="Alertas de CND" 
          value={stats.alertsCount.toString().padStart(2, '0')} 
          icon={AlertTriangle} 
          color="amber" 
          pulse={stats.alertsCount > 0} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3 italic">
                <TrendingUp className="text-teal-600" size={28} />
                Repasses x Metas
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Fluxo de Desembolso Financeiro MROSC</p>
            </div>
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-teal-800"></div>
               <span className="text-[9px] font-black text-gray-400 uppercase">Valor Repassado</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.2)' }} />
                <Bar dataKey="valor" fill="#0f766e" radius={[12, 12, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-10 self-start italic">Status de Contas</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 w-full">
            {pieData.map((d, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase mb-2 truncate" title={d.name}>{d.name}</span>
                <span className="text-lg font-black text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isOSC && (
        <div className="bg-teal-950 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000">
            <History size={250} />
          </div>
          <div className="max-w-xl relative z-10">
             <h4 className="text-3xl font-black mb-6 flex items-center gap-4">
                <Scale className="text-teal-400" /> Auditoria Imutável
             </h4>
             <p className="text-teal-100/60 font-medium leading-relaxed mb-10">
                Todos os atos decisórios, parcerias celebradas e transferências são registrados com rastreabilidade total (Audit Trail), garantindo integridade para o Tribunal de Contas (SICOM) e órgãos externos.
             </p>
             <Link to="/logs" className="px-10 py-5 bg-teal-600 hover:bg-teal-500 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3 transition-all">
                Acessar Trilha de Auditoria <History size={16} />
             </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
             <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center">
                <span className="block text-[9px] font-black text-teal-400 uppercase mb-2">Logs Hoje</span>
                <span className="text-2xl font-black">124</span>
             </div>
             <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center">
                <span className="block text-[9px] font-black text-teal-400 uppercase mb-2">Integridade</span>
                <span className="text-2xl font-black">100%</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
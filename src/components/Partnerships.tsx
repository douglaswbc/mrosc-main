import React, { useState, useEffect } from 'react';
import { 
  Plus, FileSignature, ArrowLeft, Edit, Eye,
  ClipboardList, CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { PartnershipStatus, Partnership } from '../types';
import { User } from '../services/authContext';
import WorkPlanEditor from './WorkPlanEditor';
import { supabase } from '../lib/supabase';

interface PartnershipsProps { user: User; }

const StatusBadge = ({ status }: { status: PartnershipStatus }) => {
  const styles: Record<string, string> = {
    [PartnershipStatus.EXECUTION]: 'bg-blue-50 text-blue-700 border-blue-100',
    [PartnershipStatus.PLANNING]: 'bg-gray-50 text-gray-700 border-gray-100',
    [PartnershipStatus.CELEBRATION]: 'bg-teal-50 text-teal-700 border-teal-100',
    [PartnershipStatus.ACCOUNTABILITY]: 'bg-amber-50 text-amber-700 border-amber-100',
    [PartnershipStatus.CONCLUDED]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

const PartnershipsModule: React.FC<PartnershipsProps> = ({ user }) => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [loading, setLoading] = useState(true);

  // Busca dados reais do Supabase
  useEffect(() => {
    fetchPartnerships();
  }, []);

  const fetchPartnerships = async () => {
    try {
      setLoading(true);
      // Faz o SELECT buscando dados da tabela partnerships
      // E também traz o nome da OSC (tabela oscs) e a versão do plano (tabela work_plans)
      const { data, error } = await supabase
        .from('partnerships')
        .select(`
          *,
          oscs (name),
          work_plans (version, content)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapeia os dados do Banco para o formato da Interface TypeScript
      const mappedData: Partnership[] = (data || []).map((item: any) => {
        // Pega o último plano de trabalho (se houver) para ver as metas
        const latestPlan = item.work_plans?.[0]; 
        const goals = latestPlan?.content?.goals || [];
        
        // Calcula progresso baseado nas metas concluídas (exemplo simples)
        // No futuro, isso virá calculado do banco
        
        return {
          id: item.id,
          title: item.object, // No banco chamamos de 'object', no front de 'title'
          oscId: item.osc_id,
          oscName: item.oscs?.name, // Nome da OSC para exibir (extra field)
          type: 'Termo de Fomento', // Default, pois não criamos essa coluna no script SQL ainda
          status: item.status as PartnershipStatus,
          totalValue: item.total_value,
          startDate: item.start_date,
          endDate: item.end_date,
          workPlanVersion: latestPlan?.version || 1,
          goals: goals,
          tranches: []
        };
      });

      setPartnerships(mappedData);
    } catch (err) {
      console.error('Erro ao buscar parcerias:', err);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'create') {
    return <WorkPlanEditor onBack={() => { setView('list'); fetchPartnerships(); }} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-teal-600">
        <Loader2 className="animate-spin mr-2" size={32} />
        <span className="font-bold text-lg">Carregando Parcerias MROSC...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {view === 'list' ? (
        <>
          <header className="flex justify-between items-end">
            <div>
              <div className="flex items-center space-x-3 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
                <FileSignature size={14} />
                <span>Gestão Unaí/MG • Registro de Parcerias</span>
              </div>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Instrumentos MROSC</h2>
            </div>
            <button 
              onClick={() => setView('create')}
              className="px-8 py-5 bg-teal-800 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-teal-900 shadow-2xl shadow-teal-900/20 flex items-center gap-3 transition-all active:scale-95"
            >
              <Plus size={20} /> Nova Parceria
            </button>
          </header>

          {partnerships.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
              <FileSignature className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-500">Nenhuma parceria encontrada</h3>
              <p className="text-gray-400">Clique em "Nova Parceria" para formalizar um instrumento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partnerships.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => { setSelectedPartnership(p); setView('detail'); }} 
                  className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-8">
                    <StatusBadge status={p.status} />
                    <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-teal-700 group-hover:text-white transition-all">
                       <Eye size={20} />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight leading-tight line-clamp-2">{p.title}</h4>
                  {/* Exibindo o nome da OSC se disponível */}
                  <p className="text-sm font-medium text-gray-500 mb-4">{(p as any).oscName || 'OSC não identificada'}</p>
                  
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10">{p.type}</p>
                  <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Valor Global</span>
                        <div className="font-black text-gray-900">
                          {p.totalValue ? p.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                        </div>
                     </div>
                     <div className="text-right space-y-1">
                        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Versão</span>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">V0{p.workPlanVersion}</div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right duration-500 pb-20">
           {/* ... MANTIDO IGUAL AO ORIGINAL, APENAS RENDERIZANDO DADOS REAIS ... */}
           <div className="flex justify-between items-center">
              <button onClick={() => setView('list')} className="flex items-center gap-3 text-teal-600 font-black text-[10px] uppercase tracking-widest px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-teal-50 transition-all">
                 <ArrowLeft size={16} /> Voltar
              </button>
              <div className="flex gap-4">
                 <button className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase flex items-center gap-2">
                    <Edit size={16} /> Editar
                 </button>
                 <button className="px-6 py-3 bg-teal-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Baixar Instrumento</button>
              </div>
           </div>

           <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100">
              <div className="flex items-center gap-8 mb-12">
                 <div className="w-20 h-20 bg-teal-800 text-white rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-xl">
                    {selectedPartnership?.title.charAt(0)}
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{selectedPartnership?.title}</h3>
                    <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mt-2">{selectedPartnership?.type} • ID #{selectedPartnership?.id.slice(0,8)}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <CheckCircle className="text-teal-600 mb-4" size={24} />
                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Execução Física</h5>
                    {/* Placeholder para cálculo real */}
                    <p className="text-xl font-black text-gray-900">0% Concluído</p> 
                 </div>
                 <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <ClipboardList className="text-blue-600 mb-4" size={24} />
                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Status Contas</h5>
                    <p className="text-xl font-black text-gray-900">Em Análise</p>
                 </div>
                 <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
                    <AlertTriangle className="text-amber-600 mb-4" size={24} />
                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Vigência</h5>
                    <p className="text-xl font-black text-gray-900">{selectedPartnership?.endDate ? 'Ativo' : 'Indefinido'}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipsModule;
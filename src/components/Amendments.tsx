import React, { useState, useEffect } from 'react';
import { FileText, Plus, User, DollarSign, Scale, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Amendment } from '../types';

// Interface local extendida para facilitar o mapeamento
interface AmendmentData extends Amendment {
  created_at: string;
}

const AmendmentsModule: React.FC = () => {
  const [amendments, setAmendments] = useState<AmendmentData[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para estatísticas
  const [stats, setStats] = useState({
    totalValue: 0,
    indirectCount: 0,
    pendingCount: 0,
    executedCount: 0
  });

  useEffect(() => {
    fetchAmendments();
  }, []);

  const fetchAmendments = async () => {
    try {
      setLoading(true);
      
      // Busca Emendas e o nome da OSC vinculada (se houver)
      const { data, error } = await supabase
        .from('amendments')
        .select(`
          *,
          oscs (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapeia os dados do banco para o frontend
      const mappedData: AmendmentData[] = (data || []).map((item: any) => ({
        id: item.id,
        number: item.number || 'S/N',
        author: item.author_name,
        value: item.value,
        year: item.year || new Date().getFullYear(),
        description: 'Emenda Parlamentar Impositiva', // Default, já que não temos desc no banco simples
        type: 'Impositiva', // Default
        indicationType: item.osc_id ? 'Direta' : 'Indireta', // Se tem OSC é direta, senão indireta
        legalDeadline: '31/12/' + (item.year || new Date().getFullYear()),
        status: translateStatus(item.status),
        beneficiaryOSC: item.oscs?.name || null,
        created_at: item.created_at
      }));

      setAmendments(mappedData);
      calculateStats(mappedData);

    } catch (error) {
      console.error('Erro ao buscar emendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: AmendmentData[]) => {
    const total = data.reduce((acc, curr) => acc + Number(curr.value), 0);
    const indirect = data.filter(i => i.indicationType === 'Indireta').length;
    const executed = data.filter(i => i.status === 'Executada' || i.status === 'Paga').length;
    // Consideramos pendente qualquer coisa que não esteja paga/executada
    const pending = data.length - executed;

    setStats({
      totalValue: total,
      indirectCount: indirect,
      pendingCount: pending,
      executedCount: executed
    });
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'Pendente',
      'linked': 'Vinculada',
      'paid': 'Executada'
    };
    return map[status] || status;
  };

  // Função simples para adicionar emenda (simulando um form modal)
  const handleCreate = async () => {
    const author = prompt("Nome do Vereador/Autor:");
    if (!author) return;
    const valueStr = prompt("Valor da Emenda (R$):");
    const value = parseFloat(valueStr || '0');
    if (!value) return;
    const number = prompt("Número da Emenda (ex: 045/2025):");

    try {
      setLoading(true);
      const { error } = await supabase.from('amendments').insert({
        author_name: author,
        value: value,
        number: number,
        year: new Date().getFullYear(),
        status: 'pending'
      });

      if (error) throw error;
      alert("Emenda registrada com sucesso!");
      fetchAmendments();
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <FileText size={14} />
            <span>Gestão Unaí/MG • Decreto 7.259/2023</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Emendas Parlamentares</h2>
          <p className="text-gray-500 font-medium font-sans italic">"A transparência na execução da vontade do legislador."</p>
        </div>
        <button 
          onClick={handleCreate}
          className="px-8 py-4 bg-teal-800 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-teal-900 shadow-xl shadow-teal-900/20 flex items-center space-x-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Nova Indicação</span>
        </button>
      </header>

      {/* STATS CARDS DINÂMICOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Alocado', value: stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Indicações Indiretas', value: stats.indirectCount.toString().padStart(2, '0'), icon: User, color: 'text-blue-600' },
          { label: 'Pendentes', value: stats.pendingCount.toString().padStart(2, '0'), icon: Clock, color: 'text-red-600' },
          { label: 'Executadas', value: stats.executedCount.toString().padStart(2, '0'), icon: Scale, color: 'text-indigo-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-lg transition-all">
            <div className={`p-4 bg-gray-50 ${stat.color} rounded-2xl w-fit mb-6`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 truncate" title={stat.value}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-teal-600">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Carregando Emendas...</p>
             </div>
        ) : amendments.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <AlertCircle className="mb-4 opacity-50" size={48} />
                <p className="text-sm font-bold">Nenhuma emenda registrada.</p>
                <p className="text-xs">Use o botão "Nova Indicação" para começar.</p>
             </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Emenda / Autor</th>
                <th className="px-8 py-6">Tipo</th>
                <th className="px-8 py-6">Beneficiária (OSC)</th>
                <th className="px-8 py-6">Valor</th>
                <th className="px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {amendments.map((a) => (
                <tr key={a.id} className="hover:bg-teal-50/10 transition-colors">
                  <td className="px-8 py-8">
                    <div className="font-black text-gray-900">{a.number}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{a.author}</div>
                  </td>
                  <td className="px-8 py-8">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${a.indicationType === 'Direta' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                      {a.indicationType}
                    </span>
                  </td>
                  <td className="px-8 py-8 text-xs font-bold text-gray-600 italic">
                    {a.beneficiaryOSC || 'Aguardando Indicação'}
                  </td>
                  <td className="px-8 py-8 font-black text-teal-800">
                    {Number(a.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-8 py-8 text-right">
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-teal-800 hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AmendmentsModule;
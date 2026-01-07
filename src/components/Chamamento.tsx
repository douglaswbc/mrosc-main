import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, FileText, Calendar, Filter, ChevronRight, Clock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Chamamento } from '../types';

const ChamamentoModule: React.FC = () => {
  const [chamamentos, setChamamentos] = useState<Chamamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChamamentos();
  }, []);

  const fetchChamamentos = async () => {
    try {
      setLoading(true);
      // Busca editais e conta quantas parcerias (propostas) existem para cada um
      const { data, error } = await supabase
        .from('chamamentos')
        .select(`
          *,
          partnerships (count)
        `)
        .order('open_date', { ascending: false });

      if (error) throw error;

      // Mapeia do Banco (snake_case) para o Frontend (camelCase)
      const mappedData: Chamamento[] = (data || []).map((item: any) => ({
        id: item.id,
        editalNumber: item.number,
        object: item.title, // Usamos o título como objeto principal
        status: translateStatus(item.status),
        publishDate: new Date(item.open_date).toLocaleDateString('pt-BR'),
        deadlineDate: new Date(item.close_date).toLocaleDateString('pt-BR'),
        category: 'Geral', // Campo não existente no banco simples, fixado como Geral
        proposalsCount: item.partnerships?.[0]?.count || 0
      }));

      setChamamentos(mappedData);
    } catch (error) {
      console.error('Erro ao buscar chamamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para traduzir status do banco (enum) para texto legível
  const translateStatus = (status: string) => {
    const map: Record<string, any> = {
      'open': 'Aberto',
      'closed': 'Encerrado',
      'judging': 'Em Julgamento',
      'finished': 'Homologado'
    };
    return map[status] || status;
  };

  // Função Rápida para criar um Edital de Teste (já que não temos tela de cadastro de edital ainda)
  const handleCreateTestEdital = async () => {
    const number = prompt("Digite o número do Edital (ex: 001/2026):");
    if (!number) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('chamamentos').insert({
        number: number,
        title: `Edital de Fomento à Cultura e Esporte ${number}`,
        description: 'Seleção de projetos para fortalecimento das OSCs locais.',
        status: 'open',
        open_date: new Date(),
        close_date: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 dias
        budget: 150000.00
      });

      if (error) throw error;
      alert("Edital criado com sucesso!");
      fetchChamamentos(); // Recarrega a lista
    } catch (e: any) {
      alert("Erro ao criar: " + e.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <Megaphone size={14} />
            <span>Processos de Seleção Pública</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Chamamentos e Editais</h2>
          <p className="text-gray-500 font-medium">Gestão do fluxo seletivo conforme Art. 23 da Lei 13.019/14.</p>
        </div>
        <button 
          onClick={handleCreateTestEdital}
          className="px-6 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-900 shadow-xl shadow-teal-900/20 flex items-center space-x-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Edital</span>
        </button>
      </header>

      {/* Cards de Resumo (Estáticos por enquanto, ou poderiam ser calculados) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Editais Abertos', 'Em Julgamento', 'Homologados'].map((label, i) => {
             // Conta simples baseada no estado atual
             const count = chamamentos.filter(c => 
                (i === 0 && c.status === 'Aberto') || 
                (i === 1 && c.status === 'Em Julgamento') || 
                (i === 2 && c.status === 'Homologado')
             ).length;
             
             return (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                  <h4 className="text-2xl font-black text-gray-900">0{count}</h4>
                </div>
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                  <FileText size={20} />
                </div>
              </div>
            );
        })}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar edital..." 
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-teal-500/10 w-64"
            />
          </div>
          <div className="flex space-x-2">
            <button className="p-3 text-gray-400 hover:text-teal-600 transition-colors"><Filter size={18} /></button>
          </div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-teal-600">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Buscando Editais...</p>
           </div>
        ) : chamamentos.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <AlertCircle className="mb-4" size={32} />
              <p className="text-sm font-medium">Nenhum edital publicado.</p>
              <p className="text-xs mt-2">Clique em "Novo Edital" para criar o primeiro.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Nº Edital / Categoria</th>
                  <th className="px-8 py-6">Objeto da Seleção</th>
                  <th className="px-8 py-6">Status Atual</th>
                  <th className="px-8 py-6">Prazo Final</th>
                  <th className="px-8 py-6 text-right">Propostas</th>
                  <th className="px-8 py-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {chamamentos.map((c) => (
                  <tr key={c.id} className="group hover:bg-teal-50/20 transition-all cursor-pointer">
                    <td className="px-8 py-7">
                      <div className="font-black text-teal-900 text-sm">{c.editalNumber}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">{c.category}</div>
                    </td>
                    <td className="px-8 py-7">
                      <p className="text-xs font-medium text-gray-600 max-w-xs leading-relaxed line-clamp-2" title={c.object}>{c.object}</p>
                    </td>
                    <td className="px-8 py-7">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                        c.status === 'Aberto' ? 'bg-green-50 text-green-700 border-green-100' : 
                        c.status === 'Em Julgamento' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                        <Clock size={14} className="text-gray-400" />
                        <span>{c.deadlineDate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                       <span className="text-xs font-bold text-gray-600">{c.proposalsCount || 0}</span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <button className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChamamentoModule;
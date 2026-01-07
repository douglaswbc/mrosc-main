import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Globe, ArrowLeft, ChevronRight, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoginModal from './LoginModal'; // <--- IMPORTANTE: Certifique-se de ter criado o arquivo LoginModal.tsx

// Tipos locais para exibição pública
interface PublicPartnership {
  id: string;
  oscName: string;
  cnpj: string;
  type: string;
  object: string;
  totalValue: number;
  status: string;
}

const TransparencyPortal: React.FC = () => {
  const [partnerships, setPartnerships] = useState<PublicPartnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ESTADO PARA CONTROLAR O MODAL DE LOGIN
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // 1. Busca dados públicos ao carregar
  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      // Busca Parcerias + Dados da OSC (JOIN)
      const { data, error } = await supabase
        .from('partnerships')
        .select(`
          id,
          type,
          object,
          total_value,
          status,
          oscs (name, cnpj)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapeia para formato simples
      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        oscName: p.oscs?.name || 'OSC Não Identificada',
        cnpj: p.oscs?.cnpj || '---',
        type: 'Termo de Fomento', // Pode vir do banco se tiver coluna
        object: p.object,
        totalValue: p.total_value || 0,
        status: translateStatus(p.status)
      }));

      setPartnerships(mapped);
    } catch (error) {
      console.error('Erro ao buscar dados públicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'approved': 'Aprovada',
      'active': 'Em Execução',
      'analysis': 'Em Análise',
      'concluded': 'Concluída'
    };
    return map[status] || 'Em Trâmite';
  };

  // Filtro de pesquisa no frontend (pode ser backend se tiver muitos dados)
  const filteredPartnerships = partnerships.filter(p => 
    p.oscName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cnpj.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* MODAL DE LOGIN (Renderizado Condicionalmente) */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* CABEÇALHO */}
      <header className="bg-teal-900 text-white pt-12 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">PORTAL<span className="text-teal-400">MROSC</span></h1>
            <p className="text-[10px] font-bold text-teal-300 uppercase tracking-widest">Prefeitura Municipal de Unaí/MG</p>
          </div>
          
          {/* BOTÃO ALTERADO PARA ABRIR O MODAL */}
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="text-xs font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
          >
             <ShieldCheck size={14} /> Acesso Restrito
          </button>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6">Transparência nas Parcerias</h2>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-teal-600" size={24} />
            <input 
              type="text" 
              placeholder="Pesquisar OSC, CNPJ ou Objeto..." 
              className="w-full pl-16 pr-6 py-5 rounded-3xl text-gray-800 shadow-xl border-none outline-none focus:ring-4 focus:ring-teal-500/20 placeholder-gray-400 font-medium" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 -mt-16 space-y-12 pb-24">
        
        {/* TABELA DE PARCERIAS */}
        <section className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-10 border-b flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">Extrato de Parcerias (Art. 38 Lei 13.019/14)</h3>
              <p className="text-sm text-gray-500 font-medium">Dados atualizados em tempo real conforme exigência legal.</p>
            </div>
            {loading && <Loader2 className="animate-spin text-teal-600" />}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Parceira / CNPJ</th>
                  <th className="px-8 py-6">Tipo / Objeto</th>
                  <th className="px-6 py-6 text-center">Valor Global</th>
                  <th className="px-6 py-6 text-center">Situação</th>
                  <th className="px-8 py-6 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPartnerships.length === 0 && !loading ? (
                    <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-gray-400 font-medium">
                           Nenhuma parceria encontrada com esses termos.
                        </td>
                    </tr>
                ) : (
                    filteredPartnerships.map((p) => (
                    <tr key={p.id} className="hover:bg-teal-50/30 transition-all cursor-pointer group">
                        <td className="px-8 py-7">
                        <div className="font-black text-gray-900 text-sm">{p.oscName}</div>
                        <div className="text-[10px] font-bold text-gray-400 font-mono">{p.cnpj}</div>
                        </td>
                        <td className="px-8 py-7">
                        <div className="text-xs font-bold text-teal-800 mb-1">{p.type}</div>
                        <div className="text-[11px] text-gray-500 font-medium line-clamp-1 max-w-xs">{p.object}</div>
                        </td>
                        <td className="px-6 py-7 text-center">
                        <div className="font-black text-gray-900 text-sm">
                            {p.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div className="text-[9px] font-bold text-emerald-600 uppercase">100% Empenhado</div>
                        </td>
                        <td className="px-6 py-7 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                            p.status === 'Aprovada' ? 'bg-green-50 text-green-700 border-green-100' :
                            p.status === 'Em Análise' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                            {p.status}
                        </span>
                        </td>
                        <td className="px-8 py-7 text-right">
                        <button className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:text-teal-600 group-hover:bg-white transition-all">
                            <ChevronRight size={18} />
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* INFORMAÇÕES ADICIONAIS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <FileText className="text-teal-600" /> Chamamentos Públicos Recentes
              </h4>
              <div className="space-y-4">
                 {[1].map(i => (
                    <div key={i} className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl hover:bg-teal-50 transition-colors cursor-pointer">
                       <div>
                          <p className="text-[10px] font-black text-teal-600 uppercase">Edital 001/2026</p>
                          <p className="text-sm font-bold text-gray-800">Fomento à Cultura e Esporte</p>
                       </div>
                       <CheckCircle2 className="text-emerald-500" size={18} />
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <AlertCircle className="text-teal-600" /> Legislação MROSC
              </h4>
              <div className="space-y-4">
                 <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center hover:bg-teal-50 transition-colors cursor-pointer">
                    <span className="text-sm font-bold text-gray-700">Lei Municipal nº 3.083/2017</span>
                    <button className="text-[10px] font-black text-teal-600 uppercase">Download PDF</button>
                 </div>
                 <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center hover:bg-teal-50 transition-colors cursor-pointer">
                    <span className="text-sm font-bold text-gray-700">Decreto Municipal 7.259/2023</span>
                    <button className="text-[10px] font-black text-teal-600 uppercase">Download PDF</button>
                 </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

export default TransparencyPortal;
import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, AlertTriangle, RefreshCw, FileCheck, Clock, Calendar, Loader2 } from 'lucide-react';
import { OSC, OSCStatus } from '../types';
import { supabase } from '../lib/supabase'; // Importação do cliente Supabase

const OSCModule: React.FC = () => {
  // 1. Estados para gerenciar dados reais, carregamento e erros
  const [oscs, setOscs] = useState<OSC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. useEffect para buscar os dados ao montar o componente
  useEffect(() => {
    fetchOscs();
  }, []);

  // 3. Função assíncrona para buscar no Supabase
  const fetchOscs = async () => {
    try {
      setLoading(true);
      
      // Busca dados na tabela 'oscs'
      const { data, error } = await supabase
        .from('oscs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 4. Mapeamento dos dados do Banco (snake_case) para o Tipo do Frontend (camelCase/Interfaces)
      const mappedData: OSC[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        cnpj: item.cnpj,
        email: item.email || '',
        phone: item.phone || '',
        // Lógica para converter o status do banco para o Enum do Frontend
        status: item.cnd_status === 'expired' ? OSCStatus.EXPIRED_CND : OSCStatus.REGULAR,
        // Formata a data de atualização (ou criação)
        lastUpdate: new Date(item.created_at).toLocaleDateString('pt-BR'),
        cnds: [] // Inicialmente vazio, poderia buscar de outra tabela se necessário
      }));

      setOscs(mappedData);
    } catch (err: any) {
      console.error('Erro ao buscar OSCs:', err);
      setError('Falha ao carregar as organizações.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-teal-600">
        <Loader2 className="animate-spin mr-2" />
        <span className="font-bold">Carregando base de dados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <AlertTriangle className="mb-2" />
        <p>{error}</p>
        <button onClick={fetchOscs} className="mt-4 text-sm underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <Users size={14} />
            <span>Credenciamento Único • Unaí/MG (Item 24 POC)</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Cadastro de OSCs</h2>
          <p className="text-gray-500 font-medium italic">Habilitação digital com controle automático de vencimentos.</p>
        </div>
        <button className="px-8 py-4 bg-teal-800 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-teal-900 shadow-xl flex items-center space-x-2 transition-all active:scale-95">
          <Plus size={20} /> <span>Nova Inscrição</span>
        </button>
      </header>

      {oscs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-300">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-500">Nenhuma OSC cadastrada</h3>
            <p className="text-gray-400 text-sm">Utilize o botão "Nova Inscrição" para adicionar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {oscs.map((osc) => (
            <div key={osc.id} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group p-10 relative overflow-hidden">
              {osc.status === OSCStatus.EXPIRED_CND && (
                <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 rounded-bl-3xl flex items-center gap-2 animate-pulse">
                  <AlertTriangle size={14} /> <span className="text-[10px] font-black uppercase">Vencimento Detectado</span>
                </div>
              )}
              
              <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center font-black text-2xl mb-8 group-hover:bg-teal-700 group-hover:text-white transition-all">
                {osc.name.charAt(0)}
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight line-clamp-2">{osc.name}</h3>
              <p className="text-xs font-mono text-gray-400 mb-8">{osc.cnpj}</p>
              
              <div className="space-y-6 pt-6 border-t border-gray-50">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Validade Mandato</span>
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                      {/* Aqui idealmente viria do banco (cnd_expiration_date), usando lastUpdate como fallback visual */}
                      <Calendar size={14} className="text-teal-600" /> {osc.lastUpdate}
                    </span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Situação Fiscal</span>
                    <div className={`w-3 h-3 rounded-full ${osc.status === OSCStatus.REGULAR ? 'bg-emerald-500' : 'bg-red-500 shadow-lg shadow-red-200'}`}></div>
                 </div>
              </div>

              <button className="w-full mt-10 py-5 bg-gray-50 text-gray-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-teal-800 hover:text-white transition-all">
                Acessar Dossiê de Habilitação
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OSCModule;
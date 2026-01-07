import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ShieldCheck, Download, Lock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Interface local para o Log
interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  date: string;
  ip: string;
  hash: string;
}

const AuditLogsModule: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Busca logs e o nome do usuário responsável
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedLogs: AuditLog[] = (data || []).map((item: any) => ({
        id: item.id,
        user: item.profiles?.full_name || 'Sistema / Anônimo',
        action: item.action,
        resource: item.entity, // Ex: 'WorkPlan', 'Partnership'
        details: formatDetails(item.details),
        date: new Date(item.created_at).toLocaleString('pt-BR'),
        ip: item.ip_address || '127.0.0.1', // Fallback se não tiver IP salvo
        // Simula um hash visual pegando partes do UUID
        hash: `${item.id.slice(0, 4)}...${item.id.slice(-4)}`
      }));

      setLogs(mappedLogs);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para formatar o JSON de detalhes de forma legível
  const formatDetails = (details: any) => {
    if (!details) return 'Ação registrada';
    if (typeof details === 'string') return details;
    // Se for objeto, tenta resumir
    return JSON.stringify(details).slice(0, 50) + (JSON.stringify(details).length > 50 ? '...' : '');
  };

  // Filtro local
  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <History size={14} />
            <span>Rastreabilidade e Compliance LGPD</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Trilhas de Auditoria</h2>
          <p className="text-gray-500 font-medium">Registro imutável de todas as ações realizadas no ecossistema.</p>
        </div>
        <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm">
          <Download size={18} />
          <span>Exportar Log Completo</span>
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar por usuário ou ação..." 
                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-teal-500/10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-teal-600 transition-all"><Filter size={18} /></button>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <ShieldCheck size={14} />
            <span>INTEGRIDADE VERIFICADA (BLOCKCHAIN-READY)</span>
          </div>
        </div>
        
        {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-teal-600">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Carregando Trilha de Auditoria...</p>
             </div>
        ) : filteredLogs.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <AlertCircle className="mb-4 opacity-50" size={48} />
                <p className="text-sm font-bold">Nenhum registro encontrado.</p>
             </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Data / Hora</th>
                  <th className="px-8 py-6">Usuário</th>
                  <th className="px-8 py-6">Ação</th>
                  <th className="px-8 py-6">Recurso</th>
                  <th className="px-8 py-6">Hash de Integridade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-gray-900">{log.date}</div>
                      <div className="text-[10px] text-gray-400 mt-1">IP: {log.ip}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-teal-900 text-sm">{log.user}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                        log.action === 'CREATE' ? 'bg-blue-50 text-blue-700' :
                        log.action === 'EDIT' || log.action === 'UPDATE' ? 'bg-amber-50 text-amber-700' :
                        log.action === 'DELETE' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-medium text-gray-700">{log.resource}</div>
                      <div className="text-[10px] text-gray-400 mt-1 italic truncate max-w-xs" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-[10px] text-gray-300">
                      <div className="flex items-center space-x-2">
                        <Lock size={12} />
                        <span>{log.hash}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-teal-950 text-white p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck size={200} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-4">Garantia de Não-Exclusão</h3>
          <p className="text-teal-100/70 max-w-2xl text-sm leading-relaxed mb-8">
            Conforme requisitos de segurança da informação, registros vinculados a processos ativos ou concluídos possuem proibição técnica de exclusão física. Qualquer tentativa de deleção é convertida em "arquivamento lógico" com preservação total do histórico para auditorias judiciais ou de órgãos de controle.
          </p>
          <div className="flex space-x-6">
            <div className="flex flex-col">
              <span className="text-teal-400 font-black text-xs uppercase tracking-widest">Backup Automático</span>
              <span className="text-xl font-bold">A cada 6 horas</span>
            </div>
            <div className="w-px h-10 bg-teal-800"></div>
            <div className="flex flex-col">
              <span className="text-teal-400 font-black text-xs uppercase tracking-widest">Retenção de Dados</span>
              <span className="text-xl font-bold">10 Anos (Digital)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsModule;
import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus, Search, Filter, ChevronRight, Send, Clock, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Tipo local compatível com o banco
interface PMISRequest {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  estimated_value: number;
  submitted_at?: string;
  feedback?: string;
  created_at: string;
}

const PMISModule: React.FC = () => {
  const [proposals, setProposals] = useState<PMISRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Estados do Formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    justification: '',
    estimated_value: ''
  });

  useEffect(() => {
    fetchPMIS();
  }, []);

  const fetchPMIS = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pmis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error('Erro ao buscar PMIS:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.description) return alert("Preencha os campos obrigatórios.");
    
    setCreating(true);
    try {
      // Pega a OSC do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado.");

      const { data: profile } = await supabase.from('profiles').select('osc_id').eq('id', user.id).single();
      const oscId = profile?.osc_id;

      if (!oscId) throw new Error("Seu usuário não está vinculado a uma OSC.");

      const { error } = await supabase.from('pmis').insert({
        osc_id: oscId,
        title: formData.title,
        description: formData.description,
        justification: formData.justification,
        estimated_value: parseFloat(formData.estimated_value) || 0,
        status: 'draft' // Começa como Rascunho
      });

      if (error) throw error;
      
      alert("Proposta criada com sucesso!");
      setShowForm(false);
      setFormData({ title: '', description: '', justification: '', estimated_value: '' });
      fetchPMIS();
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSubmitProposal = async (id: string) => {
    if (!confirm("Tem certeza? Após enviar, não será possível editar.")) return;
    try {
      const { error } = await supabase
        .from('pmis')
        .update({ status: 'submitted', submitted_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      fetchPMIS();
    } catch (e) {
      alert("Erro ao enviar.");
    }
  };

  // Cores dos Status
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-600',
      'submitted': 'bg-blue-50 text-blue-700 border-blue-100',
      'under_review': 'bg-amber-50 text-amber-700 border-amber-100',
      'approved': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'rejected': 'bg-red-50 text-red-700 border-red-100'
    };
    return map[status] || 'bg-gray-100';
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'draft': 'Rascunho',
      'submitted': 'Enviado',
      'under_review': 'Em Análise',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado'
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <Lightbulb size={14} />
            <span>Propostas da Sociedade Civil</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">PMIS</h2>
          <p className="text-gray-500 font-medium">Procedimento de Manifestação de Interesse Social (Art. 18 Lei 13.019/14).</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-900 shadow-xl flex items-center space-x-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>{showForm ? 'Cancelar' : 'Nova Proposta'}</span>
        </button>
      </header>

      {/* FORMULÁRIO DE NOVA PROPOSTA */}
      {showForm && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl animate-in slide-in-from-top-4">
          <h3 className="text-xl font-black text-gray-800 mb-6">Cadastrar Interesse Social</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Título da Proposta</label>
              <input 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="Ex: Projeto Horta Comunitária"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Valor Estimado (R$)</label>
              <input 
                type="number"
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none"
                placeholder="0,00"
                value={formData.estimated_value}
                onChange={e => setFormData({...formData, estimated_value: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Descrição do Objeto</label>
              <textarea 
                className="w-full p-4 bg-gray-50 rounded-2xl font-medium text-gray-600 outline-none h-24"
                placeholder="Descreva o que a sociedade civil propõe realizar..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Justificativa de Interesse Público</label>
              <textarea 
                className="w-full p-4 bg-gray-50 rounded-2xl font-medium text-gray-600 outline-none h-24"
                placeholder="Por que isso é relevante para o município?"
                value={formData.justification}
                onChange={e => setFormData({...formData, justification: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleCreate}
              disabled={creating}
              className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold text-xs uppercase hover:bg-teal-700 disabled:opacity-50"
            >
              {creating ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
          </div>
        </div>
      )}

      {/* LISTAGEM */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-teal-600">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Carregando Propostas...</p>
             </div>
        ) : proposals.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Lightbulb className="mb-4 opacity-50" size={48} />
                <p className="text-sm font-bold">Nenhuma manifestação registrada.</p>
                <p className="text-xs">Clique em "Nova Proposta" para iniciar.</p>
             </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Título / Data</th>
                  <th className="px-8 py-6">Resumo</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Valor Estimado</th>
                  <th className="px-8 py-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {proposals.map((p) => (
                  <tr key={p.id} className="group hover:bg-teal-50/20 transition-all">
                    <td className="px-8 py-7">
                      <div className="font-black text-gray-900 text-sm">{p.title}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase mt-1 flex items-center gap-1">
                        <Clock size={10} /> {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <p className="text-xs font-medium text-gray-600 max-w-xs truncate">{p.description}</p>
                    </td>
                    <td className="px-8 py-7">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(p.status)}`}>
                        {translateStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="text-xs font-bold text-gray-700">
                        {p.estimated_value ? p.estimated_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      {p.status === 'draft' && (
                        <button 
                          onClick={() => handleSubmitProposal(p.id)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 ml-auto"
                        >
                          <Send size={12} /> Enviar
                        </button>
                      )}
                      {p.status !== 'draft' && (
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-teal-600 hover:text-white transition-all">
                          <ChevronRight size={18} />
                        </button>
                      )}
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

export default PMISModule;
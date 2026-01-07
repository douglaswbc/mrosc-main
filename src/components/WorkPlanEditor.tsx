import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowLeft, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateWorkPlanSuggestion } from '../services/gemini'; // Importando serviço de IA

const WorkPlanEditor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Estado unificado do formulário
  const [formData, setFormData] = useState({
    oscName: '',
    oscCnpj: '',
    oscId: '',
    object: '', // Passo 2
    justification: '', // Passo 2
    goals: [] as { id: string; description: string; target: string; indicator: string }[], // Passo 3
  });

  // 1. Ao abrir, busca dados da OSC logada
  useEffect(() => {
    fetchOscData();
  }, []);

  const fetchOscData = async () => {
    try {
      // Pega usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pega perfil e OSC vinculada
      const { data: profile } = await supabase
        .from('profiles')
        .select('osc_id, oscs(name, cnpj)')
        .eq('id', user.id)
        .single();

      if (profile?.oscs) {
        setFormData(prev => ({
          ...prev,
          oscName: (profile.oscs as any).name,
          oscCnpj: (profile.oscs as any).cnpj,
          oscId: profile.osc_id
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados da OSC:', error);
    }
  };

  // Funções de Metas (Passo 3)
  const addGoal = () => {
    const newGoal = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'Nova meta a definir',
      target: '0',
      indicator: 'Unidade'
    };
    setFormData(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const removeGoal = (id: string) => {
    setFormData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  const updateGoal = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, [field]: value } : g)
    }));
  };

  // Função da IA (Gemini)
  const handleAiSuggestion = async () => {
    if (!formData.object) {
      alert('Preencha o "Objeto" no passo 2 para a IA entender o contexto!');
      setActiveStep(2);
      return;
    }
    setAiLoading(true);
    try {
      // Chama o serviço do Gemini (simulado ou real)
      const suggestion = await generateWorkPlanSuggestion(formData.object);
      if (suggestion) {
        setFormData(prev => ({
          ...prev,
          justification: suggestion.justification || prev.justification,
          goals: [...prev.goals, ...(suggestion.goals || [])]
        }));
        alert('Sugestão gerada com sucesso! Verifique a Justificativa e as Metas.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar sugestão. Verifique sua chave de API.');
    } finally {
      setAiLoading(false);
    }
  };

  // Função Finalizar e Enviar
  const handleSave = async () => {
    if (!formData.object) return alert('O Objeto é obrigatório.');
    
    setLoading(true);
    try {
      // 1. Cria a Parceria (Status: Proposta)
      const { data: partnership, error: partError } = await supabase
        .from('partnerships')
        .insert({
          osc_id: formData.oscId, // ID real da OSC
          object: formData.object,
          status: 'proposal',
          total_value: 0, // Será somado do cronograma depois
          start_date: new Date(),
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // +1 ano default
        })
        .select()
        .single();

      if (partError) throw partError;

      // 2. Salva o Plano de Trabalho (JSON completo) linked à Parceria
      const { error: planError } = await supabase
        .from('work_plans')
        .insert({
          partnership_id: partnership.id,
          title: `Plano de Trabalho - ${formData.object}`,
          status: 'sent',
          version: 1,
          content: {
            justification: formData.justification,
            goals: formData.goals,
            // Cronograma financeiro viria aqui no passo 4
          }
        });

      if (planError) throw planError;

      alert('Plano de Trabalho enviado com sucesso!');
      onBack(); // Volta para a lista
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
      <header className="flex justify-between items-end">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="p-4 bg-white rounded-2xl border border-gray-100 text-teal-800 hover:bg-teal-50 transition-all">
              <ArrowLeft size={20} />
           </button>
           <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Novo Plano de Trabalho</h2>
              <p className="text-gray-500 font-medium italic">"Modelo Padrão MROSC Unaí/MG"</p>
           </div>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleAiSuggestion}
             disabled={aiLoading}
             className="px-8 py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3 hover:bg-indigo-100 transition-all disabled:opacity-50"
           >
              {aiLoading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />} 
              {aiLoading ? 'Gerando...' : 'Sugestão por IA'}
           </button>
           <button 
             onClick={handleSave}
             disabled={loading}
             className="px-8 py-4 bg-teal-800 text-white rounded-2xl font-black text-[10px] uppercase shadow-2xl flex items-center gap-3 hover:bg-teal-900 transition-all disabled:opacity-50"
           >
              {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
              {loading ? 'Salvando...' : 'Finalizar e Enviar'}
           </button>
        </div>
      </header>

      <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
         {['1. Identificação', '2. Objeto e Justificativa', '3. Metas e Indicadores', '4. Cronograma Financeiro', '5. Anexos Técnicos'].map((step, i) => (
            <div key={i} onClick={() => setActiveStep(i+1)} className={`shrink-0 px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all border-2 ${activeStep === i+1 ? 'bg-teal-800 text-white border-teal-800 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-teal-200'}`}>
               {step}
            </div>
         ))}
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-16 relative min-h-[500px]">
         <div className="absolute top-12 right-16 flex items-center gap-3 grayscale opacity-40">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-black text-[10px]">BRS</div>
            <span className="text-[9px] font-black uppercase text-gray-400">Brasão de Unaí</span>
         </div>

         {/* PASSO 1: IDENTIFICAÇÃO */}
         {activeStep === 1 && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome da Instituição</label>
                     <input 
                        type="text" 
                        readOnly
                        className="w-full p-6 bg-gray-50 rounded-3xl border-none outline-none font-bold text-gray-500 cursor-not-allowed" 
                        value={formData.oscName || 'Carregando...'} 
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">CNPJ Oficial</label>
                     <input 
                        type="text" 
                        readOnly
                        className="w-full p-6 bg-gray-50 rounded-3xl border-none outline-none font-bold text-gray-500 cursor-not-allowed" 
                        value={formData.oscCnpj || '...'} 
                     />
                  </div>
               </div>
               <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <CheckCircle className="text-amber-600 shrink-0" size={24} />
                  <p className="text-xs text-amber-800 font-medium">Os dados acima foram importados do Cadastro Único da OSC (Supabase). Caso estejam desatualizados, realize a alteração no módulo de Registro.</p>
               </div>
            </div>
         )}

         {/* PASSO 2: OBJETO (Adicionado pois era necessário para salvar) */}
         {activeStep === 2 && (
             <div className="space-y-8 animate-in fade-in duration-500">
                 <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Objeto da Parceria</label>
                     <textarea 
                        className="w-full p-6 bg-gray-50 rounded-3xl border-none outline-none font-bold text-gray-800 focus:ring-4 focus:ring-teal-500/10 min-h-[100px]"
                        placeholder="Descreva o que será realizado (Ex: Projeto Música para Todos)"
                        value={formData.object}
                        onChange={e => setFormData({...formData, object: e.target.value})}
                     />
                 </div>
                 <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Justificativa</label>
                     <textarea 
                        className="w-full p-6 bg-gray-50 rounded-3xl border-none outline-none text-sm text-gray-600 focus:ring-4 focus:ring-teal-500/10 min-h-[200px]"
                        placeholder="Por que este projeto é importante para Unaí?"
                        value={formData.justification}
                        onChange={e => setFormData({...formData, justification: e.target.value})}
                     />
                 </div>
             </div>
         )}

         {/* PASSO 3: METAS */}
         {activeStep === 3 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black text-gray-900 tracking-tighter">Detalhamento de Metas</h4>
                  <button onClick={addGoal} className="p-4 bg-teal-50 text-teal-700 rounded-2xl hover:bg-teal-700 hover:text-white transition-all">
                     <Plus size={24} />
                  </button>
               </div>
               
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {formData.goals.length === 0 && (
                      <p className="text-center text-gray-400 py-10 italic">Nenhuma meta definida. Adicione manualmente ou use a IA.</p>
                  )}
                  
                  {formData.goals.map((goal, i) => (
                    <div key={goal.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-6 w-full">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-teal-800 shadow-sm shrink-0">0{i+1}</div>
                          <div className="w-full">
                             <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Descrição da Meta</p>
                             <input 
                                type="text"
                                className="bg-transparent border-b border-gray-200 w-full font-bold text-gray-800 focus:border-teal-500 outline-none pb-1"
                                value={goal.description}
                                onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                             />
                          </div>
                       </div>
                       <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-400 uppercase">Meta / Indicador</p>
                             <div className="flex gap-2 justify-end">
                                <input 
                                    className="w-16 text-right bg-transparent border-b border-gray-200 font-bold text-xs" 
                                    value={goal.target}
                                    onChange={(e) => updateGoal(goal.id, 'target', e.target.value)}
                                />
                                <input 
                                    className="w-24 bg-transparent border-b border-gray-200 text-xs text-gray-500" 
                                    value={goal.indicator}
                                    onChange={(e) => updateGoal(goal.id, 'indicator', e.target.value)}
                                />
                             </div>
                          </div>
                          <button onClick={() => removeGoal(goal.id)} className="p-3 text-red-300 hover:text-red-600 transition-colors">
                             <Trash2 size={20} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default WorkPlanEditor;
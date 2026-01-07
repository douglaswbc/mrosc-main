
import React, { useState } from 'react';
import { Save, FileText, Plus, Trash2, ArrowLeft, Image as ImageIcon, Sparkles, CheckCircle } from 'lucide-react';

const WorkPlanEditor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState(1);

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
           <button className="px-8 py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-[10px] uppercase flex items-center gap-3">
              <Sparkles size={16} /> Sugestão por IA
           </button>
           <button className="px-8 py-4 bg-teal-800 text-white rounded-2xl font-black text-[10px] uppercase shadow-2xl flex items-center gap-3">
              <Save size={16} /> Finalizar e Enviar
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

      <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-16 relative">
         <div className="absolute top-12 right-16 flex items-center gap-3 grayscale opacity-40">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-black text-[10px]">BRS</div>
            <span className="text-[9px] font-black uppercase text-gray-400">Brasão de Unaí</span>
         </div>

         {activeStep === 1 && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome da Instituição</label>
                     <input type="text" className="w-full p-6 bg-gray-50 rounded-3xl border-none outline-none font-bold text-gray-800 focus:ring-4 focus:ring-teal-500/10 transition-all" defaultValue="Instituto Futuro Melhor" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">CNPJ Oficial</label>
                     <input type="text" className="w-full p-6 bg-gray-50 rounded-3xl border-none outline-none font-bold text-gray-800" defaultValue="12.345.678/0001-90" />
                  </div>
               </div>
               <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <CheckCircle className="text-amber-600 shrink-0" size={24} />
                  <p className="text-xs text-amber-800 font-medium">Os dados acima foram importados do Cadastro Único da OSC. Caso estejam desatualizados, realize a alteração no módulo de Registro.</p>
               </div>
            </div>
         )}

         {activeStep === 3 && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black text-gray-900 tracking-tighter">Detalhamento de Metas</h4>
                  <button className="p-4 bg-teal-50 text-teal-700 rounded-2xl hover:bg-teal-700 hover:text-white transition-all">
                     <Plus size={24} />
                  </button>
               </div>
               <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-teal-800 shadow-sm">0{i}</div>
                          <div>
                             <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Descrição da Meta</p>
                             <p className="font-bold text-gray-800">Oficina de Capacitação em {i === 1 ? 'Música' : 'Teatro'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-400 uppercase">Indicador</p>
                             <p className="text-xs font-bold">Aulas Realizadas</p>
                          </div>
                          <button className="p-3 text-red-300 hover:text-red-600 transition-colors">
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

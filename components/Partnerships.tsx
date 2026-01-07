
import React, { useState } from 'react';
import { 
  Plus, Search, Filter, ChevronRight, FileSignature, ArrowLeft, Edit, Eye,
  ClipboardList, CheckCircle, FileText, AlertTriangle
} from 'lucide-react';
// Corrected imports: UserRole comes from types.ts, User from services/authContext.tsx
import { PartnershipStatus, Partnership, UserRole } from '../types';
import { User } from '../services/authContext';
import WorkPlanEditor from './WorkPlanEditor';

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
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');

  const mockPartnerships: Partnership[] = [
    {
      id: '1', title: 'Projeto Sopa Amiga - Distribuição Alimentar', oscId: 'osc_01',
      type: 'Termo de Fomento', status: PartnershipStatus.EXECUTION, totalValue: 250000,
      startDate: '2023-01-01', endDate: '2023-12-31', workPlanVersion: 1,
      goals: [{ id: 'g1', description: 'Distribuição de refeições', target: '12000', progress: 65, status: 'Em Andamento' }],
      tranches: []
    },
    {
      id: '2', title: 'Escola de Artes - Município Criativo', oscId: 'osc_02',
      type: 'Termo de Colaboração', status: PartnershipStatus.CELEBRATION, totalValue: 120000,
      startDate: '2023-06-01', endDate: '2024-06-01', workPlanVersion: 2,
      goals: [],
      tranches: []
    }
  ];

  if (view === 'create') {
    return <WorkPlanEditor onBack={() => setView('list')} />;
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mockPartnerships.map(p => (
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
                <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tight leading-tight">{p.title}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10">{p.type}</p>
                <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Valor Global</span>
                      <div className="font-black text-gray-900">R$ {p.totalValue.toLocaleString()}</div>
                   </div>
                   <div className="text-right space-y-1">
                      <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Versão</span>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">V0{p.workPlanVersion}</div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right duration-500 pb-20">
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
                    <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mt-2">{selectedPartnership?.type} • ID #PRT-00{selectedPartnership?.id}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <CheckCircle className="text-teal-600 mb-4" size={24} />
                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Execução Física</h5>
                    <p className="text-xl font-black text-gray-900">65% Concluído</p>
                 </div>
                 <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <ClipboardList className="text-blue-600 mb-4" size={24} />
                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Status Contas</h5>
                    <p className="text-xl font-black text-gray-900">Em Análise</p>
                 </div>
                 <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
                    <AlertTriangle className="text-amber-600 mb-4" size={24} />
                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Vigência</h5>
                    <p className="text-xl font-black text-gray-900">62 Dias Restantes</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipsModule;
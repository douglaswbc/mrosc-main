
import React, { useState } from 'react';
import { FileText, Search, Plus, User, Calendar, DollarSign, Scale, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Amendment } from '../types';

const AmendmentsModule: React.FC = () => {
  const amendments: Amendment[] = [
    { 
      id: '1', number: '012/2023', author: 'Ver. Ana Silva', value: 150000, year: 2023, 
      description: 'Aquisição de materiais esportivos.', type: 'Impositiva', indicationType: 'Direta',
      legalDeadline: '30/11/2023', status: 'Vinculada', beneficiaryOSC: 'OSC Futuro'
    },
    { 
      id: '2', number: '045/2023', author: 'Ver. João Souza', value: 300000, year: 2023, 
      description: 'Manutenção de creches setor norte.', type: 'Impositiva', indicationType: 'Indireta',
      legalDeadline: '15/11/2023', status: 'Pendente'
    }
  ];

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
        <button className="px-8 py-4 bg-teal-800 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-teal-900 shadow-xl shadow-teal-900/20 flex items-center space-x-2 transition-all active:scale-95">
          <Plus size={20} />
          <span>Nova Indicação</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Alocado', value: 'R$ 1.65M', icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Indicações Indiretas', value: '04', icon: User, color: 'text-blue-600' },
          { label: 'Prazos (LOM)', value: '02', icon: Clock, color: 'text-red-600' },
          { label: 'Executadas', value: '08', icon: Scale, color: 'text-indigo-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-lg transition-all">
            <div className={`p-4 bg-gray-50 ${stat.color} rounded-2xl w-fit mb-6`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden">
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
                  R$ {a.value.toLocaleString()}
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
      </div>
    </div>
  );
};

export default AmendmentsModule;

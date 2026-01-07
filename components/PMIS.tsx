
import React from 'react';
import { Briefcase, Plus, Search, CheckCircle2, XCircle, Clock, ChevronRight, Eye } from 'lucide-react';

const PMISModule: React.FC = () => {
  const items = [
    { id: '1', title: 'Educação para Jovens em Risco', osc: 'OSC Vida Nova', date: '20/10/2023', status: 'Análise' },
    { id: '2', title: 'Horta Comunitária Zona Sul', osc: 'Verde Cidade', date: '15/10/2023', status: 'Decidido' },
    { id: '3', title: 'Apoio a Idosos Abandonados', osc: 'Assoc. Terceira Idade', date: '10/10/2023', status: 'Publicado' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <Briefcase size={14} />
            <span>Participação Social e Iniciativa OSC</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">PMIS</h2>
          <p className="text-gray-500 font-medium">Procedimento de Manifestação de Interesse Social (Art. 18 Lei 13.019/14).</p>
        </div>
        <button className="px-6 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-900 shadow-xl flex items-center space-x-2">
          <Plus size={18} />
          <span>Cadastrar PMIS</span>
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 bg-gray-50 border-b flex justify-between items-center">
          <h4 className="text-lg font-black text-gray-900">Propostas Recebidas</h4>
          <div className="flex space-x-2">
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">03 Novas Propostas</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Título da Manifestação</th>
                <th className="px-8 py-6">Instituição Proponente</th>
                <th className="px-8 py-6">Data de Envio</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-teal-50/10 transition-colors cursor-pointer group">
                  <td className="px-8 py-7">
                    <div className="font-black text-gray-900 text-sm">{p.title}</div>
                  </td>
                  <td className="px-8 py-7">
                    <span className="text-xs font-bold text-teal-700">{p.osc}</span>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center space-x-2 text-xs font-medium text-gray-500">
                      <Clock size={14} />
                      <span>{p.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                      p.status === 'Análise' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      p.status === 'Decidido' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PMISModule;

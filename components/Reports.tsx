
import React from 'react';
import { 
  BarChartHorizontal, 
  Download, 
  Filter, 
  FilePieChart, 
  FileSpreadsheet, 
  FileJson, 
  Database,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

const ReportsModule: React.FC = () => {
  const reportTypes = [
    { title: 'Relatório Técnico Consolidado', desc: 'Análise detalhada do cumprimento de metas e objeto.', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Relatório de Execução Financeira', desc: 'Fluxo de caixa, repasses e saldos em conta.', icon: FilePieChart, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Controle Interno e Auditoria', desc: 'Pendências de CND e prazos de prestação de contas.', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Exportação SICOM-TCEMG', desc: 'Arquivo formatado para o Tribunal de Contas.', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <BarChartHorizontal size={14} />
            <span>Inteligência de Dados e Prestação Jurisdicional</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Relatórios e BI</h2>
          <p className="text-gray-500 font-medium">Geração de documentos técnicos e gerenciais exportáveis.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-sm">
            <Filter size={18} />
            <span>Filtros Globais</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reportTypes.map((report, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
             <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                  <div className={`p-4 rounded-[1.5rem] w-fit ${report.bg} ${report.color}`}>
                    <report.icon size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{report.title}</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs">{report.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-teal-600 hover:text-white transition-all shadow-sm flex items-center justify-center" title="Exportar PDF">
                    <Download size={20} />
                  </button>
                  <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center" title="Exportar Excel">
                    <FileSpreadsheet size={20} />
                  </button>
                </div>
             </div>
             <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between relative z-10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Última geração: Hoje, 08:20</span>
                <button className="text-teal-600 font-black text-xs flex items-center gap-2 hover:translate-x-1 transition-transform">
                  <span>PERSONALIZAR</span>
                  <ArrowUpRight size={16} />
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-teal-950 p-12 rounded-[4rem] text-white flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Database size={300} />
        </div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-400/20 rounded-full border border-teal-400/30 text-[10px] font-black uppercase tracking-widest text-teal-400">
             <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
             Integração TCEMG Ativa
          </div>
          <h3 className="text-3xl font-black">Módulo de Exportação SICOM</h3>
          <p className="text-teal-100/60 max-w-xl font-medium leading-relaxed">
            Prepare e valide os dados das parcerias, emendas e repasses para o envio periódico ao Tribunal de Contas do Estado de Minas Gerais. O sistema realiza uma pré-auditoria para evitar inconsistências no envio oficial.
          </p>
        </div>
        <button className="shrink-0 px-10 py-6 bg-teal-400 text-teal-950 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-300 transition-all shadow-xl active:scale-95 relative z-10">
          GERAR ARQUIVO SICOM
        </button>
      </div>
    </div>
  );
};

export default ReportsModule;

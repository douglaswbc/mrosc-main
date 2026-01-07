import React, { useState } from 'react';
import { 
  BarChartHorizontal, Download, Filter, FilePieChart, FileSpreadsheet, 
  FileJson, Database, ArrowUpRight, ShieldCheck, TrendingUp, Loader2 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ReportsModule: React.FC = () => {
  const [generating, setGenerating] = useState<string | null>(null);

  // Função genérica para baixar CSV
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (type: string, format: 'PDF' | 'EXCEL' | 'JSON') => {
    setGenerating(type);
    try {
      // 1. Busca dados reais do banco
      const { data: partnerships } = await supabase.from('partnerships').select('*');
      const { data: oscs } = await supabase.from('oscs').select('name, cnpj');

      // Simulação de processamento de relatório
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (format === 'EXCEL' || format === 'PDF') {
        // Gera um CSV simples como exemplo (em produção seria uma lib como 'jspdf' ou 'xlsx')
        const header = "ID,Objeto,Valor,Status\n";
        const rows = partnerships?.map(p => `${p.id},"${p.object}",${p.total_value},${p.status}`).join("\n");
        downloadCSV(header + rows, `Relatorio_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      } else if (format === 'JSON') {
        // Exportação SICOM (JSON estruturado)
        const sicomData = {
          header: {
            unidade: "Prefeitura Unaí",
            data_geracao: new Date().toISOString(),
            sistema: "MROSC Digital"
          },
          parcerias: partnerships,
          entidades: oscs
        };
        const blob = new Blob([JSON.stringify(sicomData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SICOM_Export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
      }

      alert(`Relatório ${type} gerado com sucesso!`);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar relatório.");
    } finally {
      setGenerating(null);
    }
  };

  const reportTypes = [
    { 
      id: 'tecnico',
      title: 'Relatório Técnico Consolidado', 
      desc: 'Análise detalhada do cumprimento de metas e objeto.', 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      id: 'financeiro',
      title: 'Relatório de Execução Financeira', 
      desc: 'Fluxo de caixa, repasses e saldos em conta.', 
      icon: FilePieChart, 
      color: 'text-teal-600', 
      bg: 'bg-teal-50' 
    },
    { 
      id: 'auditoria',
      title: 'Controle Interno e Auditoria', 
      desc: 'Pendências de CND e prazos de prestação de contas.', 
      icon: ShieldCheck, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      id: 'sicom',
      title: 'Exportação SICOM-TCEMG', 
      desc: 'Arquivo formatado para o Tribunal de Contas.', 
      icon: Database, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
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
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
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
                  <button 
                    onClick={() => handleExport(report.title, 'PDF')}
                    disabled={!!generating}
                    className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-teal-600 hover:text-white transition-all shadow-sm flex items-center justify-center disabled:opacity-50" 
                    title="Exportar PDF/CSV"
                  >
                    {generating === report.title ? <Loader2 className="animate-spin" size={20}/> : <Download size={20} />}
                  </button>
                  <button 
                    onClick={() => handleExport(report.title, 'EXCEL')}
                    disabled={!!generating}
                    className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center disabled:opacity-50" 
                    title="Exportar Excel"
                  >
                    <FileSpreadsheet size={20} />
                  </button>
                </div>
             </div>
             <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between relative z-10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Última geração: {new Date().toLocaleDateString()}
                </span>
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
        <button 
          onClick={() => handleExport('SICOM', 'JSON')}
          disabled={!!generating}
          className="shrink-0 px-10 py-6 bg-teal-400 text-teal-950 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-300 transition-all shadow-xl active:scale-95 relative z-10 disabled:opacity-50 flex items-center gap-3"
        >
          {generating === 'SICOM' && <Loader2 className="animate-spin" size={20} />}
          GERAR ARQUIVO SICOM
        </button>
      </div>
    </div>
  );
};

export default ReportsModule;
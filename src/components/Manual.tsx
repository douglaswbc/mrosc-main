import React, { useState } from 'react';
import { BookOpen, HelpCircle, Search, ChevronRight, Edit3, Download, ArrowLeft, Info, Settings, ShieldCheck, FileText, PlayCircle } from 'lucide-react';

interface ManualTopic {
  id: string;
  title: string;
  category: 'Operacional' | 'Compliance' | 'Fluxo Legal' | 'Admin';
  icon: any;
  content: React.ReactNode; // Conteúdo rico (texto/jsx)
}

const ManualModule: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<ManualTopic | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Base de Conhecimento (Conteúdo dos Manuais)
  const topics: ManualTopic[] = [
    { 
      id: '1', 
      title: 'Processamento de Emendas Parlamentares', 
      category: 'Operacional', 
      icon: Settings,
      content: (
        <div className="space-y-6 text-gray-700">
          <p>O módulo de Emendas Parlamentares permite o cadastro e acompanhamento das indicações legislativas.</p>
          <h4 className="font-bold text-teal-800">Passo a Passo:</h4>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Acesse o menu <strong>Emendas</strong>.</li>
            <li>Clique no botão <strong>Nova Indicação</strong>.</li>
            <li>Preencha o autor (Vereador), valor e número da emenda.</li>
            <li>Se a indicação for <em>Impositiva Direta</em>, selecione a OSC beneficiária imediatamente.</li>
          </ol>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
            <strong>Nota:</strong> Emendas não vinculadas até 30/11 serão convertidas para o fundo geral.
          </div>
        </div>
      )
    },
    { 
      id: '2', 
      title: 'Prestação de Contas (REO/REFF)', 
      category: 'Compliance', 
      icon: ShieldCheck,
      content: (
        <div className="space-y-6 text-gray-700">
          <p>A prestação de contas no MROSC é dividida em dois eixos principais conforme Item 33 do Edital.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h5 className="font-bold text-teal-800 mb-2">REO (Físico)</h5>
              <p className="text-sm">Relatório de Execução do Objeto. Deve conter fotos, listas de presença e evidências do cumprimento das metas.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h5 className="font-bold text-teal-800 mb-2">REFF (Financeiro)</h5>
              <p className="text-sm">Relatório de Execução Financeira. Exige upload de Notas Fiscais e comprovantes de pagamento.</p>
            </div>
          </div>
        </div>
      )
    },
    { 
      id: '3', 
      title: 'Chamamento e Seleção Pública', 
      category: 'Fluxo Legal', 
      icon: BookOpen,
      content: (
        <div className="space-y-6 text-gray-700">
            <p>Fluxo completo para publicação de Editais e seleção de propostas.</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Criação de Edital com critérios de pontuação.</li>
                <li>Publicação no Portal da Transparência (automático).</li>
                <li>Recebimento de Planos de Trabalho das OSCs.</li>
                <li>Homologação de resultados pela Comissão de Seleção.</li>
            </ul>
        </div>
      )
    },
    { 
      id: '4', 
      title: 'Manual Master da Prefeitura', 
      category: 'Admin', 
      icon: Edit3,
      content: (
        <div className="space-y-6 text-gray-700">
           <p>Área restrita para configurações globais do sistema.</p>
           <p>Aqui o Administrador pode:</p>
           <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Gerenciar usuários e permissões (RBAC).</li>
              <li>Alterar prazos globais de notificações.</li>
              <li>Configurar integração com sistema contábil (API).</li>
           </ul>
        </div>
      )
    },
  ];

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // MODO LEITURA
  if (selectedTopic) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500 pb-20">
         <header className="flex justify-between items-center">
            <button 
              onClick={() => setSelectedTopic(null)} 
              className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase hover:bg-teal-50 px-4 py-2 rounded-xl transition-all"
            >
              <ArrowLeft size={16} /> Voltar para Manuais
            </button>
            <button className="px-6 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-2">
               <Download size={16} /> Baixar PDF
            </button>
         </header>

         <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 p-12 max-w-4xl mx-auto min-h-[600px]">
            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100">
               <div className="p-5 bg-teal-50 text-teal-600 rounded-[2rem]">
                  <selectedTopic.icon size={32} />
               </div>
               <div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">{selectedTopic.title}</h3>
                  <span className="text-xs text-teal-600 font-bold uppercase tracking-widest mt-2 block">{selectedTopic.category}</span>
               </div>
            </div>

            <div className="prose prose-teal max-w-none font-medium leading-relaxed">
               {selectedTopic.content}
            </div>

            <div className="mt-12 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
               <HelpCircle className="text-gray-400" size={24} />
               <div className="text-xs text-gray-500">
                  <span className="font-bold text-gray-800">Ainda tem dúvidas?</span> Entre em contato com o suporte técnico através do módulo de <span className="text-teal-600 font-bold cursor-pointer underline">Comunicação</span>.
               </div>
            </div>
         </div>
      </div>
    );
  }

  // MODO LISTAGEM
  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <BookOpen size={14} />
            <span>Capacitação e Suporte (Itens 17 e 18 POC)</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Manual do Sistema</h2>
          <p className="text-gray-500 font-medium">Instruções de uso editáveis pelo Administrador Master.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase hover:bg-gray-50 transition-all">Editar Manual</button>
           <button className="px-6 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase shadow-xl">Baixar em PDF</button>
        </div>
      </header>

      <div className="relative mb-12">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-teal-600" size={24} />
        <input 
            type="text" 
            placeholder="Pesquisar instrução ou base legal..." 
            className="w-full pl-20 pr-8 py-10 bg-white rounded-[3rem] text-xl font-medium shadow-xl border-none outline-none focus:ring-8 focus:ring-teal-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTopics.map((t) => (
          <div key={t.id} onClick={() => setSelectedTopic(t)} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
              <div className="flex items-center gap-6 mb-8">
                 <div className="p-5 bg-teal-50 text-teal-600 rounded-[2rem] group-hover:scale-110 transition-transform">
                    <t.icon size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">{t.title}</h3>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{t.category}</span>
                 </div>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-10 leading-relaxed">
                  Instruções detalhadas sobre como operar o módulo de {t.title.split(' ')[0]} em conformidade com as exigências da Controladoria Geral.
              </p>
              <button className="flex items-center gap-2 text-[10px] font-black text-teal-600 uppercase group-hover:translate-x-2 transition-transform">
                 Acessar Guia Passo a Passo <ChevronRight size={14} />
              </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManualModule;
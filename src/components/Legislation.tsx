import React, { useState } from 'react';
import { 
  Scale, FileText, Download, Search, CheckCircle2, 
  ArrowLeft, Eye, Sparkles, Printer, Copy, Loader2, AlertCircle
} from 'lucide-react';
import { GeminiService } from '../services/gemini';

interface DocumentModel {
  id: string;
  title: string;
  category: 'Federal' | 'Municipal' | 'Modelo' | 'Manual';
  type: 'PDF' | 'DOCX' | 'XLSX';
  content?: string; // Conteúdo texto para modelos editáveis
  url?: string;     // Link para arquivos estáticos
}

const LegislationModule: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentModel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Base de Conhecimento (Pode vir do Supabase no futuro)
  const docs: DocumentModel[] = [
    { id: '1', title: 'Lei Federal 13.019/2014 (MROSC)', category: 'Federal', type: 'PDF' },
    { id: '2', title: 'Lei Municipal 3.083/2017 - Unaí/MG', category: 'Municipal', type: 'PDF' },
    { id: '3', title: 'Decreto Municipal 7.259/2023', category: 'Municipal', type: 'PDF' },
    { 
      id: '4', 
      title: 'Modelo: Termo de Fomento (Minuta Padrão)', 
      category: 'Modelo', 
      type: 'DOCX',
      content: `# MINUTA DE TERMO DE FOMENTO

**CONCEDENTE:** MUNICÍPIO DE UNAÍ/MG
**CONVENIADA:** [NOME DA OSC]
**CNPJ:** [CNPJ DA OSC]

**CLÁUSULA PRIMEIRA - DO OBJETO**
O presente instrumento tem por objeto a execução do projeto "[NOME DO PROJETO]", visando [OBJETIVO GERAL], conforme Plano de Trabalho aprovado.

**CLÁUSULA SEGUNDA - DA VIGÊNCIA**
O prazo de vigência será de [XX] meses, iniciando-se na data de sua assinatura.

**CLÁUSULA TERCEIRA - DOS RECURSOS**
O valor global é de R$ [VALOR], correndo à conta da dotação orçamentária [DOTAÇÃO].

**CLÁUSULA QUARTA - DA PRESTAÇÃO DE CONTAS**
A prestação de contas será eletrônica, via Plataforma MROSC Digital, conforme Decreto Municipal 7.259/2023.`
    },
    { 
      id: '5', 
      title: 'Modelo: Plano de Trabalho Simplificado', 
      category: 'Modelo', 
      type: 'DOCX',
      content: `# PLANO DE TRABALHO

1. **DADOS CADASTRAIS**
   - OSC Proponente:
   - Título do Projeto:

2. **REALIDADE DO OBJETO**
   - Diagnóstico da Situação Problema:

3. **METAS E INDICADORES**
   - Meta 1:
   - Indicador de Resultado:

4. **CRONOGRAMA FINANCEIRO**
   - Repasse Único ou Parcelado?`
    },
    { id: '6', title: 'Manual do Usuário - MROSC Digital', category: 'Manual', type: 'PDF' },
  ];

  const handleGenerateAI = async (doc: DocumentModel) => {
    setIsGenerating(true);
    setAiContent(null); // Limpa anterior
    try {
      // Chama o Gemini para enriquecer o modelo
      const result = await GeminiService.generateLegalMinute(
        doc.title, 
        "[NOME DA OSC EXEMPLO]", 
        "[OBJETO DO PROJETO AQUI]"
      );
      setAiContent(result || "O sistema não retornou sugestões no momento.");
    } catch (err) {
      console.error(err);
      setAiContent("Erro de comunicação com a IA Jurídica. Verifique sua chave API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredDocs = docs.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // MODO LEITURA / EDITOR
  if (selectedDoc) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500 pb-20">
        <header className="flex justify-between items-center">
          <button 
            onClick={() => { setSelectedDoc(null); setAiContent(null); }} 
            className="flex items-center gap-2 text-teal-600 font-black text-xs uppercase hover:bg-teal-50 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft size={16} /> Voltar para Biblioteca
          </button>
          <div className="flex gap-3">
             <button className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-teal-600 transition-all" title="Imprimir">
                <Printer size={18} />
             </button>
             <button className="px-6 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-2 hover:bg-teal-900 transition-all">
                <Download size={16} /> Baixar Arquivo
             </button>
          </div>
        </header>

        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 p-12 max-w-5xl mx-auto min-h-[600px]">
          <div className="mb-10 pb-8 border-b flex flex-col md:flex-row justify-between items-start gap-6">
             <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">{selectedDoc.title}</h3>
                <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mt-2">{selectedDoc.category} • Documento Oficial</p>
             </div>
             
             {selectedDoc.category === 'Modelo' && (
                <button 
                  onClick={() => handleGenerateAI(selectedDoc)}
                  disabled={isGenerating}
                  className="px-6 py-4 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-indigo-100 transition-all disabled:opacity-50 shadow-sm"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} 
                  {isGenerating ? 'Gerando Minuta...' : 'Gerar com IA Jurídica'}
                </button>
             )}
          </div>
          
          <div className="prose prose-teal max-w-none">
             {selectedDoc.content || aiContent ? (
               <div className="relative">
                 <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-10 rounded-[2rem] border border-gray-100 shadow-inner min-h-[400px]">
                    {aiContent || selectedDoc.content}
                 </pre>
                 {aiContent && (
                   <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-lg">
                      Gerado por IA
                   </div>
                 )}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <FileText size={64} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">Visualização não disponível para este formato ({selectedDoc.type}).</p>
                  <button className="mt-4 text-teal-600 font-bold underline text-xs uppercase">Clique para Baixar</button>
               </div>
             )}
          </div>
          
          {aiContent && (
             <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-start gap-4 animate-in slide-in-from-bottom-4">
                <Sparkles size={20} className="text-indigo-600 shrink-0 mt-1" />
                <div>
                   <h5 className="text-xs font-black text-indigo-800 uppercase mb-1">Assistente Inteligente</h5>
                   <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                      Esta minuta foi gerada automaticamente baseada nos parâmetros da Lei 13.019/14 e Decreto Municipal. Revise as cláusulas em [COLCHETES] antes de utilizar.
                   </p>
                </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  // MODO LISTAGEM (BIBLIOTECA)
  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <Scale size={14} />
            <span>Biblioteca Legal e Instruções (Item 37 POC)</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Legislação e Modelos</h2>
          <p className="text-gray-500 font-medium">Modelos editáveis e minutas para formalização de parcerias MROSC.</p>
        </div>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-teal-600" size={24} />
        <input 
          type="text" 
          placeholder="Pesquisar lei, decreto ou modelo de documento..." 
          className="w-full pl-16 pr-6 py-6 bg-white rounded-[2.5rem] shadow-xl border-none outline-none focus:ring-4 focus:ring-teal-500/20 text-base font-medium transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${
                    doc.category === 'Modelo' ? 'bg-indigo-50 text-indigo-600' : 
                    doc.category === 'Manual' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'
                  }`}>
                    <FileText size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-wider">{doc.type}</span>
                  </div>
               </div>
               <h4 className="text-xl font-black text-gray-900 mb-2 leading-tight min-h-[3.5rem]">{doc.title}</h4>
               <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{doc.category}</p>
            </div>
            <div className="mt-10 pt-8 border-t border-gray-50 flex gap-3">
               <button 
                 onClick={() => setSelectedDoc(doc)}
                 className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${
                    doc.content ? 'bg-teal-800 text-white hover:bg-teal-900' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-600 hover:text-teal-600'
                 }`}
               >
                  {doc.content ? <><Eye size={14} /> Visualizar</> : <><Download size={14} /> Download</>}
               </button>
               {doc.category === 'Modelo' && (
                  <button className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all" title="Gerar com IA">
                      <Sparkles size={16} />
                  </button>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* CALL TO ACTION IA */}
      <div className="mt-12 bg-gradient-to-br from-indigo-900 to-teal-900 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <Sparkles size={200} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <h3 className="text-3xl font-black mb-4 flex items-center gap-4">
              <Sparkles className="text-indigo-300" />
              IA Jurídica Unaí
            </h3>
            <p className="text-indigo-100/70 font-medium leading-relaxed mb-10">
              Gere rascunhos de minutas jurídicas personalizadas para cada OSC em segundos. O sistema utiliza <strong>Google Gemini</strong> para adaptar o objeto do plano de trabalho às cláusulas obrigatórias da Lei 13.019/14.
            </p>
         </div>
      </div>
    </div>
  );
};

export default LegislationModule;
import React, { useState, useEffect } from 'react';
import { ClipboardList, Camera, CreditCard, UploadCloud, CheckCircle2, XCircle, Trash2, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { User } from '../services/authContext';
import { supabase } from '../lib/supabase';

interface AccountabilityProps { user: User; }

// Interface local para os documentos
interface Doc {
  id: string;
  type: 'REO' | 'REFF';
  description: string;
  amount?: number;
  file_url: string;
  status: string;
  created_at: string;
}

const AccountabilityModule: React.FC<AccountabilityProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'REO' | 'REFF'>('REO');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Estados para o formulário de upload
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocAmount, setNewDocAmount] = useState('');

  useEffect(() => {
    fetchDocs();
  }, [activeTab]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      // Busca documentos filtrando pelo tipo da aba ativa
      const { data, error } = await supabase
        .from('accountability_docs')
        .select('*')
        .eq('type', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocs(data || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    // Validação simples
    if (!newDocDesc) return alert("Por favor, descreva o documento antes de enviar.");
    if (activeTab === 'REFF' && !newDocAmount) return alert("Para REFF, o valor é obrigatório.");

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${activeTab}/${fileName}`;

    setUploading(true);
    try {
      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from('mrosc-docs') // Certifique-se que este bucket existe no Supabase!
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pegar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('mrosc-docs')
        .getPublicUrl(filePath);

      // 3. Salvar registro no Banco
      // OBS: Precisamos de um partnership_id válido. Aqui vou pegar o primeiro encontrado ou deixar null se não tiver.
      // Em produção, você selecionaria a parceria antes de abrir essa tela.
      const { data: partnerships } = await supabase.from('partnerships').select('id').limit(1);
      const partnershipId = partnerships?.[0]?.id;

      if (!partnershipId) throw new Error("Nenhuma parceria ativa encontrada para vincular este documento.");

      const { error: dbError } = await supabase
        .from('accountability_docs')
        .insert({
          partnership_id: partnershipId,
          type: activeTab,
          description: newDocDesc,
          amount: activeTab === 'REFF' ? parseFloat(newDocAmount) : null,
          file_url: publicUrl,
          status: 'pending'
        });

      if (dbError) throw dbError;

      alert("Documento enviado com sucesso!");
      setNewDocDesc('');
      setNewDocAmount('');
      fetchDocs(); // Recarrega lista
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert('Erro: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    try {
      const { error } = await supabase.from('accountability_docs').delete().eq('id', id);
      if (error) throw error;
      fetchDocs();
    } catch (error) {
      alert("Erro ao deletar.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <ClipboardList size={14} />
            <span>Processamento Integral POC Item 33</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Compliance de Contas</h2>
          <p className="text-gray-500 font-medium italic">Monitoramento eletrônico de Objeto e Financeiro (REO/REFF).</p>
        </div>
      </header>

      {/* ABAS */}
      <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-gray-100 w-fit">
        <button 
          onClick={() => setActiveTab('REO')}
          className={`px-8 py-4 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'REO' ? 'bg-teal-800 text-white shadow-xl' : 'text-gray-400 hover:text-teal-600'}`}
        >
          REO (Execução Objeto)
        </button>
        <button 
          onClick={() => setActiveTab('REFF')}
          className={`px-8 py-4 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'REFF' ? 'bg-teal-800 text-white shadow-xl' : 'text-gray-400 hover:text-teal-600'}`}
        >
          REFF (Financeiro)
        </button>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[500px]">
        {/* ÁREA DE UPLOAD (Comum às duas abas) */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
            <h4 className="text-sm font-black text-gray-700 uppercase mb-4 flex items-center gap-2">
                <UploadCloud size={18} /> Novo Lançamento {activeTab}
            </h4>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2 w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Descrição ({activeTab === 'REO' ? 'Foto/Relatório' : 'Despesa'})</label>
                    <input 
                        type="text" 
                        value={newDocDesc}
                        onChange={e => setNewDocDesc(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700"
                        placeholder={activeTab === 'REO' ? "Ex: Fotos da Oficina de Música" : "Ex: NF-123 Compra de Lanche"}
                    />
                </div>
                {activeTab === 'REFF' && (
                    <div className="w-32 space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Valor (R$)</label>
                        <input 
                            type="number" 
                            value={newDocAmount}
                            onChange={e => setNewDocAmount(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700"
                            placeholder="0,00"
                        />
                    </div>
                )}
                <div className="relative">
                    <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label 
                        htmlFor="file-upload"
                        className={`cursor-pointer px-6 py-3 bg-teal-800 text-white rounded-xl font-black text-[10px] uppercase hover:bg-teal-900 transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                        {uploading ? 'Enviando...' : 'Anexar Comprovante'}
                    </label>
                </div>
            </div>
        </div>

        {/* CONTEÚDO DAS LISTAS */}
        {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-teal-600">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Carregando Prestação de Contas...</p>
             </div>
        ) : docs.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <AlertTriangle className="mb-4 opacity-50" size={48} />
                <p className="text-sm font-bold">Nenhum lançamento registrado.</p>
                <p className="text-xs">Use o formulário acima para enviar a primeira prestação.</p>
             </div>
        ) : activeTab === 'REO' ? (
          <div className="p-12 space-y-12 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {docs.map(doc => (
                    <div key={doc.id} className="group relative bg-white border border-gray-100 rounded-3xl p-4 hover:shadow-xl transition-all">
                        <div className="h-40 bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                            {/* Se for imagem mostra preview, senão ícone genérico */}
                            {doc.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img src={doc.file_url} alt={doc.description} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FileText size={48} />
                                </div>
                            )}
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs uppercase transition-opacity">
                                Ver Arquivo
                            </a>
                        </div>
                        <h5 className="font-bold text-gray-900 text-sm mb-1">{doc.description}</h5>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</span>
                            <button onClick={() => handleDelete(doc.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto animate-in fade-in">
            <table className="w-full text-left">
              <thead className="bg-teal-950 text-teal-300 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-7">Despesa / Doc Fiscal</th>
                  <th className="px-8 py-7">Categoria</th>
                  <th className="px-8 py-7">Valor</th>
                  <th className="px-8 py-7">Status</th>
                  <th className="px-8 py-7 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-8">
                      <div className="font-black text-gray-900">{item.description}</div>
                      <a href={item.file_url} target="_blank" className="text-[10px] font-bold text-teal-600 hover:underline">Ver Comprovante</a>
                    </td>
                    <td className="px-8 py-8">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase">Custeio</span>
                    </td>
                    <td className="px-8 py-8 font-black text-teal-800">
                        {item.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                         <Loader2 size={14} /> Em Análise
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all" title="Excluir">
                             <Trash2 size={18} />
                           </button>
                        </div>
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

export default AccountabilityModule;
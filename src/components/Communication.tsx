import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Bell, Mail, Loader2, CheckCircle2, AlertCircle, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../services/authContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  // Campos simulados para UI (já que não existem no banco simples)
  subject?: string;
  priority?: string;
}

const CommunicationModule: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user.id);

      // Busca mensagens onde sou remetente ou destinatário
      // Trazendo também o nome do perfil de quem enviou
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id (full_name)
        `)
        .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Message[] = (data || []).map((m: any) => ({
        id: m.id,
        content: m.content,
        sender_id: m.sender_id,
        recipient_id: m.recipient_id,
        created_at: m.created_at,
        is_read: m.is_read,
        sender_name: m.sender?.full_name || 'Usuário Desconhecido',
        // Simulando campos visuais
        subject: m.content.substring(0, 30) + '...',
        priority: 'Normal'
      }));

      setMessages(mapped);
      if (mapped.length > 0) setSelectedMsg(mapped[0]); // Seleciona a primeira

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!replyText || !selectedMsg || !currentUser) return;

    setSending(true);
    try {
      // Determina quem é o destinatário (se eu sou o sender original, mando pro recipient original, e vice-versa)
      // Lógica simplificada: responder para quem me mandou a msg selecionada
      const targetId = selectedMsg.sender_id === currentUser ? selectedMsg.recipient_id : selectedMsg.sender_id;

      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser,
        recipient_id: targetId,
        content: replyText,
        is_read: false
      });

      if (error) throw error;

      setReplyText('');
      alert('Mensagem enviada!');
      fetchMessages(); // Atualiza lista
    } catch (error) {
      alert('Erro ao enviar.');
    } finally {
      setSending(false);
    }
  };

  // Função para criar nova msg (Simples prompt por enquanto)
  const handleNewMessage = async () => {
    const email = prompt("Digite o Email/ID do destinatário (Simulação: em produção seria um select):");
    if (!email) return;
    const text = prompt("Digite a mensagem:");
    if (!text) return;

    // Em produção, buscaríamos o ID pelo email. Aqui vou tentar enviar para um ID fixo ou admin se falhar
    alert("Funcionalidade de Nova Conversa requer busca de usuários implementada. Use a resposta rápida ao lado.");
  };

  return (
    <div className="space-y-8 h-full flex flex-col min-h-[600px] animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <MessageSquare size={14} />
            <span>Mensageria e Notificações Oficiais</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Central de Comunicados</h2>
          <p className="text-gray-500 font-medium">Registro histórico de todas as interações entre Administração e parceiros.</p>
        </div>
        <button 
          onClick={handleNewMessage}
          className="px-6 py-3 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-900 shadow-xl shadow-teal-900/20 flex items-center space-x-2 transition-all"
        >
          <Send size={18} />
          <span>Novo Comunicado</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 h-full">
        {/* LISTA DE MENSAGENS (SIDEBAR) */}
        <aside className="lg:col-span-4 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar conversa..." 
                className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-xs outline-none focus:ring-4 focus:ring-teal-500/10 w-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {loading ? (
               <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600"/></div>
            ) : messages.length === 0 ? (
               <div className="p-10 text-center text-gray-400 text-sm">Nenhuma mensagem.</div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => setSelectedMsg(msg)}
                  className={`p-6 cursor-pointer hover:bg-teal-50/30 transition-all ${selectedMsg?.id === msg.id ? 'bg-teal-50/50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-tighter truncate max-w-[120px]">{msg.sender_name}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className={`text-sm mb-1 ${!msg.is_read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                    {msg.subject}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{msg.content}</p>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-blue-100 text-blue-700">
                      Normal
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* DETALHE DA MENSAGEM (MAIN) */}
        <main className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 flex flex-col h-[600px]">
          {selectedMsg ? (
            <>
              <div className="flex items-center justify-between pb-8 border-b border-gray-100 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 font-black">
                     <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 line-clamp-1">{selectedMsg.subject}</h3>
                    <p className="text-xs text-gray-500 font-medium">De: {selectedMsg.sender_name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all"><Mail size={18} /></button>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all"><Bell size={18} /></button>
                </div>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto mb-6 pr-4">
                {/* Mensagem Selecionada */}
                <div className="flex flex-col items-start max-w-lg">
                  <div className="bg-gray-100 p-6 rounded-3xl rounded-tl-none text-sm text-gray-700 font-medium leading-relaxed">
                    {selectedMsg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold mt-2 ml-2">
                    {new Date(selectedMsg.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Área de Resposta */}
              <div className="relative group mt-auto">
                <textarea 
                  placeholder="Digite sua resposta oficial..." 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full pl-6 pr-24 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium outline-none focus:ring-8 focus:ring-teal-500/10 focus:bg-white transition-all h-32 resize-none"
                ></textarea>
                <button 
                  onClick={handleSendMessage}
                  disabled={sending}
                  className="absolute bottom-4 right-4 bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-teal-700 transition-all shadow-xl disabled:opacity-50"
                >
                  {sending ? 'Enviando...' : 'Enviar Agora'}
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <MessageSquare size={48} className="mb-4 opacity-20"/>
               <p>Selecione uma mensagem para visualizar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CommunicationModule;
import React, { useState } from 'react';
import { X, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Credenciais inválidas ou erro de conexão.');
      setIsSubmitting(false);
    } else {
      // Login sucesso: fecha modal e vai pro Dashboard
      onClose();
      navigate('/'); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Acesso Restrito</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Gestores e Representantes de OSC</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome@unai.mg.gov.br"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-teal-500/30 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-teal-500/30 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl text-center border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-teal-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-900 transition-all shadow-xl shadow-teal-900/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Entrar no Sistema <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <a href="#" className="text-[10px] font-bold text-teal-600 hover:text-teal-800 uppercase tracking-wide border-b border-teal-200 pb-0.5">
              Esqueci minha senha
            </a>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Ambiente Seguro • SSL 256-bit</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
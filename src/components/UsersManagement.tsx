import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Save, Filter, UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  updated_at: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Busca todos os perfis
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, field: 'role' | 'department', value: string) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      
      // Atualiza estado local para refletir a mudança sem recarregar
      setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
      
      // Feedback visual rápido (opcional: toast)
    } catch (error: any) {
      alert('Erro ao atualizar: ' + error.message);
    } finally {
      setUpdating(null);
    }
  };

  // Filtro
  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roles = Object.values(UserRole);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <Shield size={14} />
            <span>Administração do Sistema</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Gestão de Usuários</h2>
          <p className="text-gray-500 font-medium">Controle de acesso, cargos e departamentos (RBAC).</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold border border-amber-100">
           <Shield size={14} />
           Área exclusiva MASTER
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou cargo..." 
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-teal-500/10 w-80"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchUsers} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-teal-600 transition-all" title="Atualizar Lista">
            <Filter size={18} />
          </button>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-64 text-teal-600">
             <Loader2 className="animate-spin" size={32} />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Usuário</th>
                  <th className="px-8 py-6">Departamento</th>
                  <th className="px-8 py-6">Nível de Acesso (Role)</th>
                  <th className="px-8 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs">
                          {u.full_name?.substring(0,2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{u.full_name || 'Sem Nome'}</div>
                          <div className="text-[10px] text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <input 
                        type="text" 
                        value={u.department || ''}
                        onChange={(e) => handleUpdateUser(u.id, 'department', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none text-xs font-medium text-gray-600 w-full py-1 transition-colors"
                        placeholder="Definir Depto..."
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleUpdateUser(u.id, 'role', e.target.value)}
                          className={`appearance-none w-full pl-3 pr-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border cursor-pointer outline-none transition-all ${
                            u.role === 'MASTER' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            u.role === 'CONTROL' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            u.role.includes('OSC') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-teal-50 text-teal-700 border-teal-100'
                          }`}
                        >
                          {roles.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        {updating === u.id && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-gray-400" size={12} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                          <UserCheck size={12} /> Ativo
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

export default UsersManagement;
import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Filter, UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserRole, RoleLabels } from '../types'; // Importando RoleLabels

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
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
      setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
    } catch (error: any) {
      alert('Erro ao atualizar: ' + error.message);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">
            <Shield size={14} />
            <span>Administração do Sistema</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Gestão de Usuários</h2>
          <p className="text-gray-500 font-medium">Controle de acesso e atribuição de cargos (RBAC).</p>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar usuário..." 
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs w-80 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchUsers} className="p-3 bg-white text-gray-400 rounded-2xl hover:text-teal-600"><Filter size={18} /></button>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-teal-600" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Usuário</th>
                  <th className="px-8 py-6">Departamento</th>
                  <th className="px-8 py-6">Cargo (Role)</th>
                  <th className="px-8 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900 text-sm">{u.full_name || 'Sem Nome'}</div>
                      <div className="text-[10px] text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <input 
                        type="text" 
                        value={u.department || ''}
                        onChange={(e) => handleUpdateUser(u.id, 'department', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal-500 outline-none text-xs w-full"
                        placeholder="Depto..."
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleUpdateUser(u.id, 'role', e.target.value)}
                          className="appearance-none w-full pl-3 pr-8 py-2 rounded-xl text-[10px] font-black uppercase border outline-none bg-white cursor-pointer"
                        >
                          {Object.keys(UserRole).map((roleKey) => (
                            <option key={roleKey} value={roleKey}>
                              {RoleLabels[roleKey] || roleKey}
                            </option>
                          ))}
                        </select>
                        {updating === u.id && <Loader2 className="absolute right-2 top-2 animate-spin text-teal-600" size={12} />}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center gap-1">
                          <UserCheck size={12} /> Ativo
                       </span>
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
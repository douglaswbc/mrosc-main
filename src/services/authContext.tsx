import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

// Interface do Usuário (Extendida com dados do Supabase)
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

// Contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Provider que vai envolver toda a aplicação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica sessão atual ao carregar
    checkUser();

    // 2. Escuta mudanças (Login/Logout em outras abas)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchProfile = async (authUser: any) => {
    try {
      // Busca dados extras (Role, Nome) na tabela 'profiles'
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !profile) {
        // Fallback se não tiver perfil criado ainda (segurança)
        console.warn('Perfil não encontrado, usando role padrão.');
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: 'Usuário Sem Perfil',
          role: UserRole.OSC_USER
        });
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: profile.full_name || authUser.email,
          role: profile.role as UserRole,
          department: profile.department
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      await fetchProfile(data.user);
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o Auth em qualquer lugar
export const useAuth = () => useContext(AuthContext);

// --- LÓGICA DE PERMISSÕES (Mantida e Ajustada) ---

export const hasPermission = (user: User | null, action: string): boolean => {
  if (!user) return false;
  if (user.role === UserRole.MASTER) return true;

  const permissions: Record<string, UserRole[]> = {
    'VIEW_AMENDMENTS': [UserRole.MASTER, UserRole.CONTROL, UserRole.GESTOR, UserRole.LEGAL],
    'EDIT_LEGISLATION': [UserRole.MASTER, UserRole.LEGAL, UserRole.CONTROL],
    'APPROVE_ACCOUNTABILITY': [UserRole.MASTER, UserRole.CONTROL, UserRole.TECH_FINANCIAL],
    'RELEASE_TRANCHE': [UserRole.MASTER, UserRole.CONTROL, UserRole.GESTOR],
    'CREATE_PARTNERSHIP': [UserRole.MASTER, UserRole.GESTOR, UserRole.LEGAL],
    'SUBMIT_DOCUMENTS': [UserRole.OSC_LEGAL, UserRole.OSC_USER],
    'CREATE_CHAMAMENTO': [UserRole.MASTER, UserRole.SELECTION_COMMISSION, UserRole.GESTOR],
    'VIEW_AUDIT_LOGS': [UserRole.MASTER, UserRole.CONTROL],
    'MANAGE_USERS': [UserRole.MASTER],
    'EDIT_WORKPLAN': [UserRole.MASTER, UserRole.GESTOR, UserRole.OSC_LEGAL]
  };

  return permissions[action]?.includes(user.role) ?? false;
};

export const getAccessibleRoutes = (role: UserRole): string[] => {
  if (role === UserRole.MASTER) return ['all'];

  const mapping: Record<UserRole, string[]> = {
    [UserRole.CONTROL]: ['/', '/accountability', '/oscs', '/reports', '/legislation', '/logs', '/manual', '/communication'],
    [UserRole.GESTOR]: ['/', '/amendments', '/pmis', '/chamamento', '/partnerships', '/accountability', '/reports', '/manual', '/communication'],
    [UserRole.LEGAL]: ['/', '/partnerships', '/legislation', '/communication', '/manual'],
    [UserRole.SELECTION_COMMISSION]: ['/', '/chamamento', '/pmis', '/manual'],
    [UserRole.MONITORING_COMMISSION]: ['/', '/partnerships', '/accountability', '/manual'],
    [UserRole.OSC_LEGAL]: ['/', '/partnerships', '/accountability', '/communication', '/oscs', '/manual'],
    [UserRole.OSC_USER]: ['/', '/partnerships', '/accountability', '/communication', '/manual'],
    [UserRole.TECH_PHYSICAL]: ['/', '/partnerships', '/accountability'],
    [UserRole.TECH_FINANCIAL]: ['/', '/partnerships', '/accountability', '/reports'],
    [UserRole.COUNCILS]: ['/', '/partnerships', '/reports', '/transparency'],
    // Fallback
    [UserRole.MASTER]: ['all'] 
  };

  return mapping[role] || ['/'];
};
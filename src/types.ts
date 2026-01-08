export enum PartnershipStatus {
  PLANNING = 'Planejamento',
  SELECTION = 'Chamamento',
  CELEBRATION = 'Celebração',
  EXECUTION = 'Execução',
  MONITORING = 'Monitoramento',
  ACCOUNTABILITY = 'Prestação de Contas',
  CONCLUDED = 'Concluída',
  SUSPENDED = 'Suspensa'
}

// CORREÇÃO AQUI: Os valores devem bater com o Banco de Dados (Postgres Enum)
export enum UserRole {
  MASTER = 'MASTER',
  CONTROL = 'CONTROL',
  GESTOR = 'GESTOR',
  SELECTION_COMMISSION = 'SELECTION_COMMISSION',
  MONITORING_COMMISSION = 'MONITORING_COMMISSION',
  COUNCILS = 'COUNCILS',
  TECH_PHYSICAL = 'TECH_PHYSICAL',
  TECH_FINANCIAL = 'TECH_FINANCIAL',
  LEGAL = 'LEGAL',
  OSC_LEGAL = 'OSC_LEGAL',
  OSC_USER = 'OSC_USER'
}

// Mapa para exibir nomes bonitos na tela (UI)
export const RoleLabels: Record<string, string> = {
  MASTER: 'Administrador Master',
  CONTROL: 'Controle Interno',
  GESTOR: 'Gestor da Parceria',
  SELECTION_COMMISSION: 'Comissão de Seleção',
  MONITORING_COMMISSION: 'Comissão de Monitoramento',
  COUNCILS: 'Conselhos Municipais',
  TECH_PHYSICAL: 'Técnico - Exec. Física',
  TECH_FINANCIAL: 'Técnico - Exec. Financeira',
  LEGAL: 'Procuradoria Jurídica',
  OSC_LEGAL: 'Rep. Legal OSC',
  OSC_USER: 'Usuário OSC'
};

export enum OSCStatus {
  REGULAR = 'Regular',
  IMPEDED = 'Impedida',
  EXPIRED_CND = 'CND Vencida',
  PENDING_ACCOUNT = 'Contas Pendentes'
}

export interface CNDRecord {
  provider: string;
  issueDate: string;
  expiryDate: string;
  status: 'Regular' | 'Irregular' | 'Vencida' | 'Pendente';
  documentCode: string;
}

export interface OSC {
  id: string;
  name: string;
  cnpj: string;
  status: OSCStatus;
  lastUpdate: string;
  email: string;
  phone: string;
  cnds: CNDRecord[];
}

export interface Amendment {
  id: string;
  number: string;
  author: string;
  value: number;
  year: number;
  description: string;
  type: 'Impositiva' | 'Ordinária';
  indicationType: 'Direta' | 'Indireta';
  legalDeadline: string;
  status: 'Pendente' | 'Vinculada' | 'Executada' | 'Paga';
  beneficiaryOSC?: string;
}

export interface Chamamento {
  id: string;
  editalNumber: string;
  object: string;
  status: 'Aberto' | 'Em Julgamento' | 'Recurso' | 'Homologado' | 'Suspenso';
  publishDate: string;
  deadlineDate: string;
  category: string;
  proposalsCount: number;
}

export interface Goal {
  id: string;
  description: string;
  target: string;
  indicator?: string;
  progress: number;
  status: 'Pendente' | 'Em Andamento' | 'Concluída';
}

export interface Tranche {
  id: string;
  value: number;
  expectedDate: string;
  releasedDate?: string;
  status: 'Pendente' | 'Liberada' | 'Bloqueada';
}

export interface Partnership {
  id: string;
  title: string;
  oscId: string;
  type: 'Termo de Fomento' | 'Termo de Colaboração' | 'Acordo de Cooperação';
  status: PartnershipStatus;
  totalValue: number;
  startDate: string;
  endDate: string;
  goals: Goal[];
  tranches: Tranche[];
  workPlanVersion: number;
}
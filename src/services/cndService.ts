import { supabase } from '../lib/supabase';
import { GeminiService } from './gemini';

// Interface local para garantir tipagem
export interface CNDRecord {
  provider: string;
  issueDate: string;
  expiryDate: string;
  status: 'Regular' | 'Irregular' | 'Pendente';
  documentCode: string;
}

export class CNDService {
  /**
   * Simula a chamada para APIs governamentais (Receita, Caixa, TCU)
   * e ATUALIZA o status real da OSC no banco de dados.
   */
  static async fetchLatestCNDs(oscId: string, cnpj: string): Promise<CNDRecord[]> {
    console.log(`Consultando bases governamentais para CNPJ: ${cnpj}...`);
    
    // 1. Simulação de delay de rede (APIs do governo costumam demorar)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1); // Vence em 1 mês
    
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(today.getMonth() + 6); // Vence em 6 meses

    // 2. Gera dados simulados (Mock)
    // Em produção, isso seria substituído por chamadas reais via Axios/Fetch
    const mockCNDs: CNDRecord[] = [
      {
        provider: 'Receita Federal (Tributos Federais)',
        issueDate: today.toISOString().split('T')[0],
        expiryDate: sixMonthsLater.toISOString().split('T')[0],
        status: 'Regular',
        documentCode: `RFB-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
      },
      {
        provider: 'Caixa Econômica (FGTS)',
        issueDate: today.toISOString().split('T')[0],
        expiryDate: nextMonth.toISOString().split('T')[0],
        status: 'Regular',
        documentCode: `CRF-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
      },
      {
        provider: 'Tribunal de Contas (TCU)',
        issueDate: today.toISOString().split('T')[0],
        expiryDate: sixMonthsLater.toISOString().split('T')[0],
        status: 'Regular',
        documentCode: `TCU-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
      },
      {
        provider: 'Trabalhista (CNDT)',
        issueDate: today.toISOString().split('T')[0],
        expiryDate: nextMonth.toISOString().split('T')[0],
        status: 'Regular',
        documentCode: `TST-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
      }
    ];

    // 3. PERSISTÊNCIA: Atualiza o status na tabela 'oscs' do Supabase
    // Se alguma CND não for Regular, o status geral vira 'expired'
    const isAllValid = mockCNDs.every(c => c.status === 'Regular');
    const newStatus = isAllValid ? 'valid' : 'expired';

    if (oscId) {
      const { error } = await supabase
        .from('oscs')
        .update({ 
          cnd_status: newStatus 
          // Se tivermos uma coluna 'last_cnd_check' no banco, atualizaríamos aqui também
        })
        .eq('id', oscId);

      if (error) {
        console.error("Erro ao atualizar status da CND no Supabase:", error);
      } else {
        console.log(`Status da OSC atualizado para: ${newStatus}`);
      }
    }

    return mockCNDs;
  }

  /**
   * Usa o Gemini para gerar um parecer técnico sobre os riscos
   */
  static async analyzeRisk(cnds: CNDRecord[]) {
    if (!cnds || cnds.length === 0) return "Não há certidões carregadas para análise.";

    // Monta um resumo em texto para a IA ler
    const context = cnds.map(c => 
      `${c.provider}: Status ${c.status}, Vence em ${c.expiryDate}`
    ).join('; ');

    // Chama o serviço do Gemini corrigido
    return await GeminiService.analyzeComplianceRisk(context);
  }
}
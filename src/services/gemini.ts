import { GoogleGenAI } from "@google/genai";

// Mapeamento manual de Tipos para evitar erro de importação
const Type = {
  OBJECT: "OBJECT",
  ARRAY: "ARRAY",
  STRING: "STRING",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN"
};

// 1. Configuração do Cliente (Adaptado para Vite)
const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERRO: VITE_GEMINI_API_KEY não encontrada no .env");
    throw new Error("Chave de API do Gemini não configurada.");
  }
  return new GoogleGenAI({ apiKey });
};

// 2. Função NOVA usada pelo WorkPlanEditor (Sugestão de Plano)
export async function generateWorkPlanSuggestion(partnershipObject: string) {
  const ai = getClient();
  const prompt = `Atue como um especialista em projetos sociais e Lei 13.019/2014 (MROSC).
  Para um projeto social cujo objeto é: "${partnershipObject}", elabore:
  1. Uma justificativa técnica convincente e resumida.
  2. Duas metas claras com indicadores físicos mensuráveis.
  
  Retorne APENAS um JSON puro (sem crase, sem markdown) com esta estrutura:
  {
    "justification": "texto da justificativa",
    "goals": [
      { "description": "descrição da meta", "target": "número", "indicator": "unidade" }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Modelo estável e rápido
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            justification: { type: Type.STRING },
            goals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  target: { type: Type.STRING },
                  indicator: { type: Type.STRING }
                },
                required: ["description", "target", "indicator"]
              }
            }
          },
          required: ["justification", "goals"]
        }
      }
    });

    const text = response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Erro ao gerar sugestão com IA:", error);
    return null;
  }
}

// 3. Classe ANTIGA (Mantida para compatibilidade)
export class GeminiService {
  static async analyzeComplianceRisk(cndContext: string) {
    const ai = getClient();
    const prompt = `Como auditor do MROSC, analise estas certidões: ${cndContext}. Resuma se há risco de bloqueio.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
      });
      return response.text();
    } catch (error) {
      console.error("Erro compliance:", error);
      return "Análise indisponível.";
    }
  }

  static async generateLegalMinute(partnershipType: string, oscName: string, goal: string) {
    const ai = getClient();
    const prompt = `Gere minuta de ${partnershipType} para OSC ${oscName}, objetivo: ${goal}. Formato Markdown.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
      });
      return response.text();
    } catch (error) {
      return "Erro na minuta.";
    }
  }
}
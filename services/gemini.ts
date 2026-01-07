
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async analyzeComplianceRisk(cndContext: string) {
    const ai = this.getClient();
    const prompt = `Como um auditor do MROSC, analise o status das seguintes certidões de uma OSC: ${cndContext}. 
    Forneça um parecer técnico curto se a OSC está apta a receber novos repasses públicos ou se há risco iminente de bloqueio por vencimento de CNDs.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error analyzing compliance:", error);
      return "Análise indisponível no momento.";
    }
  }

  static async generateLegalMinute(partnershipType: string, oscName: string, goal: string) {
    const ai = this.getClient();
    const prompt = `Gere uma minuta jurídica de um ${partnershipType} baseado na Lei 13.019/2014 (MROSC) para a OSC ${oscName}. O objetivo central é: ${goal}. Inclua cláusulas de prestação de contas e metas. Retorne em formato Markdown profissional.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating legal minute:", error);
      return "Erro ao gerar minuta.";
    }
  }

  static async analyzeWorkPlan(planContent: string) {
    const ai = this.getClient();
    const prompt = `Analise o seguinte plano de trabalho de uma OSC sob a ótica do MROSC (Lei 13.019/2014): ${planContent}. Identifique riscos, clareza das metas e conformidade legal.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              complianceScore: { type: Type.NUMBER },
              risks: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              isViable: { type: Type.BOOLEAN }
            },
            required: ["complianceScore", "risks", "recommendations", "isViable"]
          }
        }
      });
      const jsonStr = response.text?.trim();
      return jsonStr ? JSON.parse(jsonStr) : null;
    } catch (error) {
      console.error("Error analyzing work plan:", error);
      return null;
    }
  }
}

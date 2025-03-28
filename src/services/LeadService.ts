
import { LeadFormValues } from "@/lib/leadValidators";

/**
 * Envia dados do formulário de lead para o webhook do Google Sheets
 */
export async function submitLeadToGoogleSheets(data: any, webhookUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!webhookUrl) {
      throw new Error("URL do webhook do Google Sheets não configurada");
    }
    
    // Verifica se a URL parece válida
    if (!webhookUrl.startsWith('https://') || !webhookUrl.includes('script.google.com')) {
      throw new Error("URL do webhook inválida. Deve ser uma URL segura do Google Apps Script");
    }
    
    // Prepara os dados para envio
    const leadData = {
      ...data,
      formType: 'lead', // Identificador para saber que é um formulário de lead
    };
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
      mode: "cors", // Habilita CORS
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }
    
    let result;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error("Resposta do servidor não está no formato JSON esperado");
    }
    
    if (result.result === "success") {
      return { success: true, message: result.message || "Dados do lead enviados com sucesso!" };
    } else {
      throw new Error(result.message || "Erro ao enviar dados do lead");
    }
  } catch (error) {
    console.error("Erro ao enviar lead para o Google Sheets:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro desconhecido ao enviar dados do lead" 
    };
  }
}

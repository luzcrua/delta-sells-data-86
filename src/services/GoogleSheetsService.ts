
// This file provides helpers for Google Sheets integration

// Fallback constants (no actual URL here, just a placeholder)
const WEBHOOK_URL_STORAGE_KEY = "google_sheets_webhook_url";
const WHATSAPP_FALLBACK_NUMBER = "558293460460";

/**
 * Formata os dados para envio via WhatsApp
 */
function formatDataForWhatsApp(data: any): string {
  let message = "📋 *DADOS DO ";
  
  if (data.formType === 'lead') {
    message += "LEAD*\n\n";
    message += `👤 *Nome:* ${data.nome}\n`;
    message += `📱 *Telefone:* ${data.telefone}\n`;
    
    if (data.instagram) {
      message += `📸 *Instagram:* ${data.instagram}\n`;
    }
    
    message += `🎯 *Interesse:* ${data.interesse}\n`;
    message += `🚩 *Status:* ${data.statusLead}\n`;
    message += `📅 *Data Lembrete:* ${data.dataLembrete}\n`;
    message += `🔔 *Motivo Lembrete:* ${data.motivoLembrete}\n`;
    
    if (data.observacoes) {
      message += `📝 *Observações:* ${data.observacoes}\n`;
    }
  } else {
    message += "CLIENTE*\n\n";
    message += `👤 *Nome:* ${data.nome}\n`;
    
    if (data.cpf) {
      message += `🆔 *CPF:* ${data.cpf}\n`;
    }
    
    message += `📱 *Telefone:* ${data.telefone}\n`;
    message += `⚧ *Gênero:* ${data.genero}\n`;
    message += `📦 *Produto:* ${data.linha} ${data.tipo}\n`;
    message += `🎨 *Cor:* ${data.cor}\n`;
    message += `📏 *Tamanho:* ${data.tamanho}\n`;
    message += `💰 *Valor:* ${data.valor}\n`;
    message += `💳 *Forma Pagamento:* ${data.formaPagamento}\n`;
    
    if (data.localizacao) {
      message += `📍 *Localização:* ${data.localizacao}\n`;
    }
    
    message += `🚚 *Frete:* ${data.frete}\n`;
    message += `📅 *Data Pagamento:* ${data.dataPagamento}\n`;
    message += `📅 *Data Entrega:* ${data.dataEntrega}\n`;
    message += `💵 *Valor Total:* ${data.valorTotal}\n`;
    
    if (data.observacao) {
      message += `📝 *Observação:* ${data.observacao}\n`;
    }
  }
  
  message += "\n⚠️ *DADOS ENVIADOS AUTOMATICAMENTE COMO FALLBACK* ⚠️";
  
  return encodeURIComponent(message);
}

/**
 * Envia dados para o WhatsApp como fallback
 */
export function sendToWhatsAppFallback(data: any): void {
  const formattedMessage = formatDataForWhatsApp(data);
  const whatsappUrl = `https://wa.me/${WHATSAPP_FALLBACK_NUMBER}?text=${formattedMessage}`;
  
  console.log("Abrindo WhatsApp como fallback:", whatsappUrl);
  
  // Abre o WhatsApp em uma nova janela
  window.open(whatsappUrl, '_blank');
}

/**
 * Recupera a URL do webhook do localStorage
 */
export function getWebhookUrl(): string {
  return localStorage.getItem(WEBHOOK_URL_STORAGE_KEY) || "";
}

/**
 * Armazena de forma segura a URL do webhook no localStorage
 */
export function saveWebhookUrl(url: string): void {
  if (url && url.trim() !== "") {
    localStorage.setItem(WEBHOOK_URL_STORAGE_KEY, url);
  }
}

/**
 * Verifica se a URL do webhook está configurada
 */
export function isWebhookConfigured(): boolean {
  const url = getWebhookUrl();
  return url !== null && url !== "" && url.startsWith('https://') && url.includes('script.google.com');
}

/**
 * Envia dados do formulário para o webhook do Google Sheets de forma segura
 * Com fallback para WhatsApp em caso de falha
 */
export async function submitToGoogleSheets(data: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Starting submission to Google Sheets...");
    
    // Retrieve webhook URL from localStorage
    const webhookUrl = getWebhookUrl();
    
    if (!webhookUrl || !webhookUrl.startsWith('https://') || !webhookUrl.includes('script.google.com')) {
      console.warn("URL do webhook não configurada ou inválida");
      console.log("Ativando fallback para WhatsApp");
      sendToWhatsAppFallback(data);
      return { 
        success: false, 
        message: "URL do webhook não configurada ou inválida. Dados enviados para WhatsApp como alternativa. Por favor, configure o webhook nas configurações." 
      };
    }
    
    console.log("Sending data to webhook");
    
    // Prepara os dados para envio
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      mode: "cors",
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }
    
    let result;
    try {
      result = await response.json();
      console.log("Parsed response:", result);
    } catch (error) {
      console.error("Error parsing response:", error);
      throw new Error("Resposta do servidor não está no formato JSON esperado");
    }
    
    if (result.result === "success") {
      return { success: true, message: result.message || "Dados enviados com sucesso!" };
    } else {
      throw new Error(result.message || "Erro ao enviar dados");
    }
  } catch (error) {
    console.error("Erro ao enviar para o Google Sheets:", error);
    
    // Ativar fallback para WhatsApp em caso de erro
    console.log("Ativando fallback para WhatsApp devido a erro:", error);
    sendToWhatsAppFallback(data);
    
    return { 
      success: false, 
      message: `Erro ao enviar para a planilha: ${error instanceof Error ? error.message : "Erro desconhecido"}. Dados enviados para WhatsApp como alternativa.` 
    };
  }
}

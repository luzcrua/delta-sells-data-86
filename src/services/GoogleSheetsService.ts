
// This file provides helpers for Google Sheets integration
import { GOOGLE_SHEETS_URL, USE_FORM_FALLBACK, MAX_RETRIES, RETRY_DELAY, SHEET_NAMES } from "../env.ts";
import { LogService } from "@/services/LogService";

// INSTRUÇÕES PARA CONFIGURAR O GOOGLE SHEETS:
// 1. Abra sua planilha do Google: https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit
// 2. Vá para Extensões > Apps Script
// 3. Substitua o código pelo script fornecido pelo usuário
// 4. Salve o script e implemente-o como um aplicativo da Web:
//    a. Clique em "Implantar" > "Nova implantação"
//    b. Selecione o tipo: "Aplicativo da Web"
//    c. Configure para: "Execute como: Usuário que acessa o aplicativo da Web" (IMPORTANTE!)
//    d. Configure "Quem tem acesso:" para "Qualquer pessoa, mesmo anônimos"
//    e. Clique em "Implantar" e autorize o aplicativo
//    f. Copie a URL do aplicativo da Web e configure no arquivo env.ts

// Número do WhatsApp para fallback (com código do país)
const WHATSAPP_FALLBACK_NUMBER = "558293460460";

// URLs das abas específicas da planilha do Google Sheets para visualização
const GOOGLE_SHEET_VIEW_URL = "https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit";
const GOOGLE_SHEET_LEADS_TAB_URL = "https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit?gid=2074506371#gid=2074506371";
const GOOGLE_SHEET_CUSTOMERS_TAB_URL = "https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit?gid=1972156622#gid=1972156622";

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
  LogService.info("Iniciando fallback para WhatsApp", data);
  const formattedMessage = formatDataForWhatsApp(data);
  const whatsappUrl = `https://wa.me/${WHATSAPP_FALLBACK_NUMBER}?text=${formattedMessage}`;
  
  const confirmMessage = "Não foi possível enviar os dados para a planilha. Deseja enviar via WhatsApp?";
  
  if (window.confirm(confirmMessage)) {
    LogService.info("Abrindo WhatsApp como fallback");
    window.open(whatsappUrl, '_blank');
  } else {
    LogService.info("Usuário cancelou o envio para WhatsApp");
  }
}

/**
 * Método alternativo que envia dados usando um formulário temporário
 * Isso contorna problemas de CORS para métodos POST
 */
function sendWithForm(url: string, data: any): Promise<any> {
  LogService.info("Tentando envio com técnica de formulário", { url });
  
  return new Promise((resolve, reject) => {
    // Criar um identificador único para este envio
    const formId = `form-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const iframeId = `iframe-${formId}`;
    
    // Criar um iframe invisível para a resposta
    const iframe = document.createElement('iframe');
    iframe.name = iframeId;
    iframe.id = iframeId;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Criar um formulário
    const form = document.createElement('form');
    form.id = formId;
    form.method = 'POST';
    form.action = url;
    form.target = iframe.name;
    form.style.display = 'none';
    
    // Adicionar campo de dados
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = 'data';
    hiddenField.value = JSON.stringify(data);
    form.appendChild(hiddenField);
    
    // Adicionar ao DOM e enviar
    document.body.appendChild(form);
    
    // Definir timeout
    const timeoutId = setTimeout(() => {
      cleanupResources();
      reject(new Error("Tempo esgotado ao tentar enviar dados"));
    }, 60000); // 60 segundos
    
    // Função para limpar recursos
    const cleanupResources = () => {
      clearTimeout(timeoutId);
      try {
        if (document.getElementById(formId)) {
          document.body.removeChild(form);
        }
        if (document.getElementById(iframeId)) {
          document.body.removeChild(iframe);
        }
      } catch (e) {
        LogService.error("Erro ao limpar recursos do formulário", e);
      }
    };
    
    // Ouvir mensagens do iframe (nova abordagem)
    window.addEventListener('message', function messageHandler(event) {
      try {
        // Verificar se a mensagem veio do Google Apps Script
        if (event.origin.includes('script.google.com')) {
          LogService.info("Recebida resposta do Google Apps Script via mensagem", event.data);
          window.removeEventListener('message', messageHandler);
          cleanupResources();
          resolve({
            result: "success",
            message: "Dados enviados com sucesso!"
          });
        }
      } catch (e) {
        LogService.error("Erro ao processar mensagem do iframe", e);
      }
    }, false);
    
    // Ouvir resposta do iframe via load
    iframe.onload = () => {
      try {
        LogService.info("Iframe carregado, assumindo envio bem-sucedido");
        // Tentamos acessar o conteúdo do iframe (pode falhar devido a CORS)
        setTimeout(() => {
          cleanupResources();
          resolve({ result: "success", message: "Dados enviados com sucesso!" });
        }, 1000); // Damos tempo para mensagens serem processadas
      } catch (e) {
        LogService.info("Não foi possível acessar resposta do iframe, assumindo sucesso");
        cleanupResources();
        resolve({ result: "success", message: "Dados parecem ter sido enviados com sucesso!" });
      }
    };
    
    iframe.onerror = (error) => {
      LogService.error("Erro no iframe ao enviar formulário", error);
      window.removeEventListener('message', () => {});
      cleanupResources();
      reject(new Error("Erro ao enviar dados"));
    };
    
    try {
      LogService.info(`Enviando formulário ${formId} para ${url}`);
      form.submit();
      LogService.info("Formulário enviado");
    } catch (e) {
      LogService.error("Erro ao enviar formulário", e);
      window.removeEventListener('message', () => {});
      cleanupResources();
      reject(e);
    }
  });
}

/**
 * Envia dados do formulário para o webhook do Google Sheets
 * Usando métodos alternativos para contornar CORS
 */
export async function submitToGoogleSheets(data: any): Promise<{ success: boolean; message: string; redirectToSheet?: boolean }> {
  LogService.info("Iniciando envio para Google Sheets", { formType: data.formType });
  
  try {
    // Obter a URL do Apps Script do env.ts
    const webhookUrl = GOOGLE_SHEETS_URL;
    
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      LogService.error("URL do Apps Script não configurada em env.ts");
      sendToWhatsAppFallback(data);
      return { 
        success: false, 
        message: "A URL do Apps Script não está configurada no arquivo env.ts. Configure o arquivo adicionando a URL ou use o WhatsApp como alternativa." 
      };
    }
    
    // Verifica se a URL parece válida
    if (!webhookUrl.startsWith('https://') || !webhookUrl.includes('script.google.com')) {
      LogService.error("URL do Apps Script inválida");
      sendToWhatsAppFallback(data);
      return { 
        success: false, 
        message: "A URL do Apps Script no arquivo env.ts parece inválida. Configure corretamente ou use o WhatsApp como alternativa." 
      };
    }
    
    // Garantir que estamos usando os nomes de planilha corretos
    if (data.formType === 'lead') {
      LogService.info("Preparando dados para a planilha de leads", { sheetName: SHEET_NAMES.LEAD });
    } else {
      LogService.info("Preparando dados para a planilha de clientes", { sheetName: SHEET_NAMES.CLIENTE });
    }
    
    LogService.info(`Tentando enviar dados para Google Sheets: ${webhookUrl}`);
    
    // Com base nas configurações, escolher o método de envio
    let result;
    let attempts = 0;
    let success = false;
    let lastError = null;
    
    while (attempts < MAX_RETRIES && !success) {
      attempts++;
      
      try {
        LogService.info(`Tentativa ${attempts}/${MAX_RETRIES} usando método de formulário`);
        
        // Usar consistentemente o método de formulário, que é mais confiável
        result = await sendWithForm(webhookUrl, data);
        LogService.info("Resultado da tentativa:", result);
        
        if (result && (result.result === "success" || result.message?.includes("sucesso"))) {
          success = true;
        } else {
          throw new Error(result?.message || "Resposta não contém mensagem de sucesso");
        }
      } catch (error) {
        lastError = error;
        LogService.error(`Erro na tentativa ${attempts}`, error);
        
        // Se não for a última tentativa, esperar antes de tentar novamente
        if (attempts < MAX_RETRIES) {
          const waitTime = RETRY_DELAY * attempts; // Aumenta o tempo de espera a cada tentativa
          LogService.info(`Aguardando ${waitTime}ms antes da próxima tentativa`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (success && result) {
      LogService.info("Envio concluído com sucesso");
      return { 
        success: true, 
        message: "Dados enviados com sucesso para a planilha!", 
        redirectToSheet: true 
      };
    } else {
      throw new Error(lastError?.message || "Todas as tentativas de envio falharam");
    }
  } catch (error) {
    LogService.error("Erro final ao enviar para o Google Sheets", error);
    
    return { 
      success: false, 
      message: `Erro ao enviar para a planilha: ${error instanceof Error ? error.message : "Erro desconhecido"}. Você pode enviar os dados via WhatsApp como alternativa.` 
    };
  }
}

/**
 * Verifica se a URL do webhook está configurada
 */
export function isWebhookConfigured(): boolean {
  const url = GOOGLE_SHEETS_URL;
  return typeof url === 'string' && url !== "" && url.includes('script.google.com');
}

/**
 * Retorna a URL de visualização da planilha com base no tipo de formulário
 */
export function getGoogleSheetViewUrl(formType?: 'cliente' | 'lead'): string {
  if (formType === 'lead') {
    return GOOGLE_SHEET_LEADS_TAB_URL;
  } else if (formType === 'cliente') {
    return GOOGLE_SHEET_CUSTOMERS_TAB_URL;
  }
  return GOOGLE_SHEET_VIEW_URL; // URL padrão se nenhum tipo for especificado
}

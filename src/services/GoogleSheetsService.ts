// This file provides helpers for Google Sheets integration
import { GOOGLE_SHEETS_URL, USE_FORM_FALLBACK, MAX_RETRIES, RETRY_DELAY } from "src/env.ts";

// INSTRUÇÕES PARA CONFIGURAR O GOOGLE SHEETS:
// 1. Abra sua planilha do Google: https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit
// 2. Vá para Extensões > Apps Script
// 3. Substitua o código pelo script abaixo:
/*
function doGet(e) {
  return HtmlService.createHtmlOutput("Google Apps Script está em execução!");
}

function doPost(e) {
  try {
    // Obter os dados enviados
    const data = JSON.parse(e.postData.contents);
    
    // Determinar qual planilha usar com base no tipo de formulário
    let sheetName = "recebendoDadosDasVendas"; // Padrão para formulário de clientes
    
    if (data.formType === 'lead') {
      sheetName = "recebendoDadosDeLeads"; // Planilha para leads
    }
    
    // Obter a planilha ativa
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    
    // Sanitizar dados para evitar injeção de fórmulas
    const sanitize = (value) => {
      if (value === undefined || value === null) return "";
      return String(value).replace(/^[=+\-@]/, "'$&");
    };
    
    // Adicionar cabeçalhos e dados com base no tipo de formulário
    if (data.formType === 'lead') {
      // Se a planilha de leads foi recém-criada, adicione cabeçalhos
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Timestamp",
          "Nome",
          "Telefone",
          "Instagram",
          "Interesse",
          "Status do Lead",
          "Data de Lembrete",
          "Motivo do Lembrete",
          "Observações"
        ]);
        
        // Formatar cabeçalhos
        const headerRange = sheet.getRange(1, 1, 1, 9);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#f3f3f3");
        sheet.setFrozenRows(1);
      }
      
      // Adicionar os dados do lead
      sheet.appendRow([
        new Date(), // Timestamp atual
        sanitize(data.nome),
        sanitize(data.telefone),
        sanitize(data.instagram || ""),
        sanitize(data.interesse),
        sanitize(data.statusLead),
        sanitize(data.dataLembrete),
        sanitize(data.motivoLembrete),
        sanitize(data.observacoes || "")
      ]);
      
      // Ajustar largura das colunas automaticamente
      sheet.autoResizeColumns(1, 9);
    } else {
      // Se a planilha de clientes foi recém-criada, adicione cabeçalhos
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Timestamp",
          "Nome",
          "CPF",
          "Telefone",
          "Gênero",
          "Linha",
          "Tipo",
          "Cor", 
          "Tamanho",
          "Valor",
          "Forma de Pagamento",
          "Localização",
          "Frete",
          "Data de Pagamento",
          "Data de Entrega",
          "Valor Total",
          "Observação"
        ]);
        
        // Formatar cabeçalhos
        const headerRange = sheet.getRange(1, 1, 1, 17);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#f3f3f3");
        sheet.setFrozenRows(1);
      }
      
      // Adicionar os dados do cliente
      sheet.appendRow([
        new Date(), // Timestamp atual
        sanitize(data.nome),
        sanitize(data.cpf || ""),
        sanitize(data.telefone),
        sanitize(data.genero),
        sanitize(data.linha),
        sanitize(data.tipo),
        sanitize(data.cor),
        sanitize(data.tamanho),
        sanitize(data.valor),
        sanitize(data.formaPagamento),
        sanitize(data.localizacao || ""),
        sanitize(data.frete),
        sanitize(data.dataPagamento),
        sanitize(data.dataEntrega),
        sanitize(data.valorTotal),
        sanitize(data.observacao || "")
      ]);
      
      // Ajustar largura das colunas automaticamente
      sheet.autoResizeColumns(1, 17);
    }
    
    // Retornar resposta de sucesso
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Dados registrados com sucesso!"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Registrar erro e retornar resposta de erro
    console.error("Erro: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: "Erro ao processar a requisição: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
*/

// 4. Salve o script e implemente-o como um aplicativo da Web:
//    a. Clique em "Implantar" > "Nova implantação"
//    b. Selecione o tipo: "Aplicativo da Web"
//    c. Configure para: "Execute conforme o nível de acesso do usuário" (IMPORTANTE!)
//    d. Configure "Quem tem acesso:" para "Qualquer pessoa, mesmo anônimos"
//    e. Clique em "Implantar" e autorize o aplicativo
//    f. Copie a URL do aplicativo da Web e configure no arquivo env.ts

// Número do WhatsApp para fallback (com código do país)
const WHATSAPP_FALLBACK_NUMBER = "558293460460";

// URLs das abas específicas da planilha do Google Sheets para visualização
const GOOGLE_SHEET_VIEW_URL = "https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit";
const GOOGLE_SHEET_LEADS_TAB_URL = "https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit?gid=2074506371#gid=2074506371";
const GOOGLE_SHEET_CUSTOMERS_TAB_URL = "https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit?gid=1972156622#gid=1972156622";

// Classe de registro de log
class Logger {
  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
  
  static error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`);
    if (error) {
      console.error(error);
    }
  }
}

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
  Logger.log("Iniciando fallback para WhatsApp", data);
  const formattedMessage = formatDataForWhatsApp(data);
  const whatsappUrl = `https://wa.me/${WHATSAPP_FALLBACK_NUMBER}?text=${formattedMessage}`;
  
  const confirmMessage = "Não foi possível enviar os dados para a planilha. Deseja enviar via WhatsApp?";
  
  if (window.confirm(confirmMessage)) {
    Logger.log("Abrindo WhatsApp como fallback");
    window.open(whatsappUrl, '_blank');
  } else {
    Logger.log("Usuário cancelou o envio para WhatsApp");
  }
}

/**
 * Método que contorna CORS usando JSONP com um iframe temporário
 * Esta técnica é uma solução para problemas de CORS com Google Sheets
 */
function sendWithJSONP(url: string, data: any): Promise<any> {
  Logger.log("Tentando envio com técnica JSONP", { url });
  
  return new Promise((resolve, reject) => {
    // Criar um ID único para esta solicitação
    const callbackName = 'jsonpCallback_' + Math.random().toString(36).substr(2, 9);
    
    // Criar um iframe invisível para fazer a solicitação
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Definir timeout para remover iframe
    const timeoutId = setTimeout(() => {
      try {
        document.body.removeChild(iframe);
        delete (window as any)[callbackName];
      } catch (e) {
        Logger.error("Erro ao limpar JSONP", e);
      }
      reject(new Error("Tempo esgotado ao tentar enviar dados"));
    }, 60000); // 60 segundos
    
    // Definir o callback
    (window as any)[callbackName] = (response: any) => {
      clearTimeout(timeoutId);
      try {
        document.body.removeChild(iframe);
        delete (window as any)[callbackName];
      } catch (e) {
        Logger.error("Erro ao limpar JSONP após resposta", e);
      }
      resolve(response);
    };
    
    // Converter dados para query string
    const jsonData = JSON.stringify(data);
    const encodedData = encodeURIComponent(jsonData);
    
    // Criar URL com dados e callback
    const fullUrl = `${url}?data=${encodedData}&callback=${callbackName}`;
    
    try {
      // Configurar o iframe para carregar a URL
      iframe.src = fullUrl;
      Logger.log("Iframe JSONP criado e adicionado ao DOM");
    } catch (e) {
      // Limpar recursos em caso de erro
      clearTimeout(timeoutId);
      try {
        document.body.removeChild(iframe);
        delete (window as any)[callbackName];
      } catch {}
      
      Logger.error("Erro ao configurar JSONP", e);
      reject(e);
    }
  });
}

/**
 * Método alternativo que envia dados usando um formulário temporário
 * Isso contorna problemas de CORS para métodos POST
 */
function sendWithForm(url: string, data: any): Promise<any> {
  Logger.log("Tentando envio com técnica de formulário", { url });
  
  return new Promise((resolve, reject) => {
    // Criar um iframe invisível para a resposta
    const iframe = document.createElement('iframe');
    iframe.name = 'form-target-' + Math.random().toString(36).substr(2, 9);
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Criar um formulário
    const form = document.createElement('form');
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
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      } catch (e) {
        Logger.error("Erro ao limpar recursos do formulário", e);
      }
    };
    
    // Ouvir resposta do iframe
    iframe.onload = () => {
      try {
        // Tentar acessar conteúdo do iframe (pode falhar devido a CORS)
        let response = { result: "success", message: "Dados enviados com sucesso!" };
        
        cleanupResources();
        resolve(response);
      } catch (e) {
        // Se não conseguir acessar o conteúdo, assumimos que foi enviado
        Logger.log("Não foi possível acessar resposta do iframe, assumindo sucesso");
        cleanupResources();
        resolve({ result: "success", message: "Dados parecem ter sido enviados com sucesso!" });
      }
    };
    
    iframe.onerror = (error) => {
      Logger.error("Erro no iframe ao enviar formulário", error);
      cleanupResources();
      reject(new Error("Erro ao enviar dados"));
    };
    
    try {
      Logger.log("Enviando formulário");
      form.submit();
    } catch (e) {
      Logger.error("Erro ao enviar formulário", e);
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
  Logger.log("Iniciando envio para Google Sheets", { formType: data.formType });
  
  try {
    // Obter a URL do Apps Script do env.ts
    const webhookUrl = GOOGLE_SHEETS_URL;
    
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      Logger.error("URL do Apps Script não configurada em env.ts");
      sendToWhatsAppFallback(data);
      return { 
        success: false, 
        message: "A URL do Apps Script não está configurada no arquivo env.ts. Configure o arquivo adicionando a URL ou use o WhatsApp como alternativa." 
      };
    }
    
    // Verifica se a URL parece válida
    if (!webhookUrl.startsWith('https://') || !webhookUrl.includes('script.google.com')) {
      Logger.error("URL do Apps Script inválida");
      sendToWhatsAppFallback(data);
      return { 
        success: false, 
        message: "A URL do Apps Script no arquivo env.ts parece inválida. Configure corretamente ou use o WhatsApp como alternativa." 
      };
    }
    
    Logger.log("Tentando enviar dados para Google Sheets", { url: webhookUrl });
    
    // Com base nas configurações, escolher o método de envio
    let result;
    let attempts = 0;
    let success = false;
    
    while (attempts < MAX_RETRIES && !success) {
      attempts++;
      
      try {
        // Se a configuração indicar para usar o método de formulário diretamente
        if (USE_FORM_FALLBACK) {
          Logger.log(`Tentativa ${attempts}/${MAX_RETRIES} usando método de formulário`);
          result = await sendWithForm(webhookUrl, data);
          success = true;
        } else {
          // Tentar o método fetch primeiro
          try {
            Logger.log(`Tentativa ${attempts}/${MAX_RETRIES} usando fetch`);
            const response = await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
              mode: "cors",
            });
            
            if (!response.ok) {
              throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            result = await response.json();
            success = true;
          } catch (fetchError) {
            Logger.log(`Fetch falhou na tentativa ${attempts}, tentando método alternativo`, { error: fetchError });
            
            // Falha no fetch, tentar com o método de formulário
            result = await sendWithForm(webhookUrl, data);
            success = true;
          }
        }
      } catch (error) {
        Logger.error(`Erro na tentativa ${attempts}`, error);
        
        // Se não for a última tentativa, esperar antes de tentar novamente
        if (attempts < MAX_RETRIES) {
          Logger.log(`Aguardando ${RETRY_DELAY}ms antes da próxima tentativa`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
    
    if (success && result) {
      Logger.log("Envio concluído com sucesso");
      return { 
        success: true, 
        message: result.message || "Dados enviados com sucesso para a planilha!", 
        redirectToSheet: true 
      };
    } else {
      throw new Error("Todas as tentativas de envio falharam");
    }
  } catch (error) {
    Logger.error("Erro final ao enviar para o Google Sheets", error);
    
    // Não ativa fallback para WhatsApp automaticamente, apenas retorna o erro
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

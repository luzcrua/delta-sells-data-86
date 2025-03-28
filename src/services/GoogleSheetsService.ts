
// This file provides helpers for Google Sheets integration

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
//    c. Configure "Executar como:" para "Eu" (sua conta do Google)
//    d. Configure "Quem tem acesso:" para "Qualquer pessoa"
//    e. Clique em "Implantar" e autorize o aplicativo
//    f. Copie a URL do aplicativo da Web - esta URL deve ser inserida no botão 
//       de configuração (ícone de engrenagem) no canto superior direito do formulário

/**
 * Envia dados do formulário para o webhook do Google Sheets de forma segura
 */
export async function submitToGoogleSheets(data: any, webhookUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Starting submission to Google Sheets...");
    
    if (!webhookUrl) {
      throw new Error("URL do webhook do Google Sheets não configurada");
    }
    
    // Verifica se a URL parece válida (começa com https:// e contém script.google.com)
    if (!webhookUrl.startsWith('https://') || !webhookUrl.includes('script.google.com')) {
      throw new Error("URL do webhook inválida. Deve ser uma URL segura do Google Apps Script");
    }
    
    console.log("Sending data to webhook:", webhookUrl);
    
    // Prepara os dados para envio
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      mode: "cors", // Habilita CORS
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
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro desconhecido ao enviar dados" 
    };
  }
}

/**
 * Armazena de forma segura a URL do webhook no localStorage
 */
export function saveWebhookUrl(url: string): void {
  if (url && url.trim() !== "") {
    localStorage.setItem("google_sheets_webhook_url", url);
  }
}

/**
 * Recupera a URL do webhook do localStorage
 */
export function getWebhookUrl(): string {
  return localStorage.getItem("google_sheets_webhook_url") || "";
}

/**
 * Verifica se a URL do webhook está configurada
 */
export function isWebhookConfigured(): boolean {
  const url = getWebhookUrl();
  return url !== null && url !== "";
}

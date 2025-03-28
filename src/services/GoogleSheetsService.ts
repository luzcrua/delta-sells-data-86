
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
    // Verifica se há dados no corpo da requisição
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        result: "error",
        message: "Dados não encontrados na requisição"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Analisa os dados recebidos
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService.createTextOutput(JSON.stringify({
        result: "error",
        message: "Falha ao processar os dados: " + parseError.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Valida os campos obrigatórios
    var requiredFields = ["nome", "telefone", "genero", "linha", "tipo", "cor", "tamanho", 
                         "valor", "formaPagamento", "frete", "dataPagamento", "dataEntrega", "valorTotal"];
    
    var missingFields = [];
    for (var i = 0; i < requiredFields.length; i++) {
      if (!data[requiredFields[i]]) {
        missingFields.push(requiredFields[i]);
      }
    }
    
    if (missingFields.length > 0) {
      return ContentService.createTextOutput(JSON.stringify({
        result: "error",
        message: "Campos obrigatórios ausentes: " + missingFields.join(", ")
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obtém a planilha ativa
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("recebendoDadosDasVendas");
    
    if (!sheet) {
      // Se a aba não existir, cria uma nova
      sheet = ss.insertSheet("recebendoDadosDasVendas");
      
      // Adiciona cabeçalhos à nova aba
      var headers = [
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
      ];
      sheet.appendRow(headers);
      
      // Formata os cabeçalhos
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#f3f3f3");
      sheet.setFrozenRows(1);
    }
    
    // Sanitiza e prepara os dados para inserção
    var sanitizeData = function(value) {
      if (value === undefined || value === null) {
        return "";
      }
      // Converte para string e remove caracteres potencialmente problemáticos
      return String(value).replace(/[=+\-@]/g, function(match) {
        return "'" + match;
      });
    };
    
    // Prepara a linha de dados para ser adicionada
    var row = [
      new Date(), // Timestamp
      sanitizeData(data.nome),
      sanitizeData(data.cpf || ""),
      sanitizeData(data.telefone),
      sanitizeData(data.genero),
      sanitizeData(data.linha),
      sanitizeData(data.tipo),
      sanitizeData(data.cor),
      sanitizeData(data.tamanho),
      sanitizeData(data.valor),
      sanitizeData(data.formaPagamento),
      sanitizeData(data.localizacao || ""),
      sanitizeData(data.frete),
      sanitizeData(data.dataPagamento),
      sanitizeData(data.dataEntrega),
      sanitizeData(data.valorTotal),
      sanitizeData(data.observacao || "")
    ];
    
    // Adiciona a linha à planilha
    sheet.appendRow(row);
    
    // Formata automaticamente as colunas para melhor visualização
    sheet.autoResizeColumns(1, row.length);
    
    // Retorna resposta de sucesso
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Dados registrados com sucesso na planilha!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Registra o erro completo nos logs do Apps Script
    console.error("Erro ao processar a requisição: " + error.toString());
    
    // Retorna resposta de erro
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
//    f. Copie a URL do aplicativo da Web - você precisará inserir esta URL na configuração do seu aplicativo

// IMPORTANTE: Segurança
// 1. Nunca compartilhe a URL do webhook no código do repositório GitHub
// 2. Use o botão de configuração no aplicativo para inserir a URL do webhook
// 3. A URL será armazenada apenas no localStorage do navegador do usuário
// 4. Sempre use HTTPS para comunicação segura
// 5. Considere implementar alguma forma de autenticação adicional se necessário

/**
 * Envia dados do formulário para o webhook do Google Sheets de forma segura
 */
export async function submitToGoogleSheets(data: any, webhookUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!webhookUrl) {
      throw new Error("URL do webhook do Google Sheets não configurada");
    }
    
    // Verifica se a URL parece válida (começa com https:// e contém script.google.com)
    if (!webhookUrl.startsWith('https://') || !webhookUrl.includes('script.google.com')) {
      throw new Error("URL do webhook inválida. Deve ser uma URL segura do Google Apps Script");
    }
    
    // Prepara os dados para envio
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

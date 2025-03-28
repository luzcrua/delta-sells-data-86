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
    // Obter a planilha ativa
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("recebendoDadosDasVendas") || ss.insertSheet("recebendoDadosDasVendas");
    
    // Se a planilha foi recém-criada, adicione cabeçalhos
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
    
    // Obter dados do POST
    const data = JSON.parse(e.postData.contents);
    
    // Sanitizar dados para evitar injeção de fórmulas
    const sanitize = (value) => {
      if (value === undefined || value === null) return "";
      return String(value).replace(/^[=+\-@]/, "'$&");
    };
    
    // Adicionar uma nova linha com os dados recebidos
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

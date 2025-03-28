// This file provides helpers for Google Sheets integration

// Instructions for setting up Google Sheets:
// 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1nys3YrD1-0tshVfcFSs_3ColOKifB4GQL92s5xD3vxE/edit
// 2. Go to Extensions > Apps Script
// 3. Replace the code with the following:
/*
function doGet(e) {
  return HtmlService.createHtmlOutput("Google Apps Script is running!");
}

function doPost(e) {
  try {
    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("recebendoDadosDasVendas");
    
    if (!sheet) {
      // If the sheet doesn't exist, create it
      sheet = ss.insertSheet("recebendoDadosDasVendas");
      
      // Add headers to the new sheet
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
    }
    
    // Prepare the data row to be appended
    var row = [
      new Date(), // Timestamp
      data.nome,
      data.cpf || "",
      data.telefone,
      data.genero,
      data.linha,
      data.tipo,
      data.cor,
      data.tamanho,
      data.valor,
      data.formaPagamento,
      data.localizacao || "",
      data.frete,
      data.dataPagamento,
      data.dataEntrega,
      data.valorTotal,
      data.observacao || ""
    ];
    
    // Append the row to the sheet
    sheet.appendRow(row);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Dados registrados com sucesso!"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: "Erro: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
*/
// 4. Save the script and deploy it as a web app:
//    a. Click on "Deploy" > "New deployment"
//    b. Select type: "Web app"
//    c. Set "Execute as:" to "Me" (your Google account)
//    d. Set "Who has access:" to "Anyone"
//    e. Click "Deploy" and authorize the app
//    f. Copy the Web app URL - you'll need this for the WEBHOOK_URL in your app
// 5. IMPORTANT: Keep the deployed URL secure by:
//    a. NOT hardcoding it in your GitHub repository code
//    b. Setting it on your hosting platform as an environment variable
//    c. Or using the local storage approach described below

/**
 * Securely submits form data to Google Sheets webhook
 */
export async function submitToGoogleSheets(data: any, webhookUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!webhookUrl) {
      throw new Error("URL do webhook do Google Sheets não configurada");
    }
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
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
 * Helper function to securely store webhook URL in localStorage
 */
export function saveWebhookUrl(url: string): void {
  if (url && url.trim() !== "") {
    localStorage.setItem("google_sheets_webhook_url", url);
  }
}

/**
 * Helper function to retrieve webhook URL from localStorage
 */
export function getWebhookUrl(): string {
  return localStorage.getItem("google_sheets_webhook_url") || "";
}

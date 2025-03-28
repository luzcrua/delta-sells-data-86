
// This file provides helpers for Google Sheets integration

// Instructions for setting up Google Sheets:
// 1. Create a new Google Sheet
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
    
    // Get the active spreadsheet and the first sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    
    // Prepare the data row to be appended
    var row = [
      new Date(), // Timestamp
      data.nome,
      data.cpf,
      data.telefone,
      data.genero,
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
// 4. Save the script and deploy it as a web app
// 5. Set "Execute the app as:" to "Me"
// 6. Set "Who has access to the app:" to "Anyone"
// 7. Click "Deploy" and copy the URL
// 8. Use this URL as the WEBHOOK_URL in your form submission

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


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { getWebhookUrl, saveWebhookUrl, isWebhookConfigured } from "@/services/GoogleSheetsService";
import { ArrowLeft, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Settings: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWebhookUrl(getWebhookUrl());
  }, []);

  const handleSave = () => {
    setSaving(true);
    
    try {
      if (!webhookUrl || !webhookUrl.startsWith('https://') || !webhookUrl.includes('script.google.com')) {
        toast({
          title: "URL inválida",
          description: "Por favor, forneça uma URL válida do Google Apps Script.",
          variant: "destructive",
        });
        return;
      }
      
      saveWebhookUrl(webhookUrl);
      
      toast({
        title: "Configurações salvas",
        description: "URL do webhook foi salva com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-delta-50 to-delta-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="text-delta-600 hover:text-delta-800 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-delta-950">Configurações</h1>
          </div>
          <p className="text-delta-700">Configure as integrações e ajustes do sistema</p>
        </header>

        <Card className="shadow-lg mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-delta-800">
              Integração com Google Sheets
            </CardTitle>
            <CardDescription>
              Configure a URL do webhook para enviar dados para o Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook do Google Apps Script</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/..."
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Esta URL será armazenada apenas localmente em seu navegador e não será compartilhada.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Instruções de Configuração:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Abra sua planilha do Google: <a href="https://docs.google.com/spreadsheets/" target="_blank" className="text-delta-600 hover:underline">Google Sheets</a></li>
                  <li>Vá para Extensões &gt; Apps Script</li>
                  <li>Cole o script fornecido nas instruções de configuração</li>
                  <li>Salve o script e implemente-o como aplicativo da Web</li>
                  <li>Copie a URL do aplicativo e cole-a no campo acima</li>
                </ol>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center">
              {isWebhookConfigured() ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Configurado</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>Não configurado</span>
                </div>
              )}
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-delta-600 hover:bg-delta-700"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-delta-800">
              Código do Google Apps Script
            </CardTitle>
            <CardDescription>
              Copie este código para o seu projeto Google Apps Script
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-white p-4 rounded-md overflow-auto max-h-[400px] text-sm font-mono">
              <pre>{`function doGet(e) {
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
      return String(value).replace(/^[=+\\-@]/, "'$&");
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
}`}</pre>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-delta-700 text-sm">
          <p>© 2023 DELTA SELLS. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Settings;

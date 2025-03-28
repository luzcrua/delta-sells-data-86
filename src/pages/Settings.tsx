
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { saveWebhookUrl, getWebhookUrl } from "@/services/GoogleSheetsService";
import { Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

const Settings: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    // Load saved webhook URL from localStorage on component mount
    const savedUrl = getWebhookUrl();
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do App Script",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl.startsWith('https://') || !webhookUrl.includes('script.google.com')) {
      toast({
        title: "Aviso",
        description: "A URL parece inválida. Deve começar com 'https://' e conter 'script.google.com'",
        variant: "destructive",
      });
      return;
    }

    saveWebhookUrl(webhookUrl);
    toast({
      title: "Sucesso",
      description: "URL do App Script salva com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-delta-50 to-delta-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <Link to="/" className="flex items-center text-delta-600 hover:text-delta-800 mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar para página inicial
          </Link>
          <h1 className="text-3xl font-bold text-delta-950 mb-2">Configurações</h1>
          <p className="text-delta-700">
            Configure a URL do Google Apps Script para integração com planilhas
          </p>
        </header>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-delta-800 mb-4">
                  Integração com Google Sheets
                </h2>
                <p className="mb-4 text-delta-600 text-sm">
                  Para permitir o envio de dados para o Google Sheets, você precisa configurar a URL do Google Apps Script.
                  Este é o ID de implementação do seu aplicativo web Apps Script que recebe os dados e os registra na planilha.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url" className="text-delta-700">
                    URL do Google Apps Script
                  </Label>
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/your-deployment-id/exec"
                    className="w-full"
                  />
                  <p className="text-xs text-delta-500">
                    Exemplo: https://script.google.com/macros/s/AKfycbzn0oGRz1xD2di7Q6DgW047sW8Cr49LUApET2w9yfUjCT9DsHSh2fOFffyRRuxRWTiPJg/exec
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={handleSave}
                    className="bg-delta-600 hover:bg-delta-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 bg-delta-50 p-4 rounded-md border border-delta-200">
                <h3 className="text-sm font-medium text-delta-800 mb-2">Como obter a URL do Apps Script?</h3>
                <ol className="text-xs text-delta-600 list-decimal pl-4 space-y-1">
                  <li>Abra sua planilha do Google Sheets</li>
                  <li>Vá para Extensões &gt; Apps Script</li>
                  <li>No editor do Apps Script, clique em "Implantar" &gt; "Nova implantação"</li>
                  <li>Selecione o tipo "Aplicativo da Web"</li>
                  <li>Configure "Quem tem acesso" para "Qualquer pessoa"</li>
                  <li>Clique em "Implantar"</li>
                  <li>Copie a URL do aplicativo web que aparecerá</li>
                </ol>
              </div>
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

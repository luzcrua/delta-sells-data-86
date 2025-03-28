
import React, { useState, useEffect } from "react";
import { LogService } from "@/services/LogService";
import { isWebhookConfigured } from "@/services/GoogleSheetsService";
import LeadForm from "@/components/LeadForm";
import CustomerForm from "@/components/CustomerForm";

const Index = () => {
  const [activeTab, setActiveTab] = useState("cliente");
  const [isConfigured, setIsConfigured] = useState(false);
  
  useEffect(() => {
    // Verificar se a URL do webhook está configurada
    const configured = isWebhookConfigured();
    setIsConfigured(configured);
    LogService.info(`Index - Webhook configurado: ${configured}`);
    
    // Log de inicialização da página
    LogService.info("Página Index carregada com sucesso");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-delta-50 to-delta-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 relative">
          <h1 className="text-3xl md:text-4xl font-bold text-delta-950 mb-2">
            DELTA SELLS CLIENTS
          </h1>
          <p className="text-delta-700 text-lg">
            Cadastro de clientes e registro de vendas
          </p>
          
          {!isConfigured && (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md">
              <p className="text-sm">
                ⚠️ A URL do App Script não está configurada no arquivo env.ts. Configure o arquivo para habilitar o envio direto para o Google Sheets.
              </p>
            </div>
          )}
        </header>

        <div className="flex justify-center mb-6 border-b border-delta-200">
          <button
            className={`tab-button ${activeTab === "cliente" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("cliente");
              LogService.info("Mudança de aba: Cliente");
            }}
          >
            CLIENTE
          </button>
          <button
            className={`tab-button ${activeTab === "lead" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("lead");
              LogService.info("Mudança de aba: Lead");
            }}
          >
            LEAD
          </button>
        </div>

        <div className={`tab-panel ${activeTab === "cliente" ? "active" : ""}`}>
          <CustomerForm />
        </div>

        <div className={`tab-panel ${activeTab === "lead" ? "active" : ""}`}>
          <LeadForm />
        </div>

        <footer className="mt-8 text-center text-delta-700 text-sm">
          <p>© 2023 DELTA SELLS. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

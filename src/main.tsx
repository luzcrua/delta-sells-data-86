
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from "@/components/ui/toaster"
import { LogService } from './services/LogService'

// Adicionar um listener para mensagens que podem vir do Google Apps Script
window.addEventListener('message', function(event) {
  // Verificar se a origem é confiável (Google Scripts)
  if (event.origin.includes('script.google.com') || event.origin.includes('google.com')) {
    LogService.info('Mensagem recebida do Google Apps Script:', event.data);
    
    try {
      // Tentar analisar a resposta, se for uma string JSON
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        LogService.info('Dados processados da mensagem:', data);
      }
    } catch (error) {
      LogService.info('Recebida mensagem não-JSON do iframe:', event.data);
    }
  }
});

// Configurar monitoramento de CORS
LogService.monitorCORSErrors();

// Inicializar mensagem de log
LogService.info('📊 DELTA SELLS CLIENTS - Aplicação iniciando...', {});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
)

LogService.info('📊 DELTA SELLS CLIENTS - Interface renderizada', {});

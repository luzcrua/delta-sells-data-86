
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import './index.css'
import { Toaster } from "@/components/ui/toaster"
import Index from './pages/Index'
import NotFound from './pages/NotFound'
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster />
  </React.StrictMode>,
)

LogService.info('📊 DELTA SELLS CLIENTS - Interface renderizada', {});

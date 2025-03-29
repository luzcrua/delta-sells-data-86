
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LogService } from './services/LogService.ts'

// Inicializar serviço de log
LogService.info('📊 DELTA SELLS CLIENTS - Aplicação iniciando...');

// Monitorar erros não tratados
window.addEventListener('error', (event) => {
  LogService.error('Erro não tratado:', {
    message: event.message,
    source: event.filename,
    lineNo: event.lineno,
    colNo: event.colno,
    error: event.error
  });
});

// Escutar mensagens do Google Sheets
window.addEventListener('message', (event) => {
  // Verificar se a mensagem veio do Google Apps Script
  if (event.origin.includes('script.google.com')) {
    try {
      LogService.info('Mensagem recebida do Google Apps Script:', event.data);
      
      // Tentar processar a resposta como JSON se for string
      if (typeof event.data === 'string') {
        try {
          const jsonData = JSON.parse(event.data);
          LogService.info('Dados JSON processados:', jsonData);
        } catch (e) {
          // Se não for JSON, apenas registra a string
          LogService.info('Conteúdo da mensagem (não-JSON):', event.data);
        }
      }
    } catch (error) {
      LogService.error('Erro ao processar mensagem do Google Apps Script:', error);
    }
  }
});

// Inicializar aplicação
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

LogService.info('📊 DELTA SELLS CLIENTS - Interface renderizada');

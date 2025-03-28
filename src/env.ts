
// Armazena a URL do Google Sheets
// IMPORTANTE: Este arquivo deve ser incluído no .gitignore manualmente
// Insira abaixo a URL do seu Google Apps Script Web App entre as aspas
export const GOOGLE_SHEETS_URL: string = "https://script.google.com/macros/s/AKfycbzn0oGRz1xD2di7Q6DgW047sW8Cr49LUApET2w9yfUjCT9DsHSh2fOFffyRRuxRWTiPJg/exec";

// Configuração de log
export const LOG_ENABLED: boolean = true;
export const LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' = 'debug';

// Configurações adicionais para contornar problemas de CORS
export const USE_FORM_FALLBACK: boolean = true; // Usar método de formulário em vez de fetch
export const MAX_RETRIES: number = 3; // Número máximo de tentativas
export const RETRY_DELAY: number = 1000; // Tempo entre tentativas (ms)

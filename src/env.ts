
// Armazena a URL do Google Sheets
// IMPORTANTE: Este arquivo deve ser incluído no .gitignore manualmente
// Insira abaixo a URL do seu Google Apps Script Web App entre as aspas
export const GOOGLE_SHEETS_URL: string = "https://script.google.com/macros/s/AKfycbxpfVGbYIcz28yXZ9xT8YZm83XAtrE2r67dPAEqoAqjYZm3mHDO6Qhos6_RF-qI0RauFg/exec";

// Configuração de log
export const LOG_ENABLED: boolean = true;
export const LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' = 'debug';

// Configurações adicionais para contornar problemas de CORS
export const USE_FORM_FALLBACK: boolean = true; // Usar método de formulário em vez de fetch
export const MAX_RETRIES: number = 20; // Número máximo de tentativas aumentado para 20
export const RETRY_DELAY: number = 1000; // Tempo entre tentativas (ms) reduzido para tentar mais rápido

// Configurações para as abas da planilha
export const SHEET_NAMES = {
  CLIENTE: "recebendoDadosDasVendas",
  LEAD: "recebendoDadosDeLeads"
};

// Defina como true para usar depuração extendida
export const DEBUG_MODE: boolean = true;

// Nome das colunas esperadas na planilha (usado para debug)
export const SHEET_COLUMNS = {
  CLIENTE: ["nome", "cpf", "telefone", "genero", "linha", "tipo", "cor", "tamanho", 
    "valor", "formaPagamento", "localizacao", "frete", "dataPagamento", "dataEntrega", 
    "valorTotal", "observacao"],
  LEAD: ["nome", "telefone", "instagram", "interesse", "statusLead", "dataLembrete", 
    "motivoLembrete", "observacoes"]
};

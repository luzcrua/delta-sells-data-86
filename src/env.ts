
// Armazena as URLs dos Google Sheets
// IMPORTANTE: Este arquivo deve ser incluído no .gitignore manualmente
// Insira abaixo as URLs dos seus Google Apps Script Web Apps entre as aspas
export const GOOGLE_SHEETS_URL = {
  CLIENTE: "",
  LEAD: ""
};

// Novas URLs para visualização direta das planilhas
export const GOOGLE_SHEET_VIEW_URL = {
  CLIENTE: "",
  LEAD: ""
};

// Configuração de log
export const LOG_ENABLED: boolean = true;
export const LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' = 'debug';

// Configurações adicionais para contornar problemas de CORS
export const USE_FORM_FALLBACK: boolean = true; // Usar método de formulário em vez de fetch
export const MAX_RETRIES: number = 30; // Número máximo de tentativas aumentado para 30
export const RETRY_DELAY: number = 1000; // Tempo entre tentativas (ms)

// Configurações para as abas da planilha
export const SHEET_NAMES = {
  CLIENTE: "Cliente",
  LEAD: "Lead"
};

// Defina como true para usar depuração extendida
export const DEBUG_MODE: boolean = true;

// Nome das colunas esperadas na planilha (usado para debug)
export const SHEET_COLUMNS = {
  CLIENTE: ["nome", "cpf", "telefone", "genero", "linha", "tipo", "cor", "tamanho", 
    "valor", "formaPagamento", "parcelamento", "jurosAplicado", "cupom", "localizacao", "frete", "dataPagamento", "dataEntrega", 
    "valorTotal", "observacao"],
  LEAD: ["nome", "telefone", "instagram", "interesse", "statusLead", "dataLembrete", 
    "motivoLembrete", "observacoes"]
};

// Número do WhatsApp para fallback (com código do país)
export const WHATSAPP_FALLBACK_NUMBER = "558293460460";

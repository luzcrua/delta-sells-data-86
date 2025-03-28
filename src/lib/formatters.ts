
// Mask formatters for input fields

// Format CPF: XXX.XXX.XXX-XX
export function formatCPF(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 3) {
    return numericValue;
  } else if (numericValue.length <= 6) {
    return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
  } else if (numericValue.length <= 9) {
    return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
  } else {
    return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
  }
}

// Format phone number: (XX) XXXXX-XXXX
export function formatPhone(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 2) {
    return numericValue.length ? `(${numericValue}` : '';
  } else if (numericValue.length <= 7) {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
  } else {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
  }
}

// Format currency: R$ XX,XX
export function formatCurrency(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue === '') {
    return '';
  }
  
  const valueInCents = parseInt(numericValue, 10);
  const valueInReais = valueInCents / 100;
  
  return valueInReais.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2
  });
}

// Format date: DD/MM/YY
export function formatDate(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 2) {
    return numericValue;
  } else if (numericValue.length <= 4) {
    return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
  } else {
    return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}/${numericValue.slice(4, 6)}`;
  }
}

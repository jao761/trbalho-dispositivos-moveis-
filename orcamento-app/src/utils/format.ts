export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getQuoteSubtotal(items: Array<{ quantity: number; unitPrice: number }>) {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

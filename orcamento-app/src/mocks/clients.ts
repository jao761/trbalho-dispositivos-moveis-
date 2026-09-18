import type { Client } from '@/types/client';

export const clients: Client[] = [
  { id: 'client-001', name: 'João da Silva', email: 'joao@email.com', phone: '(11) 99999-9999', document: '123.456.789-00', address: 'Rua das Flores, 120', city: 'São Paulo', state: 'SP', lastQuoteValue: 1250, quoteCount: 8, totalValue: 18460 },
  { id: 'client-002', name: 'Construtora Horizonte', email: 'compras@horizonte.com.br', phone: '(11) 98888-1111', document: '12.345.678/0001-90', address: 'Av. Central, 450', city: 'São Paulo', state: 'SP', lastQuoteValue: 4680, quoteCount: 12, totalValue: 52400 },
  { id: 'client-003', name: 'Marina Oliveira', email: 'marina.oliveira@email.com', phone: '(11) 97777-2222', document: '987.654.321-00', address: 'Rua do Comércio, 45', city: 'Santo André', state: 'SP', lastQuoteValue: 890, quoteCount: 3, totalValue: 3270 },
  { id: 'client-004', name: 'Oficina Mecânica Norte', email: 'contato@oficinanorte.com.br', phone: '(11) 96666-3333', document: '98.765.432/0001-10', address: 'Estrada Norte, 789', city: 'Guarulhos', state: 'SP', lastQuoteValue: 2140, quoteCount: 5, totalValue: 11350 },
];

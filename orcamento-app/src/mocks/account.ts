import type { Company } from '@/types/company';
import type { User } from '@/types/user';

export const currentUser: User = {
  id: 'user-001',
  name: 'João da Silva',
  email: 'joao@ferragenssilva.com.br',
  initials: 'JS',
};

export const currentCompany: Company = {
  id: 'company-001',
  name: 'Ferragens Silva',
  cnpj: '12.345.678/0001-90',
};

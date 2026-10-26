# Documentação unificada do projeto

## 1. Identificação

**Projeto:** Aplicativo de Gestão e Geração de Orçamentos  
**Repositório:** `jao761/trbalho-dispositivos-moveis-`  
**Escopo atual:** aplicativo Expo/React Native, APIs FastAPI para negócio, pedidos e pagamentos, e API de ingestão de produtos com PostgreSQL.

Esta documentação consolida a visão do produto, a história do usuário, os requisitos funcionais e não funcionais, o estado atual da implementação e o resultado da validação ponta a ponta realizada em 26/10/2026.

## 2. História do usuário

### História principal

> Como proprietário ou operador de uma pequena empresa, quero cadastrar clientes, consultar produtos e criar orçamentos com itens, quantidades, preços, descontos e observações, para gerar propostas comerciais, acompanhar sua aprovação, convertê-las em pedidos e controlar pagamentos em um único aplicativo.

### Critérios de aceite

1. O usuário consegue criar uma conta com sua empresa ou entrar com e-mail e senha.
2. O sistema mantém a sessão autenticada e restringe os dados à empresa do usuário.
3. O usuário consegue cadastrar, pesquisar e consultar clientes.
4. O usuário consegue criar um orçamento selecionando um cliente e adicionando itens.
5. O sistema calcula subtotal, desconto e total, impedindo valores finais negativos.
6. O usuário consegue visualizar, aprovar ou recusar um orçamento.
7. Um orçamento aprovado pode ser convertido em pedido.
8. O usuário consegue consultar pedidos e criar/acompanhar pagamentos.
9. Eventos de pagamento repetidos não geram processamento duplicado.
10. O sistema apresenta mensagens de erro quando uma API está indisponível, sem substituir silenciosamente dados reais por mocks.

## 3. Fluxo ponta a ponta esperado

```text
Cadastro/Login
  -> validação da sessão
  -> dashboard
  -> cadastro/pesquisa de cliente
  -> novo orçamento
  -> seleção de produtos
  -> quantidade, desconto e observações
  -> cálculo de subtotal e total
  -> visualização do orçamento
  -> aprovação
  -> conversão em pedido
  -> criação de pagamento
  -> confirmação por webhook
  -> pedido marcado como pago
```

## 4. Estado da implementação

| Área | Estado | Evidência |
|---|---|---|
| Login, cadastro e JWT | Implementado | `orcamento-app/src/app/index.tsx`, `cadastro.tsx`, `backend/api/core_api/routers/auth.py` |
| Persistência de sessão nativa | Implementado | `orcamento-app/src/services/session.ts` com `expo-secure-store` |
| Isolamento multiempresa | Implementado e coberto por testes | `backend/api/core_api/dependencies.py`, `backend/tests/test_multi_tenant.py` |
| Dashboard e histórico | Implementado | `backend/api/core_api/routers/dashboard.py`, `history.py` |
| Cadastro e consulta de clientes | Implementado | `backend/api/core_api/routers/clients.py` e telas de clientes |
| Criação e cálculo de orçamentos | Implementado | `backend/api/core_api/routers/quotes.py` e `orcamentos/novo.tsx` |
| Aprovação e recusa de orçamentos | Implementado na API; aprovação disponível na tela | `quotes.py`, `orcamentos/[id].tsx` |
| Conversão de orçamento em pedido | Implementado | `backend/api/order_api/routers/orders.py` |
| Pagamentos e webhook idempotente | Implementado na API | `backend/api/payment_api/routers/payments.py`, `webhooks.py` |
| Catálogo real de produtos no app | Pendente | A tela ainda usa mocks e o formulário bloqueia o catálogo quando mocks estão desativados |
| Geração real de PDF | Pendente | A tela de compartilhamento apenas informa que a ação será integrada futuramente |
| Compartilhamento real | Pendente | WhatsApp, e-mail, salvar e imprimir ainda são ações demonstrativas |
| Recuperação de senha | Pendente | O botão de recuperação no login não executa nenhuma ação |

## 5. Requisitos funcionais

| ID | Requisito | Situação |
|---|---|---|
| RF01 | Cadastrar usuário e empresa | Implementado |
| RF02 | Autenticar usuário por e-mail e senha | Implementado |
| RF03 | Restaurar, validar e encerrar sessão | Implementado |
| RF04 | Isolar usuários, clientes, orçamentos, pedidos e pagamentos por empresa | Implementado e testado por contrato |
| RF05 | Cadastrar cliente com dados comerciais e endereço | Implementado |
| RF06 | Pesquisar e visualizar clientes | Implementado |
| RF07 | Consultar histórico de orçamentos do cliente | Implementado |
| RF08 | Criar orçamento com cliente, itens, quantidade, preço, desconto e observações | Implementado |
| RF09 | Calcular subtotal e total do orçamento | Implementado no app e validado no backend |
| RF10 | Listar orçamentos e filtrar por status | Implementado |
| RF11 | Aprovar ou recusar orçamento | Implementado na API; recusa precisa ser exposta na interface |
| RF12 | Editar itens de orçamento | Implementado na API e com tela de itens |
| RF13 | Converter orçamento aprovado em pedido | Implementado |
| RF14 | Listar pedidos e atualizar status | Implementado |
| RF15 | Criar e consultar pagamentos | Implementado |
| RF16 | Processar webhook de pagamento com idempotência | Implementado e coberto por teste |
| RF17 | Consultar catálogo de produtos e estoque da API de ingestão | Parcial: API existe, app ainda não a consome |
| RF18 | Gerar PDF, salvar e compartilhar orçamento | Pendente; interface demonstrativa existente |
| RF19 | Recuperar senha | Pendente |

## 6. Requisitos não funcionais

| ID | Requisito | Situação |
|---|---|---|
| RNF01 | API REST documentada via OpenAPI/Swagger | Implementado pelos serviços FastAPI |
| RNF02 | Persistência em PostgreSQL, sem SQLite no ambiente principal | Implementado |
| RNF03 | Separação entre banco de negócio e banco de comércio | Implementado |
| RNF04 | Autenticação por JWT e armazenamento seguro no dispositivo | Implementado |
| RNF05 | Isolamento de dados entre empresas | Implementado e coberto por testes |
| RNF06 | Validação de entrada e mensagens HTTP explícitas | Implementado na maior parte da API |
| RNF07 | Requisições com timeout e tratamento de indisponibilidade | Implementado no cliente HTTP |
| RNF08 | Não usar mocks silenciosamente em integração | Implementado; mocks só com `EXPO_PUBLIC_USE_MOCKS=true` |
| RNF09 | TypeScript sem erros de compilação | Validado |
| RNF10 | Lint sem erros bloqueantes | Validado; existem avisos |
| RNF11 | Execução em celular físico por IP LAN configurável | Implementado por variáveis `EXPO_PUBLIC_*_API_URL` |
| RNF12 | Testes automatizados de isolamento, dashboard, histórico, pedido e pagamento | Implementados no backend, mas não executados neste ambiente |
| RNF13 | Disponibilidade e observabilidade de produção | Pendente |
| RNF14 | Proteção de segredos e configuração de produção | Parcial; exige revisão de `.env`, CORS, HTTPS e rotação de chaves |

## 7. Validação ponta a ponta realizada

### 7.1 Verificações executadas

| Verificação | Resultado |
|---|---|
| `cd orcamento-app && npx tsc --noEmit` | Aprovado |
| `cd orcamento-app && npm run lint` | Aprovado sem erros; 15 avisos |
| Health check `127.0.0.1:8000/health` | Não executado: serviço indisponível |
| Health check `127.0.0.1:8001/health` | Não executado: serviço indisponível |
| Health check `127.0.0.1:8002/health` | Não executado: serviço indisponível |
| `PYTHONPATH=. backend/.venv/bin/pytest -q` | Bloqueado: ambiente virtual e Python não disponíveis |
| Fluxo mobile real contra APIs e PostgreSQL | Bloqueado: APIs, banco e runtime mobile não estavam ativos |

### 7.2 Cenários E2E definidos

| Cenário | Resultado atual |
|---|---|
| Cadastro/login e restauração de sessão | Implementação presente; execução real bloqueada por APIs desligadas |
| Criar cliente e consultar detalhes | Implementação presente; execução real bloqueada por APIs desligadas |
| Criar orçamento com item e desconto | API e tela presentes; catálogo real bloqueia o caminho sem mocks |
| Aprovar orçamento | Implementação presente; execução real bloqueada por APIs desligadas |
| Converter orçamento em pedido | API e tela presentes; execução real bloqueada por APIs desligadas |
| Criar pagamento e receber webhook duplicado | Teste automatizado existente; não executado por falta do ambiente Python |
| Gerar PDF e compartilhar | Não implementado; tela é demonstrativa |

## 8. Bugs e pendências encontrados

| ID | Severidade | Local | Descrição | Impacto | Correção recomendada |
|---|---|---|---|---|---|
| BUG01 | Alta | `orcamento-app/src/app/index.tsx` | O botão “Esqueceu sua senha?” usa `onPress={() => undefined}` e não executa recuperação. | Usuário sem acesso não consegue iniciar recuperação de conta. | Criar endpoint de recuperação, tela/formulário e fluxo de token ou código expirável. |
| BUG02 | Alta | `orcamento-app/src/app/orcamentos/novo.tsx` | Com `EXPO_PUBLIC_USE_MOCKS=false`, o catálogo de produtos não é carregado e nenhum produto pode ser adicionado. | O fluxo principal de criação de orçamento não funciona em integração real. | Criar serviço de catálogo consumindo a API de ingestão e substituir o array mock na tela. |
| BUG03 | Média | `orcamento-app/src/app/produtos/index.tsx` | A tela de produtos sempre usa `@/mocks/products`, mesmo fora do modo de mocks. | Exibe dados fictícios como se fossem catálogo real. | Usar endpoint real quando mocks estiverem desativados e exibir erro explícito em falha. |
| BUG04 | Média | `orcamento-app/src/app/compartilhar.tsx` | PDF, WhatsApp, e-mail, salvar e imprimir apenas exibem “ação preparada para integração futura”. | O requisito de documento e compartilhamento não é atendido. | Implementar geração PDF e `Share`/integrações nativas, com testes em Android, iOS e web quando aplicável. |
| BUG05 | Baixa | `orcamento-app/src/app/orcamentos/[id].tsx` | A interface oferece aprovação, mas não oferece recusa, embora a API possua endpoint de rejeição. | O usuário não consegue concluir o fluxo de recusa pelo app. | Adicionar ação de recusar com confirmação e tratamento de estado. |
| BUG06 | Baixa | `orcamento-app/src/app/_layout.tsx` | O efeito de restauração usa `router` e `segments` sem dependências declaradas. | Pode causar comportamento desatualizado em mudanças de rota e mantém aviso de lint. | Refatorar a restauração para callback estável ou ajustar dependências com guarda contra redirecionamento repetido. |

## 9. Avisos de qualidade atuais

O lint termina sem erros, mas mantém 15 avisos relacionados principalmente a:

- imports não utilizados;
- uso de `Array<T>` em vez de `T[]`;
- dependências de `useEffect`;
- código de hidratação web.

Esses avisos não bloquearam a compilação, mas devem ser eliminados antes de uma versão de produção.

## 10. Próxima sequência recomendada

1. Subir PostgreSQL e as três APIs e executar os testes Python existentes.
2. Implementar o cliente de catálogo para conectar o app à API de ingestão.
3. Corrigir a tela de produtos para respeitar `EXPO_PUBLIC_USE_MOCKS`.
4. Executar o fluxo E2E completo: login, cliente, orçamento, aprovação, pedido, pagamento e webhook.
5. Implementar PDF e compartilhamento.
6. Implementar recuperação de senha.
7. Corrigir os avisos restantes do lint e adicionar testes de interface para os fluxos críticos.


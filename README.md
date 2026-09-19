# Aplicativo de Gestão e Geração de Orçamentos

## Visão Geral

O projeto consiste em um aplicativo mobile voltado para pequenos negócios e profissionais autônomos que precisam gerar e gerenciar orçamentos comerciais para seus clientes.

O objetivo principal é substituir o processo manual de montagem de orçamentos, geralmente realizado por meio de planilhas, documentos de texto ou papel, por um fluxo estruturado dentro de um aplicativo, permitindo o cadastro e gerenciamento de clientes, consulta de produtos, seleção de itens, cálculo automático de valores e geração de um documento em PDF pronto para ser compartilhado com o cliente.

O sistema busca atender não apenas a criação de orçamentos, mas também etapas relacionadas ao processo comercial, como histórico de clientes, acompanhamento de orçamentos, pedidos e, futuramente, pagamentos e compras.

A aplicação será preparada para suportar múltiplas empresas utilizando a mesma plataforma, mantendo os dados de cada organização isolados.

---

## Funcionalidades

### Autenticação e contas

- Cadastro de usuários.
- Login e autenticação.
- Recuperação de senha.
- Cadastro de dados da empresa.
- Controle de acesso dos usuários.
- Associação de usuários às respectivas empresas.

### Clientes

- Cadastro de clientes.
- Edição de clientes.
- Consulta de clientes.
- Pesquisa de clientes.
- Visualização do histórico comercial.
- Consulta dos orçamentos relacionados a cada cliente.

### Orçamentos

- Criação de orçamentos.
- Seleção de cliente.
- Pesquisa de produtos.
- Adição de produtos ou serviços.
- Edição de quantidade.
- Definição de preço unitário.
- Aplicação de descontos.
- Cálculo automático de subtotais.
- Cálculo automático do valor total.
- Inserção de observações.
- Definição de validade.
- Alteração do status do orçamento.
- Visualização do orçamento em formato de documento.

### Produtos

- Pesquisa de produtos por nome.
- Consulta de preços.
- Consulta de disponibilidade e estoque, quando disponibilizados pela API externa.
- Utilização de informações provenientes de uma API externa de produtos.

### Documentos

- Geração do orçamento em PDF.
- Visualização do documento.
- Salvamento do documento.
- Compartilhamento do orçamento.
- Compartilhamento por WhatsApp, e-mail ou outros aplicativos compatíveis.

### Pedidos e compras

Como evolução do projeto:

- Conversão de orçamento aprovado em pedido.
- Registro de pedidos.
- Acompanhamento do status do pedido.
- Integração futura com serviços externos para realização de compras.

### Pagamentos

Como evolução futura:

- Criação de pagamentos.
- Acompanhamento do status do pagamento.
- Integração com gateway de pagamento.
- Recebimento de atualizações através de webhooks.
- Possibilidade de integração com serviços como Mercado Pago.

---

## Fluxo Principal

```text
Cadastro/Login
      ↓
Dashboard
      ↓
Seleção do Cliente
      ↓
Novo Orçamento
      ↓
Pesquisa de Produtos
      ↓
Seleção dos Produtos
      ↓
Definição de Quantidade e Valores
      ↓
Aplicação de Desconto
      ↓
Cálculo do Total
      ↓
Visualização do Orçamento
      ↓
Geração do PDF
      ↓
Compartilhamento
      ↓
Aprovação do Orçamento
      ↓
Pedido
      ↓
Pagamento
      ↓
Compra

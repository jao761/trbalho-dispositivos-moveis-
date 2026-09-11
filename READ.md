# Aplicativo de Gestão e Geração de Orçamentos

## Visão Geral

O projeto consiste em um aplicativo voltado para pequenos negócios e profissionais autônomos que precisam gerar orçamentos comerciais para seus clientes. O objetivo principal é substituir o processo manual de montagem de orçamentos (geralmente feito em planilhas, documentos de texto ou papel) por um fluxo estruturado dentro de um aplicativo, permitindo o cadastro de clientes, a seleção de produtos ou serviços, o cálculo automático de valores e a geração de um documento em PDF pronto para ser compartilhado com o cliente.

O sistema não se limita a um cadastro simples de produtos. A proposta é cobrir o processo comercial completo: do cadastro do cliente até a entrega do orçamento final.

## Funcionalidades

- Cadastro e autenticação de usuários.
- Dashboard para gerenciamento geral do sistema.
- Cadastro, edição e consulta de clientes.
- Criação e gerenciamento de orçamentos.
- Adição, edição e remoção de itens de um orçamento.
- Pesquisa de produtos por nome através de uma API externa.
- Definição de quantidade e preço unitário dos itens.
- Cálculo automático de subtotais e do valor total do orçamento.
- Visualização do orçamento em formato de documento.
- Geração do orçamento em arquivo PDF.
- Compartilhamento do PDF gerado (WhatsApp, e-mail ou outros aplicativos).

## Fluxo Principal

Login/Cadastro → Dashboard → Seleção do Cliente → Novo Orçamento → Pesquisa e Seleção de Produtos → Definição de Quantidade e Valores → Itens do Orçamento → Cálculo do Total → Visualização do Documento → Geração do PDF → Compartilhamento.

## Telas

| Tela | Descrição |
|---|---|
| Cadastro/Login | Entrada do usuário no sistema, com dados pessoais e da empresa/profissional. |
| Dashboard | Tela principal, com acesso a clientes, produtos, orçamentos e histórico. |
| Clientes | Cadastro, edição, busca e histórico de orçamentos por cliente. |
| Geração de Orçamento | Seleção de cliente e adição de itens ao orçamento. |
| Itens do Orçamento | Listagem dos itens adicionados, com quantidade, valor unitário e subtotal. |
| Visualização do Orçamento | Apresentação do orçamento no formato de documento comercial. |
| Geração e Compartilhamento de PDF | Conversão do orçamento em PDF e envio ao cliente. |

## Modelo de Dados

As entidades abaixo são armazenadas localmente no dispositivo do usuário, sem dependência de um servidor remoto. As entidades principais do sistema e seus relacionamentos:

- Usuário 1 — N Cliente
- Cliente 1 — N Orçamento
- Orçamento 1 — N ItemOrçamento
- Produto 1 — N ItemOrçamento

Um usuário pode cadastrar vários clientes. Um cliente pode possuir vários orçamentos. Um orçamento é composto por vários itens, e cada item referencia um produto.

### Entidades e Campos

**USUARIO**
- id
- nome
- email
- senha
- data_cadastro

**CLIENTE**
- id
- usuario_id
- nome
- email
- telefone
- cpf_cnpj
- endereco
- data_cadastro

**ORCAMENTO**
- id
- cliente_id
- data_criacao
- validade
- valor_total
- status
- observacoes

**PRODUTO**
- id
- referência do produto na API externa
- nome
- preco
- moeda
- data_atualizacao

**ITEM_ORCAMENTO**
- id
- orcamento_id
- produto_id
- quantidade
- preco_unitario
- subtotal

Observação: os campos acima representam uma proposta de modelagem baseada no escopo funcional descrito. Ajustes podem ser necessários conforme decisões técnicas definitivas do projeto.

## Arquitetura

O projeto não possui backend próprio. Toda a lógica de negócio e o armazenamento de dados (usuários, clientes, orçamentos e itens) ficam no próprio aplicativo, com persistência local no dispositivo. A única comunicação externa é a consulta a uma API de terceiros para busca de produtos.

```
Aplicativo (React Native)
        |
        +--> Banco de Dados Local (no dispositivo)
        |
        +--> API Externa (consulta de produtos)
```

Não há servidor, API própria ou banco de dados remoto no escopo atual do projeto.

## Tecnologias

- React Native — desenvolvimento do aplicativo mobile.
- Banco de dados local (a definir a tecnologia específica, ex.: SQLite) — persistência dos dados no dispositivo.

Apenas as tecnologias listadas acima foram efetivamente definidas para o projeto até o momento. Não há backend, API própria ou banco de dados remoto.

## Objetivo Técnico

O projeto abrange, do ponto de vista de desenvolvimento de software, as seguintes áreas:

- Desenvolvimento de aplicativo mobile.
- Consumo de API REST externa.
- Modelagem e persistência de dados localmente no dispositivo.
- Integração com serviço externo para consulta de produtos.
- Gerenciamento de dados transacionais (clientes, orçamentos e itens).
- Geração de documentos (PDF) a partir de dados estruturados.
# Relatório de diagnóstico: timeout no cadastro

**Data:** 27/10/2026  
**Fluxo afetado:** cadastro de usuário e empresa no frontend Expo  
**Mensagem apresentada:** `A requisição expirou (timeout). Verifique se as APIs estão em execução.`

## 1. Sintoma

Ao pressionar **Cadastrar**, a tela permanecia aguardando até exibir o erro de timeout. A imagem anexada mostra que o formulário estava preenchido e que a falha ocorria antes de uma resposta de sucesso ou de validação da API.

## 2. Evidências coletadas

O frontend carregava estas URLs no arquivo `orcamento-app/.env`:

```text
EXPO_PUBLIC_CORE_API_URL=http://192.168.1.217:8000
EXPO_PUBLIC_ORDER_API_URL=http://192.168.1.217:8001
EXPO_PUBLIC_PAYMENT_API_URL=http://192.168.1.217:8002
```

O endereço `192.168.1.217` não estava atribuído à máquina. A verificação retornou:

```text
curl: (28) Connection timeout after 3001 ms
```

O endereço LAN ativo era `172.16.8.123`. Todos os serviços responderam por ele:

```text
8000: {"status":"ok","service":"core_api"}
8001: {"status":"ok","service":"order_api"}
8002: {"status":"ok","service":"payment_api"}
8050: {"status":"ok"}
```

Os containers estavam em execução e saudáveis:

```text
core-api       Up
order-api      Up
payment-api    Up
postgres       Up (healthy)
product-api    Up
```

Os logs do Core API não registravam uma requisição `POST /auth/register` durante a falha. Isso confirma que o pedido não chegava ao backend; o timeout acontecia na conexão do dispositivo/frontend com o endereço incorreto.

Como controle, o cadastro foi reproduzido diretamente no Core API usando `127.0.0.1:8000` e retornou:

```text
HTTP/1.1 201 Created
```

## 3. Causa raiz

O `.env` do Expo continha um endereço IP LAN antigo ou incorreto. O cliente HTTP (`src/services/api.ts`) possui timeout de 10 segundos e converte o `AbortError` na mensagem exibida na tela. Portanto, a mensagem indicava indisponibilidade, mas o problema real era a URL de rede configurada no frontend.

## 4. Correção aplicada

As URLs do `.env` foram atualizadas para o endereço LAN ativo:

```text
EXPO_PUBLIC_CORE_API_URL=http://172.16.8.123:8000
EXPO_PUBLIC_ORDER_API_URL=http://172.16.8.123:8001
EXPO_PUBLIC_PAYMENT_API_URL=http://172.16.8.123:8002
EXPO_PUBLIC_PRODUCT_API_URL=http://172.16.8.123:8050
EXPO_PUBLIC_USE_MOCKS=false
```

Também foi adicionada a URL da API de produtos, que não estava presente no `.env` local.

## 5. Validação

- Health check do Core API: aprovado.
- Health check do Order API: aprovado.
- Health check do Payment API: aprovado.
- Health check da Product API: aprovado.
- Cadastro direto via `POST /auth/register`: aprovado com `201 Created`.
- Logs recentes dos serviços: sem erros de aplicação.
- Erros históricos do Expo Go SDK 57 foram identificados no log, mas já foram tratados pela migração do projeto para SDK 58 no commit `ee81ad1`.

## 6. Procedimento para executar novamente

Após alterar variáveis `EXPO_PUBLIC_*`, reinicie o Metro para que o Expo recarregue o `.env`:

```bash
cd orcamento-app
npx expo start -c
```

No dispositivo físico, computador e celular precisam estar na mesma rede. Se o IP da máquina mudar, atualize novamente as URLs do `.env` e reinicie o Metro.

## 7. Observações

O timeout está corretamente implementado como proteção do cliente. Ele não deve ser removido; a correção necessária era apontar o frontend para o IP alcançável da máquina.

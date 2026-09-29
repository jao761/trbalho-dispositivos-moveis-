# API de produtos para orçamentos

API REST em FastAPI, SQLAlchemy e PostgreSQL. O ambiente completo é criado com
`docker compose`, sem depender de banco externo ou SQLite.

## Execução

```bash
docker compose up --build
```

O Compose usa valores padrão de desenvolvimento quando `.env` não existe:
`orcamentos`, `postgres`, `postgres`, portas `5432` e `8000`. Para customizar,
copie `.env.example` para `.env` antes de subir os serviços.

A documentação interativa fica em <http://localhost:8000/docs> e o health check
em <http://localhost:8000/health>.

Para recriar o banco e reaplicar o seed desde o início:

```bash
docker compose down -v
docker compose up --build
```

## Fonte dos dados e mapeamento

`dados-do-banco.sql` foi inspecionado como SQL UTF-8 contendo 20 categorias e
1000 produtos. O arquivo é a fonte literal dos dados e foi copiado para
`database/02-source.sql`, preservando seus `INSERT`s.

O arquivo de origem insere `categoria(id, nome, ativo)` e
`produto(id, nome, marca, codigo_barras, categoria_id)`. O schema mantém o
campo adicional `ativo` de categoria e os demais campos solicitados de produto.
Como esses campos não existem na fonte, `preco_custo`, `preco_venda`, `unidade`
e `estoque` permanecem `NULL`, e `produto.ativo` usa o default `TRUE`; nenhum
valor existente foi substituído ou descartado.

Os 1000 registros de `produto_estatistica` são dados estatísticos determinísticos
de demonstração, gerados a partir da ordenação dos IDs e não provenientes da
fonte original.

## Endpoints

- `GET /produtos/busca?q=martelo`: retorna um único produto ativo.
- `GET /produtos?q=martelo&page=1&pageSize=20&sort=relevancia`: lista produtos
  paginados. `pageSize` aceita de 1 a 100.
- `GET /produtos?sort=mais_comprados`: ordena por `qtd_vendida DESC` e depois
  `nome ASC`.
- `GET /produtos?incluir_inativos=true`: inclui produtos inativos; por padrão
  eles nunca são retornados.

A busca usa `lower(unaccent(...))` no PostgreSQL e ranqueia match exato,
prefixo, palavra inteira e ocorrência parcial, sempre com desempate por nome.
Filtros, ranking, ordenação, `LIMIT` e `OFFSET` são executados no banco.

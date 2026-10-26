CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS categoria (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS produto (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    marca VARCHAR(100),
    codigo_barras VARCHAR(50),
    categoria_id UUID REFERENCES categoria(id),
    preco_custo NUMERIC(10, 2),
    preco_venda NUMERIC(10, 2) CHECK (preco_venda IS NULL OR preco_venda >= 0),
    unidade VARCHAR(10) CHECK (unidade IS NULL OR btrim(unidade) <> ''),
    estoque INTEGER CHECK (estoque IS NULL OR estoque >= 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS produto_estatistica (
    produto_id UUID PRIMARY KEY REFERENCES produto(id) ON DELETE CASCADE,
    qtd_vendida INTEGER NOT NULL DEFAULT 0 CHECK (qtd_vendida >= 0)
);

CREATE INDEX IF NOT EXISTS idx_produto_categoria ON produto (categoria_id);
CREATE INDEX IF NOT EXISTS idx_produto_ativo ON produto (ativo);
CREATE INDEX IF NOT EXISTS idx_produto_nome_trgm
    ON produto USING gin (nome gin_trgm_ops);

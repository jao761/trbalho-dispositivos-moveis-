-- A fonte original nao possui preco_venda, unidade ou estoque.
-- Estes valores sao dados de demonstracao deterministas para a API.
-- O UPDATE e restrito a valores NULL para nao sobrescrever dados reais.

UPDATE produto AS p
SET
    unidade = COALESCE(p.unidade, CASE
        WHEN p.nome ~* '(^|[^a-z])m3([^a-z]|$)' THEN 'M3'
        WHEN p.nome ~* '(^|[^a-z])(kg|kilo|quilograma)([^a-z]|$)' THEN 'KG'
        WHEN p.nome ~* '(^|[^a-z])l([^a-z]|$)' THEN 'L'
        WHEN p.nome ~* '(^|[^a-z])m([^a-z]|$)' THEN 'M'
        ELSE 'UN'
    END),
    preco_venda = COALESCE(p.preco_venda, CASE
        WHEN p.categoria_id IN (
            '11111111-1111-1111-1111-000000000001',
            '11111111-1111-1111-1111-000000000007',
            '11111111-1111-1111-1111-000000000019'
        ) THEN round((25 + (s.numero % 20) * 3.25)::numeric, 2)
        WHEN p.categoria_id IN (
            '11111111-1111-1111-1111-000000000002',
            '11111111-1111-1111-1111-000000000015',
            '11111111-1111-1111-1111-000000000016'
        ) THEN round((89 + (s.numero % 25) * 17.50)::numeric, 2)
        WHEN p.categoria_id IN (
            '11111111-1111-1111-1111-000000000003',
            '11111111-1111-1111-1111-000000000005',
            '11111111-1111-1111-1111-000000000013'
        ) THEN round((12 + (s.numero % 18) * 4.75)::numeric, 2)
        WHEN p.categoria_id IN (
            '11111111-1111-1111-1111-000000000004',
            '11111111-1111-1111-1111-000000000010',
            '11111111-1111-1111-1111-000000000017'
        ) THEN round((35 + (s.numero % 22) * 8.90)::numeric, 2)
        ELSE round((18 + (s.numero % 24) * 6.25)::numeric, 2)
    END),
    estoque = COALESCE(p.estoque, CASE
        WHEN p.nome ~* '(^|[^a-z])m3([^a-z]|$)' THEN 5 + (s.numero % 16)
        WHEN p.nome ~* '(^|[^a-z])(kg|kilo|quilograma)([^a-z]|$)' THEN 10 + (s.numero % 31)
        ELSE 8 + (s.numero % 93)
    END)
FROM (
    SELECT
        id,
        right(id::text, 12)::integer AS numero
    FROM produto
) AS s
WHERE p.id = s.id
  AND (
      p.preco_venda IS NULL
      OR p.unidade IS NULL
      OR p.estoque IS NULL
  );

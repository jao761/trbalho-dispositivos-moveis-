INSERT INTO produto_estatistica (produto_id, qtd_vendida)
SELECT id, ((row_number() OVER (ORDER BY id) * 17)::integer % 500)
FROM produto
ON CONFLICT (produto_id) DO NOTHING;

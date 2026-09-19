insert into public.fundos
(
ticker,
nome,
segmento,
gestor,
descricao,
cotacao,
ultimo_dividendo,
dy_mensal,
ativo
)

values

(
'SNAG11',
'Suno Agro Fiagro',
'Agro',
'Suno Asset',
'Fundo de investimento do agronegócio com estratégia voltada para ativos ligados ao setor rural.',
10.50,
0.12,
1.14,
true
),

(
'RZTR11',
'Riza Terrax',
'Agro',
'Riza Asset',
'Fundo voltado para investimentos relacionados ao agronegócio e ativos imobiliários rurais.',
95.00,
1.00,
1.05,
true
)

ON CONFLICT (ticker)

DO UPDATE SET

nome = EXCLUDED.nome,

segmento = EXCLUDED.segmento,

gestor = EXCLUDED.gestor,

descricao = EXCLUDED.descricao,

cotacao = EXCLUDED.cotacao,

ultimo_dividendo = EXCLUDED.ultimo_dividendo,

dy_mensal = EXCLUDED.dy_mensal;
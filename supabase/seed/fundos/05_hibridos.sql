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
'BCFF11',
'BTG Pactual Fundo de Fundos',
'Híbrido',
'BTG Pactual',
'Fundo de fundos imobiliários com investimentos em diferentes segmentos do mercado.',
65.00,
0.55,
0.84,
true
),

(
'KFOF11',
'Kinea Fundo de Fundos',
'Híbrido',
'Kinea',
'Fundo de fundos imobiliários com carteira diversificada de FIIs.',
90.00,
0.75,
0.83,
true
),

(
'KNHY11',
'Kinea High Yield CRI',
'Híbrido',
'Kinea',
'Fundo imobiliário com estratégia diversificada em ativos de crédito imobiliário.',
95.00,
0.90,
0.95,
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
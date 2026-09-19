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
'XPML11',
'XP Malls',
'Shopping',
'XP Asset',
'Fundo imobiliário focado em participações em shopping centers e geração de renda através de ativos comerciais.',
102.50,
0.92,
0.90,
true
),

(
'VISC11',
'Vinci Shopping Centers',
'Shopping',
'Vinci Partners',
'Fundo imobiliário com investimentos em participações de shopping centers.',
110.00,
0.85,
0.77,
true
),

(
'HSML11',
'Hedge Shopping Praça da Moça',
'Shopping',
'Hedge Investments',
'Fundo imobiliário com foco em ativos do segmento de shopping centers.',
95.00,
0.75,
0.79,
true
),

(
'MALL11',
'Malls Brasil Plural',
'Shopping',
'Brasil Plural',
'Fundo imobiliário com investimentos em empreendimentos de shopping centers.',
90.00,
0.70,
0.78,
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
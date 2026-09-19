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
'MXRF11',
'Maxi Renda',
'Papel',
'XP Asset',
'Fundo imobiliário de papel com investimentos em ativos de crédito imobiliário.',
10.00,
0.10,
1.00,
true
),

(
'KNCR11',
'Kinea Rendimentos Imobiliários',
'Papel',
'Kinea',
'Fundo imobiliário focado em recebíveis imobiliários e geração de renda.',
105.00,
1.00,
0.95,
true
),

(
'KNIP11',
'Kinea Índices de Preços',
'Papel',
'Kinea',
'Fundo imobiliário de crédito imobiliário com ativos indexados à inflação.',
90.00,
0.90,
1.00,
true
),

(
'CPTS11',
'Capitânia Securities II',
'Papel',
'Capitânia',
'Fundo imobiliário de recebíveis e ativos ligados ao mercado imobiliário.',
8.50,
0.08,
0.94,
true
),

(
'RBRR11',
'RBR High Grade',
'Papel',
'RBR Asset',
'Fundo imobiliário de recebíveis imobiliários de perfil high grade.',
85.00,
0.80,
0.94,
true
),

(
'KNSC11',
'Kinea Securities',
'Papel',
'Kinea',
'Fundo imobiliário de recebíveis imobiliários.',
8.50,
0.09,
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
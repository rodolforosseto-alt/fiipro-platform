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
ativo,
patrimonio,
numero_cotistas,
imagem_logo
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
true,
null,
null,
null
),

(
'XPML11',
'XP Malls',
'Shopping',
'XP Asset',
'Fundo imobiliário focado em participação em shoppings centers.',
102.50,
0.92,
0.90,
true,
null,
null,
null
),

(
'HGLG11',
'CSHG Logística',
'Logística',
'Pátria',
'Fundo imobiliário de galpões logísticos.',
160.00,
1.10,
0.68,
true,
null,
null,
null
),

(
'KNCR11',
'Kinea Rendimentos Imobiliários',
'Papel',
'Kinea',
'Fundo imobiliário de recebíveis imobiliários.',
105.00,
1.00,
0.95,
true,
null,
null,
null
),

(
'KNIP11',
'Kinea Índices de Preços',
'Papel',
'Kinea',
'Fundo imobiliário de crédito imobiliário indexado à inflação.',
90.00,
0.90,
1.00,
true,
null,
null,
null
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
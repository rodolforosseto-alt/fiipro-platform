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
'KNRI11',
'Kinea Renda Imobiliária',
'Lajes',
'Kinea',
'Fundo imobiliário com investimentos em imóveis corporativos e galpões logísticos.',
150.00,
1.00,
0.66,
true
),

(
'PVBI11',
'VBI Prime Properties',
'Lajes',
'VBI Real Estate',
'Fundo imobiliário focado em imóveis corporativos de alto padrão.',
85.00,
0.70,
0.82,
true
),

(
'HGRE11',
'CSHG Real Estate',
'Lajes',
'Pátria',
'Fundo imobiliário com investimentos em imóveis comerciais corporativos.',
120.00,
0.85,
0.70,
true
),

(
'JSRE11',
'JS Real Estate Multigestão',
'Lajes',
'JS Asset',
'Fundo imobiliário com investimentos em imóveis comerciais e ativos imobiliários.',
75.00,
0.65,
0.86,
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
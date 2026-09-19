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
'HGLG11',
'CSHG Logística',
'Logística',
'Pátria',
'Fundo imobiliário focado em imóveis logísticos, como galpões industriais e centros de distribuição.',
160.00,
1.10,
0.68,
true
),

(
'BTLG11',
'BTG Pactual Logística',
'Logística',
'BTG Pactual',
'Fundo imobiliário de galpões logísticos voltado para geração de renda imobiliária.',
105.00,
0.85,
0.81,
true
),

(
'XPLG11',
'XP Log',
'Logística',
'XP Asset',
'Fundo imobiliário com investimentos em imóveis logísticos e industriais.',
95.00,
0.75,
0.79,
true
),

(
'VILG11',
'Vinci Logística',
'Logística',
'Vinci Partners',
'Fundo imobiliário com foco em ativos logísticos de qualidade.',
90.00,
0.70,
0.78,
true
),

(
'LVBI11',
'VBI Logístico',
'Logística',
'VBI Real Estate',
'Fundo imobiliário dedicado ao segmento de imóveis logísticos.',
105.00,
0.80,
0.76,
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
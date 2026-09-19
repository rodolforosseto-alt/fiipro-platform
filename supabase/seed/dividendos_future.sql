insert into public.dividendos
(
fundo_id,
data_pagamento,
valor
)

select

id,
'2026-10-15',
0.10

from public.fundos

where ticker = 'MXRF11';



insert into public.dividendos
(
fundo_id,
data_pagamento,
valor
)

select

id,
'2026-10-25',
0.92

from public.fundos

where ticker = 'XPML11';



insert into public.dividendos
(
fundo_id,
data_pagamento,
valor
)

select

id,
'2026-10-10',
1.10

from public.fundos

where ticker = 'HGLG11';